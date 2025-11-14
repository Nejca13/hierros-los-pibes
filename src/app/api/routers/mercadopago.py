import os
from datetime import datetime

import mercadopago
from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Query, Request, status
from pydantic import BaseModel

from app.api.models.cash_sessions import CashMovement, CashMovementType, CashSession
from app.api.models.order import KitchenStatus, Order
from app.api.models.user import User
from app.api.routers.order import serialize_order
from app.api.utils.emails_templates.emails_templates import build_order_receipt_email
from app.api.utils.fprint import fprint
from app.api.utils.send_email import send_email
from app.api.utils.ws_manager import manager

# Inicializamos el SDK de MercadoPago
sdk = mercadopago.SDK(os.getenv("MERCADOPAGO_ACCESS_TOKEN"))
fprint(
    f"SDK de MercadoPago inicializado con el token: {os.getenv('MERCADOPAGO_ACCESS_TOKEN')}",
    color="GREEN",
)

router = APIRouter(
    prefix="/mercadopago",
    tags=["Mercado Pago"],
)


# Modelo opcional para validar el payload del webhook
class MercadoPagoWebhook(BaseModel):
    id: str
    live_mode: bool
    type: str
    date_created: str
    application_id: str
    user_id: str
    version: str
    api_version: str
    action: str
    data: dict  # {"id": "payment_id_o_otra_data"}


@router.post("/webhook/", status_code=status.HTTP_200_OK)
async def mercado_pago_webhook(
    request: Request, data_id: str = Query(None), event_type: str = Query(None)
):

    try:
        # Procesar datos desde query parameters
        if not data_id or not event_type:
            # Intentar leer desde el cuerpo si no están en la URL
            payload = await request.json()
            data_id = payload.get("data", {}).get("id")
            event_type = payload.get("type")

        if not data_id or not event_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se encontró data.id o type en la solicitud",
            )

        fprint(f"Evento recibido: {event_type}, ID: {data_id}", color="BLUE")

        # Procesar el evento de pago
        if event_type == "payment":
            fprint(f"Procesando pago. ID: {data_id}", color="GREEN")

            # Obtener detalles del pago desde Mercado Pago
            try:
                payment_response = sdk.payment().get(data_id)
                payment = payment_response.get("response")
            except Exception as e:
                fprint(f"Error al obtener detalles del pago: {str(e)}", color="RED")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Error al obtener el pago: {str(e)}",
                )

            # Validar external_reference (ID de la orden)
            external_reference = payment.get("external_reference")
            if not external_reference:
                fprint(
                    f"No se encontró external_reference en el pago: {payment}",
                    color="RED",
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No se encontró external_reference en el pago",
                )

            # Buscar la orden en la base de datos usando el external_reference
            try:
                order = await Order.get(PydanticObjectId(external_reference))
                if order:
                    try:
                        payment_status = payment.get(
                            "status"
                        )  # approved, pending, etc.
                        status_map = {
                            "approved": "paid",
                            "pending": "pending",
                            "rejected": "failed",
                        }
                        order.status = status_map.get(payment_status, "unknown")
                        order.updated_at = datetime.utcnow()
                        await order.save()

                        fprint(
                            f"Orden actualizada. ID: {external_reference}, Estado: {order.status}",
                            color="GREEN",
                        )

                        if order.status == "paid":

                            order.kitchen_status = KitchenStatus.pending

                            order.updated_at = datetime.utcnow()
                            await order.save()

                            cash_session = await CashSession.find_one(
                                {
                                    "user_id": order.attended_by_user.user_id,
                                    "active": True,
                                }
                            )
                            """ # Actualizar la caja
                            if cash_session:
                                cash_session.movements.append(
                                    {
                                        "amount": order.total,
                                        "reason": f"{order.id}",
                                        "type": "income",
                                        "payment_method": "transferencia",
                                    }
                                )
                                await cash_session.save() """

                            movement = CashMovement(
                                payment_method=order.payment_method,
                                amount=order.total,
                                reason=f"{order.id}",
                                type=CashMovementType.income,
                            )

                            cash_session.movements.append(movement)
                            await cash_session.save()

                            order_dict = serialize_order(order)

                            # Notificar usando el ws a kitchen
                            await manager.broadcast(
                                "kitchen", {"type": "order_sent", "order": order_dict}
                            )

                            fprint(
                                f"Orden pagada. ID: {external_reference}, Estado: {order.status}",
                                color="GREEN",
                            )
                            if order.guest_email:
                                email = order.guest_email
                            elif order.user_id:
                                user = await User.get(PydanticObjectId(order.user_id))
                                email = user.email if user else None
                            else:
                                email = None

                            subject = "Gracias por tu compra en Hierro Los Pibes"
                            message_html = build_order_receipt_email(order)

                            if email:
                                is_sent = await send_email(
                                    destinatario=email,
                                    asunto=subject,
                                    mensaje_html=message_html,
                                )

                                if is_sent:
                                    fprint("Correo enviado exitosamente", color="GREEN")

                                    # devolver 200 a Mercado Pago
                                    return {"status": "success"}
                                else:
                                    fprint(
                                        f"Error al enviar correo de confirmación al cliente. ID: {external_reference}",
                                        color="RED",
                                    )
                            else:
                                fprint(
                                    f"No se encontró el correo del cliente. ID: {external_reference}",
                                    color="RED",
                                )

                    except Exception as e:
                        fprint(f"Error al actualizar la orden: {str(e)}", color="RED")
                        raise HTTPException(
                            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Error al buscar o actualizar la orden: {str(e)}",
                        )
                else:
                    fprint(
                        f"No se encontró la orden. ID: {external_reference}",
                        color="RED",
                    )
            except Exception as e:
                fprint(f"Error al actualizar la orden: {str(e)}", color="RED")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Error al buscar o actualizar la orden: {str(e)}",
                )

        else:
            fprint(f"Evento no manejado: {event_type}", color="YELLOW")

        return {"status": "success"}  # Responder 200 a Mercado Pago

    except Exception as e:
        fprint(f"Error procesando el webhook: {str(e)}", color="RED")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error procesando el webhook: {str(e)}",
        )
