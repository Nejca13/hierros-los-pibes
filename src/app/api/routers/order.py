import csv
import io
import json
import os
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import List, Optional
from warnings import filters

import jwt
import mercadopago
from beanie import PydanticObjectId
from fastapi import APIRouter, Body, Cookie, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from pydantic import BaseModel, ValidationInfo, field_validator

from app.api.core.settings import ALGORITHM, SECRET_KEY
from app.api.dependencies.auth import get_current_user
from app.api.models.cash_sessions import CashMovement, CashMovementType, CashSession
from app.api.models.order import (
    KitchenStatus,
    Order,
    OrderItem,
    PaymentBreakdown,
    PaymentOrigin,
    UserSnapshot,
)
from app.api.models.product import ProductDetail, ProductDocument
from app.api.models.user import User, UserResponse
from app.api.utils.fprint import fprint
from app.api.utils.report_helper import get_orders_report_logic
from app.api.utils.ws_manager import manager

sdk = mercadopago.SDK(os.getenv("MERCADOPAGO_ACCESS_TOKEN"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login/")

router = APIRouter(prefix="/orders", tags=["Ordenes"])


async def build_order_details(order: Order) -> list[ProductDetail]:
    details = []

    for item in order.products:
        product = await ProductDocument.get(item.product_id)
        if not product:
            continue  # Podés loguear si querés rastrear productos faltantes

        unit_price = product.price
        total_price = unit_price * item.quantity

        details.append(
            ProductDetail(
                product_id=str(product.id),
                name=product.name,
                image=product.image,
                quantity=item.quantity,
                unit_price=unit_price,
                total_price=total_price,
            )
        )

    return details


class OrderCreate(BaseModel):
    user_id: Optional[str] = None
    guest_email: Optional[str] = None
    guest_name: Optional[str] = None
    products: List[OrderItem]
    table: Optional[str]
    note: Optional[str]
    payment_method: str = "efectivo"
    payment_origin: Optional[PaymentOrigin] = None
    paid: bool = False
    sent_to_kitchen: Optional[bool] = False
    displayed_to_client: Optional[bool] = False
    is_internal_order: Optional[bool] = False
    payment_breakdown: Optional[List[PaymentBreakdown]] = None

    @field_validator("guest_email")
    @classmethod
    def validate_guest(cls, v, info: ValidationInfo):
        data = info.data
        if not data.get("user_id") and not v:
            raise ValueError("Debe enviarse 'user_id' o 'guest_email'")
        return v


async def get_next_pickup_number() -> int:
    last_order = await Order.find_all().sort("-pickup_number").first_or_none()
    return (
        last_order.pickup_number if last_order and last_order.pickup_number else 0
    ) + 1


@router.post("/create/", response_model=dict)
async def create_order(
    order: OrderCreate, current_user: UserResponse = Depends(get_current_user)
):
    payer_name = "Invitado"
    payer_email = ""

    if order.user_id:
        user = await User.get(PydanticObjectId(order.user_id))
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        payer_name = user.name
        payer_email = user.email
    else:
        if not order.guest_email:
            raise HTTPException(
                status_code=400, detail="guest_email is required for guest orders"
            )
        payer_email = order.guest_email
        payer_name = order.guest_name

    cash_session = await CashSession.find_one(
        {"user_id": str(current_user.id), "active": True}
    )
    if not cash_session:
        raise HTTPException(
            status_code=400,
            detail="Primero debera abrir una caja activa para poder generar ordenes.",
        )

    items = []
    total = 0

    if order.products == [] or order.products == None:
        raise HTTPException(
            status_code=400, detail="Order must have at least one product"
        )

    for item in order.products:
        product = await ProductDocument.get(PydanticObjectId(item.product_id))

        if product.inventory_count != None and product.inventory_count >= item.quantity:
            product.inventory_count -= item.quantity
            await product.save()
        else:
            raise HTTPException(status_code=400, detail=f"Product is out of stock")

        if not product:
            raise HTTPException(
                status_code=404, detail=f"Product {item.product_id} not found"
            )
        if not product.available:
            raise HTTPException(
                status_code=400, detail=f"Product {item.product_id} is not available"
            )

        items.append(
            {
                "title": product.name,
                "image": product.image,
                "quantity": item.quantity,
                "description": product.description,
                "unit_price": product.price,
                "picture_url": product.image,
                "currency_id": "ARS",
            }
        )
        if order.payment_breakdown:
            total = sum([p.amount for p in order.payment_breakdown])
        else:
            total += product.price * item.quantity

        # Construyo el snapshot del empleado que atiende
    attended_by = UserSnapshot(
        user_id=str(current_user.id),
        name=current_user.name,
        email=current_user.email,
    )

    # Crear orden con datos iniciales
    new_order = Order(
        user_id=order.user_id,
        guest_email=order.guest_email,
        guest_name=payer_name,
        products=order.products,
        products_details=await build_order_details(order),
        table=order.table,
        note=order.note,
        total=total,
        pickup_number=await get_next_pickup_number(),
        kitchen_status=KitchenStatus.pending,
        sent_to_kitchen=False,
        payment_breakdown=order.payment_breakdown,
        status="paid" if order.payment_method == "caja" and order.paid else "pending",
        payment_method=order.payment_method,
        payment_origin=order.payment_origin,
        payment_url=None,
        attended_by_user=attended_by,
        is_internal_order=order.is_internal_order,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )

    # Si es pago en caja, no se genera preferencia
    if order.payment_origin == "caja":
        try:
            if order.is_internal_order:
                # Si es una orden interna, no se genera movimiento de caja ni se envía a cocina ni se marca como pagada
                new_order.status = "paid"
                new_order.kitchen_status = KitchenStatus.finished
                new_order.sent_to_kitchen = True
                new_order.finished_at = datetime.utcnow()
                new_order.displayed_to_client = True
                new_order = await new_order.insert()
                new_order.id = str(new_order.id)
                order_serialized = serialize_order(new_order)
                return {"order": order_serialized, "payment_url": None}

            if order.paid:
                new_order.status = "paid"
            if order.sent_to_kitchen:
                new_order.kitchen_status = KitchenStatus.sent
                new_order.sent_to_kitchen = True
            if order.displayed_to_client:
                new_order.displayed_to_client = True
                new_order.kitchen_status = KitchenStatus.finished
                new_order.sent_to_kitchen = True
            new_order.finished_at = datetime.utcnow()
            new_order = await new_order.insert()
            if order.payment_breakdown:
                for p in order.payment_breakdown:
                    movement = CashMovement(
                        payment_method=p.method,
                        amount=p.amount,
                        reason=f"Nueva venta para el pedido ID:{new_order.id}",
                        type=CashMovementType.income,
                    )
                    cash_session.movements.append(movement)
            else:
                movement = CashMovement(
                    payment_method=order.payment_method,
                    amount=total,
                    reason=f"Nueva venta para el pedido ID:{new_order.id}",
                    type=CashMovementType.income,
                )
                cash_session.movements.append(movement)

            await cash_session.save()
            order_serialized = serialize_order(new_order)

            if order.sent_to_kitchen:
                await manager.broadcast(
                    "kitchen",
                    {
                        "type": "order_sent",
                        "order": order_serialized,
                        "message": f"Nuevo pedido de {payer_name} ({payer_email})",
                    },
                )
            if order.displayed_to_client:
                await manager.broadcast(
                    "screen",
                    {
                        "type": "display_pickup",
                        "pickup_number": new_order.pickup_number,
                        "name": new_order.guest_name or "Cliente",
                    },
                )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error creating order: {e}")
        new_order.id = str(new_order.id)
        new_order.user_id = str(new_order.user_id)
        new_order.created_at = new_order.created_at.isoformat()
        new_order.updated_at = new_order.updated_at.isoformat()
        new_order.finished_at = (
            new_order.finished_at.isoformat() if new_order.finished_at else None
        )
        await manager.broadcast(
            "orders",
            {
                "type": "new_order",
                "order": new_order.dict(),
                "message": f"Nuevo pedido de {payer_name} ({payer_email})",
            },
        )
        return {"order": new_order.dict(), "payment_url": None}

    # --- Pago con MercadoPago ---
    if len(items) > 1:
        description = ", ".join(
            [
                f"{item['quantity']}x {item['title']} : $ {item['unit_price'] * item['quantity']}"
                for item in items
            ]
        )
        preference_items = [
            {
                "title": "Pedido Hierro Los Pibes",
                "description": description,
                "quantity": 1,
                "unit_price": total,
                "currency_id": "ARS",
            }
        ]
    else:
        preference_items = items

    # Guardar new_order en la DB
    try:
        new_order = await new_order.insert()
        """ movement = CashMovement(
            amount=total,
            reason=f"{new_order.id}",
            type=CashMovementType.income,
        )

        cash_session.movements.append(movement)
        await cash_session.save() """
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error creating order: {e}")

    preference_data = {
        "items": preference_items,
        "payer": {
            "id": str(order.user_id) if order.user_id else None,
            "name": payer_name,
            "email": payer_email,
        },
        "back_urls": {
            "success": "https://sportiumcafe.com/pago-exitoso/",
            "failure": "https://sportiumcafe.com/pago-fallido/",
            "pending": "https://sportiumcafe.com/pago-pendiente/",
        },
        "auto_return": "approved",
        "external_reference": str(new_order.id),
    }

    if not order.user_id:
        # eliminar payer.id
        del preference_data["payer"]["id"]

    fprint(new_order, color="GREEN")

    fprint(preference_data, color="GREEN")
    preference_response = sdk.preference().create(preference_data)
    if preference_response["status"] != 201:

        raise HTTPException(
            status_code=400, detail="Error creating payment preference."
        )
    print("Status:", preference_response["status"])
    print("Init point:", preference_response["response"].get("init_point"))
    payment_url = preference_response["response"]["init_point"]

    try:
        new_order.payment_url = payment_url
        await new_order.save()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error saving order: {e}")

    # Convertir IDs a string para respuesta
    new_order.id = str(new_order.id)
    new_order.user_id = str(new_order.user_id)
    new_order.created_at = new_order.created_at.isoformat()
    new_order.updated_at = new_order.updated_at.isoformat()
    new_order.finished_at = (
        new_order.finished_at.isoformat() if new_order.finished_at else None
    )

    await manager.broadcast(
        "orders",
        {
            "type": "new_order",
            "order": new_order.dict(),
            "message": f"Nuevo pedido de {payer_name} ({payer_email})",
        },
    )

    return {"order": new_order.dict(), "payment_url": payment_url}


@router.put("/{order_id}/", response_model=Order)
async def update_order(order_id: str, order_data: str = Body(...)):
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order_data = json.loads(order_data)
    update_fields = order_data.copy()
    update_fields["updated_at"] = datetime.utcnow()

    # --- Enviar notificaciones de actualización segun donde este el pedido ---
    if order.sent_to_kitchen:
        await manager.broadcast("kitchen", {"type": "order_sent", "order": {}})
    if order.displayed_to_client:
        await manager.broadcast(
            "screen",
            {
                "type": "display_pickup",
                "pickup_number": order.pickup_number,
                "name": order.guest_name or "Cliente",
            },
        )

    # --- Si vienen productos nuevos ---
    if "products" in update_fields:
        # Restaurar stock de productos anteriores
        for item in order.products:
            product = await ProductDocument.get(PydanticObjectId(item.product_id))
            if product and product.inventory_count is not None:
                product.inventory_count += item.quantity
                await product.save()

        # Validar y descontar nuevo stock
        for item in update_fields["products"]:
            product = await ProductDocument.get(PydanticObjectId(item["product_id"]))
            if not product:
                raise HTTPException(
                    status_code=404, detail=f"Product {item['product_id']} not found"
                )

            if product.inventory_count is not None:
                if product.inventory_count < item["quantity"]:
                    raise HTTPException(
                        status_code=400, detail=f"Not enough stock for {product.name}"
                    )
                product.inventory_count -= item["quantity"]
                await product.save()

        # Recalcular detalles y total
        temp_order = Order(**{**order.dict(), "products": update_fields["products"]})
        update_fields["products_details"] = await build_order_details(temp_order)
        update_fields["total"] = sum(
            item.total_price for item in update_fields["products_details"]
        )

    # --- Actualizar campos restantes ---
    for field, value in update_fields.items():
        setattr(order, field, value)

    await order.save()

    # --- Actualizar movimientos de caja ---
    if order.payment_origin == PaymentOrigin.caja:
        cash_session = await CashSession.find_one(CashSession.active == True)
        if cash_session:
            # Remover movimiento anterior si existe
            cash_session.movements = [
                m
                for m in cash_session.movements
                if f"pedido ID:{order.id}" not in (m.reason or "")
            ]

            if not order.cancelled:
                if order.payment_breakdown:
                    for p in order.payment_breakdown:
                        movement = CashMovement(
                            payment_method=p.method,
                            amount=p.amount,
                            reason=f"Venta actualizada para el pedido ID:{order.id}",
                            type=CashMovementType.income,
                        )
                        cash_session.movements.append(movement)
                else:
                    movement = CashMovement(
                        payment_method=order.payment_method,
                        amount=order.total,
                        reason=f"Venta actualizada para el pedido ID:{order.id}",
                        type=CashMovementType.income,
                    )
                    cash_session.movements.append(movement)

            await cash_session.save()

    return order


@router.get("/", response_model=dict)
async def get_orders(
    page: int = 1,
    limit: int = 25,
    user_id: Optional[str] = None,
    guest_email: Optional[str] = None,
    payment_method: Optional[str] = None,
    payment_origin: Optional[str] = None,
    min_total: Optional[float] = None,
    max_total: Optional[float] = None,
    status: Optional[str] = None,
    table: Optional[str] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    kitchen_status: Optional[str] = None,
    displayed_to_client: Optional[bool] = None,
    sent_to_kitchen: Optional[bool] = None,
    sort_type: Optional[str] = "desc",
    attended_by_user_id: Optional[str] = None,
    current_user: Optional[User] = Depends(get_current_user),
):
    skip = (page - 1) * limit
    filters = {}

    filters["is_internal_order"] = False  # Excluir órdenes internas por defecto

    if sort_type == "asc":
        sort = "created_at"
    else:
        sort = "-created_at"
    if current_user:

        if current_user.role == "superadmin":
            # Continuar sin asignar el filtro
            pass

        else:
            if not attended_by_user_id:
                attended_by_user_id = str(current_user.id)

    if user_id:
        filters["user_id"] = user_id
    if guest_email:
        filters["guest_email"] = guest_email
    if payment_method:
        filters["payment_method"] = payment_method
    if payment_origin:
        filters["payment_origin"] = payment_origin
    if kitchen_status:
        filters["kitchen_status"] = kitchen_status
    if min_total is not None or max_total is not None:
        filters["total"] = {}
        if min_total is not None:
            filters["total"]["$gte"] = min_total
        if max_total is not None:
            filters["total"]["$lte"] = max_total
    if status:
        filters["status"] = status
    if table:
        filters["table"] = table
    if from_date or to_date:
        filters["created_at"] = {}
        if from_date:
            filters["created_at"]["$gte"] = from_date
        if to_date:
            filters["created_at"]["$lte"] = to_date
    if attended_by_user_id:
        filters["attended_by_user.user_id"] = attended_by_user_id
    if displayed_to_client is not None:
        filters["displayed_to_client"] = displayed_to_client
    if sent_to_kitchen is not None:
        filters["sent_to_kitchen"] = sent_to_kitchen

    total = await Order.find(filters).count()

    orders = await Order.find(filters).sort(sort).skip(skip).limit(limit).to_list()

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "orders": orders,
    }


@router.get("/by-user/{user_id}/", response_model=List[Order])
async def get_orders_by_user(user_id: str):
    return await Order.find(Order.user_id == user_id).sort("-created_at").to_list()


@router.delete("/{order_id}/")
async def delete_order(order_id: str):
    order = await Order.get(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    await order.delete()
    return {"detail": "Order deleted"}


@router.get("/orders/report/")
async def get_orders_report(
    from_date: datetime = Query(..., description="Fecha desde (YYYY-MM-DD)"),
    to_date: datetime = Query(
        datetime.utcnow(), description="Fecha hasta (YYYY-MM-DD)"
    ),
    attended_by_user_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
):
    to_date = to_date.replace(hour=23, minute=59, second=59, microsecond=999999)
    current_cash_session = await CashSession.find_one(
        {"user_id": str(current_user.id), "active": True}
    )

    if current_user.role == "admin":
        attended_by_user_id = str(current_user.id)

        if current_cash_session:
            from_date = current_cash_session.opened_at
            to_date = datetime.utcnow()

    # Ajuste filtros
    filters = {}
    if attended_by_user_id:
        filters["attended_by_user.user_id"] = attended_by_user_id

    # Traer órdenes
    if attended_by_user_id:
        orders = await Order.find(
            Order.created_at >= from_date,
            Order.created_at <= to_date,
            Order.attended_by_user.user_id == attended_by_user_id,
        ).to_list()
    else:
        orders = await Order.find(
            Order.created_at >= from_date, Order.created_at <= to_date
        ).to_list()

    # Contadores generales
    total_orders = len(orders)
    total_revenue = 0.0
    pending_count = 0
    failed_count = 0

    # Contadores por método de pago
    cash_revenue = 0.0
    transfer_revenue = 0.0

    # Resumen de productos vendidos
    product_summary = defaultdict(lambda: {"quantity": 0, "total_sales": 0.0})

    for order in orders:
        if order.status == "paid":
            total_revenue += order.total

            # Acumular por método de pago mixto o único
            if order.payment_breakdown:
                for p in order.payment_breakdown:
                    if p.method == "efectivo":
                        cash_revenue += p.amount
                    elif p.method == "transferencia":
                        transfer_revenue += p.amount
            else:
                if order.payment_method == "efectivo":
                    cash_revenue += order.total
                elif order.payment_method == "transferencia":
                    transfer_revenue += order.total

            # Acumular productos vendidos
            for item in order.products_details:
                product_summary[item.product_id]["quantity"] += item.quantity
                product_summary[item.product_id]["total_sales"] += item.total_price

        elif order.status == "pending":
            pending_count += 1
        elif order.status == "failed":
            failed_count += 1

    # Calcular egresos (expenses) desde la sesión actual
    cash_expense = 0.0
    transfer_expense = 0.0

    if current_cash_session:
        for movement in current_cash_session.movements:
            if movement.type == "expense":
                if movement.payment_method == "efectivo":
                    cash_expense += movement.amount
                elif movement.payment_method == "transferencia":
                    transfer_expense += movement.amount

    # Restar egresos del ingreso bruto
    net_cash_revenue = cash_revenue - cash_expense
    net_transfer_revenue = transfer_revenue - transfer_expense

    # Obtener productos para completar el resumen
    product_ids = list(product_summary.keys())
    products = await ProductDocument.find(
        {"_id": {"$in": [PydanticObjectId(pid) for pid in product_ids]}}
    ).to_list()
    product_map = {str(prod.id): prod for prod in products}

    all_products = []
    for pid, summary in product_summary.items():
        prod = product_map.get(pid)
        if not prod:
            continue
        all_products.append(
            {
                "product_id": pid,
                "name": prod.name,
                "image": prod.image,
                "price": prod.price,
                "quantity_sold": summary["quantity"],
                "total_sales": summary["total_sales"],
            }
        )

    return {
        "from_date": from_date,
        "to_date": to_date,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "cash_revenue": cash_revenue,
        "transfer_revenue": transfer_revenue,
        "cash_expense": cash_expense,
        "transfer_expense": transfer_expense,
        "net_cash_revenue": net_cash_revenue,
        "net_transfer_revenue": net_transfer_revenue,
        "pending_count": pending_count,
        "failed_count": failed_count,
        "products_sold": all_products,
        "total_expenses": cash_expense + transfer_expense,
    }


from datetime import datetime


def serialize_order(order: Order) -> dict:
    data = order.dict()
    data["id"] = str(data["id"])
    data["user_id"] = str(data["user_id"])
    if data.get("finished_at"):
        data["finished_at"] = data["finished_at"].isoformat()
    if data.get("created_at"):
        data["created_at"] = data["created_at"].isoformat()
    if data.get("updated_at"):
        data["updated_at"] = data["updated_at"].isoformat()
    return data


@router.post("/send-to-kitchen/{order_id}/")
async def send_order_to_kitchen(order_id: str):
    order = await Order.get(order_id)

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.kitchen_status != KitchenStatus.pending:
        raise HTTPException(status_code=400, detail="Pedido ya fue enviado a cocina")

    order.kitchen_status = KitchenStatus.sent
    order.sent_to_kitchen = True
    await order.save()

    # Convierte las fechas a formato ISO 8601 para evitar el error de serialización
    order_dict = serialize_order(order)

    # Transmitir el pedido convertido y almacenar el mensaje en memoria
    await manager.broadcast("kitchen", {"type": "order_sent", "order": order_dict})
    return {"message": "Pedido enviado a cocina"}


@router.post("/finish-and-display/{order_id}/")
async def finish_and_display(order_id: str):
    order = await Order.get(order_id)

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.kitchen_status = KitchenStatus.finished
    order.finished_at = datetime.utcnow()
    order.displayed_to_client = True
    await order.save()

    order_dict = serialize_order(order)

    await manager.broadcast("cashier", {"type": "order_ready", "order_id": order_id})
    await manager.broadcast("orders", {"type": "order_finished", "order": order_dict})
    await manager.broadcast(
        "screen",
        {
            "type": "display_pickup",
            "pickup_number": order.pickup_number,
            "name": order.guest_name or "Cliente",
        },
    )

    return {"message": "Pedido finalizado y mostrado en pantalla"}


async def get_token_from_cookie(access_token: str = Cookie(None)):
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se encontró token de sesión",
        )
    return access_token


@router.get("/orders/report/close-cash-auto/")
async def close_cash_auto_report(
    token: str = Depends(get_token_from_cookie),
    current_user: UserResponse = Depends(get_current_user),
):
    # Decodifico sin validar exp ni iat
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={"verify_exp": False, "verify_iat": False},
        )
    except JWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token inválido")

    iat_ts = payload.get("iat")
    if not isinstance(iat_ts, (int, float)):
        raise HTTPException(400, "Token sin claim 'iat' válido")

    # Ambas fechas UTC-aware
    from_date = datetime.fromtimestamp(iat_ts, tz=timezone.utc)
    to_date = datetime.now(timezone.utc)

    return await get_orders_report_logic(
        from_date,
        to_date,
        str(current_user.id),
        adjust_end_of_day=False,
    )


@router.get("/orders/report/close-cash-auto/csv/")
async def download_report_csv(
    token: str = Depends(get_token_from_cookie),
    current_user: UserResponse = Depends(get_current_user),
):

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={"verify_exp": False, "verify_iat": False},
        )
    except JWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token inválido")
    # Generar el reporte
    report = await get_orders_report_logic(
        from_date=datetime.fromtimestamp(payload["iat"], tz=timezone.utc),
        to_date=datetime.now(timezone.utc),
        attended_by_user_id=str(current_user.id),
        adjust_end_of_day=False,
    )

    # Crear un buffer en memoria
    buffer = io.StringIO()
    writer = csv.writer(buffer)

    ARG_TZ = timezone(timedelta(hours=-3))
    from_date_str = report["from_date"].astimezone(ARG_TZ).strftime("%d/%m/%Y %H:%M:%S")
    to_date_str = report["to_date"].astimezone(ARG_TZ).strftime("%d/%m/%Y %H:%M:%S")

    # Metadatos del reporte
    writer.writerow(["Campo", "Valor"])
    writer.writerow(["Atendido por", current_user.name + " " + current_user.last_name])
    writer.writerow(["Desde", from_date_str])
    writer.writerow(["Hasta", to_date_str])
    writer.writerow(["Pendientes", report["pending_count"]])
    writer.writerow(["Fallidas", report["failed_count"]])
    writer.writerow([])
    # Ingresos
    writer.writerow(["Total ingreso", report["total_revenue"]])
    writer.writerow(["• Efectivo", report["cash_revenue"]])
    writer.writerow(["• Transferencia", report["transfer_revenue"]])
    writer.writerow([])

    # Detalle de productos
    writer.writerow(
        [
            "Product ID",
            "Nombre",
            "Precio unitario",
            "Cantidad vendida",
            "Total ventas",
        ]
    )
    for p in report["products_sold"]:
        writer.writerow(
            [
                p["product_id"],
                p["name"],
                p["price"],
                p["quantity_sold"],
                p["total_sales"],
            ]
        )

    buffer.seek(0)
    now_str = datetime.utcnow().strftime("%Y%m%d_%H%M")
    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=reporte_{now_str}.csv"},
    )


# GET solo devolver ordenes internas
@router.get("/internal-orders/", response_model=dict)
async def get_internal_orders(
    page: int = 1,
    limit: int = 25,
    user_id: Optional[str] = None,
    sort_type: Optional[str] = "desc",
    current_user: UserResponse = Depends(get_current_user),
):
    skip = (page - 1) * limit
    filters = {"is_internal_order": True}
    if user_id and current_user.role == "admin":
        raise HTTPException(
            status_code=403, detail="No tienes permiso para filtrar por usuario"
        )
    if not user_id and current_user.role == "admin":
        filters["user_id"] = str(current_user.id)
    if user_id:
        filters["user_id"] = user_id
    if sort_type == "asc":
        sort = "created_at"
    else:
        sort = "-created_at"
    total = await Order.find(filters).count()
    orders = await Order.find(filters).sort(sort).skip(skip).limit(limit).to_list()

    if page < 1 or limit < 1:
        return {
            "success": False,
            "message": "Page y limit deben ser mayores a 0",
            "data": [],
        }

    if limit > 100:
        return {
            "success": False,
            "message": "Limit no puede superar los 100 ítems por página",
            "data": [],
        }

    if page > (total // limit) + 1:
        return {
            "success": False,
            "message": "Page excede el total de páginas disponibles",
            "data": [],
        }

    if total < skip:
        return {
            "success": False,
            "message": "Skip excede la cantidad total de ítems disponibles",
            "data": [],
        }

    if not orders or total == 0:
        return {
            "success": False,
            "message": "No se encontraron órdenes internas",
            "data": [],
        }

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "orders": orders,
    }
