# app/api/utils/report_helpers.py
from collections import defaultdict
from datetime import datetime
from typing import Optional

from beanie import PydanticObjectId

from app.api.models.order import Order
from app.api.models.product import ProductDocument


async def get_orders_report_logic(
    from_date: datetime,
    to_date: datetime,
    attended_by_user_id: Optional[str] = None,
    adjust_end_of_day: bool = True,  # ← nuevo parámetro
):
    # Ajustar only si viene en modo genérico
    if adjust_end_of_day:
        to_date = to_date.replace(hour=23, minute=59, second=59, microsecond=999999)

    # Filtrar órdenes
    query = [
        Order.created_at >= from_date,
        Order.created_at <= to_date,
    ]
    if attended_by_user_id:
        query.append(Order.attended_by_user.user_id == attended_by_user_id)

    orders = await Order.find(*query).to_list()

    # Inicializar contadores
    total_orders = len(orders)
    total_revenue = 0.0
    pending_count = failed_count = 0
    cash_revenue = transfer_revenue = 0.0
    product_summary = defaultdict(lambda: {"quantity": 0, "total_sales": 0.0})

    # Recorrer
    for o in orders:
        if o.status == "paid":
            total_revenue += o.total
            if o.payment_method == "efectivo":
                cash_revenue += o.total
            else:
                transfer_revenue += o.total

            for item in o.products_details:
                ps = product_summary[item.product_id]
                ps["quantity"] += item.quantity
                ps["total_sales"] += item.total_price

        elif o.status == "pending":
            pending_count += 1
        else:
            failed_count += 1

    # Traer datos de productos
    product_ids = [PydanticObjectId(pid) for pid in product_summary]
    prods = await ProductDocument.find({"_id": {"$in": product_ids}}).to_list()
    prod_map = {str(p.id): p for p in prods}

    all_products = []
    for pid, summary in product_summary.items():
        p = prod_map.get(pid)
        if not p:
            continue
        all_products.append(
            {
                "product_id": pid,
                "name": p.name,
                "image": p.image,
                "price": p.price,
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
        "pending_count": pending_count,
        "failed_count": failed_count,
        "products_sold": all_products,
    }
