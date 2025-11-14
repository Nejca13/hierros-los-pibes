from typing import Optional
from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException
from app.api.models.product import ProductDocument
from app.api.models.product_waste import ProductWaste
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/products-waste", tags=["Desperdicio de Productos"])


class WasteRequest(BaseModel):
    product_id: str
    quantity: int
    reason: str


@router.post("/create/", response_model=ProductWaste)
async def register_product_waste(data: WasteRequest):
    product = await ProductDocument.get(data.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    if data.quantity <= 0:
        raise HTTPException(status_code=400, detail="La cantidad debe ser mayor a cero")
    if not data.reason:
        raise HTTPException(status_code=400, detail="El motivo es obligatorio")
    if product.inventory_count is None:
        raise HTTPException(
            status_code=400, detail="El producto no tiene inventario definido"
        )
    if data.quantity > product.inventory_count:
        raise HTTPException(
            status_code=400,
            detail="La cantidad de desperdicio no puede ser mayor que el inventario disponible",
        )

    # Update inventory
    product.inventory_count -= data.quantity
    await product.save()

    waste = ProductWaste(
        product_id=str(product.id),
        product_name=product.name,
        product_image=product.image,
        quantity=data.quantity,
        reason=data.reason,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    await waste.insert()

    return waste


@router.get("/", response_model=dict)
async def get_product_waste(
    page: int = 1,
    limit: int = 25,
    product_id: Optional[str] = None,
    reason: Optional[str] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    sort_type: Optional[str] = "desc",
):
    skip = (page - 1) * limit
    filters = {}

    if product_id:
        if not PydanticObjectId.is_valid(product_id):
            raise HTTPException(status_code=400, detail="ID de producto no válido")
        filters["product_id"] = product_id
    if reason:
        filters["reason"] = {"$regex": reason, "$options": "i"}
    if from_date or to_date:
        filters["created_at"] = {}
        if from_date:
            filters["created_at"]["$gte"] = from_date
        if to_date:
            filters["created_at"]["$lte"] = to_date

    sort = "created_at" if sort_type == "asc" else "-created_at"

    total = await ProductWaste.find(filters).count()
    wastes = (
        await ProductWaste.find(filters).sort(sort).skip(skip).limit(limit).to_list()
    )

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "wastes": wastes,
    }
