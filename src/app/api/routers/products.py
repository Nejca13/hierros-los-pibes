from datetime import datetime
import json
from beanie import PydanticObjectId
from fastapi import APIRouter, File, Form, HTTPException, Query, UploadFile
from typing import List, Optional

from pydantic import ValidationError
from unidecode import unidecode
from app.api.models.category import Category
from app.api.models.product import Product, ProductDocument
from app.api.utils.save_image import save_image

router = APIRouter(prefix="/products", tags=["Productos"])


# GET /productos
@router.get("/")
async def get_products(category: Optional[str] = None, page: int = 1, limit: int = 10):
    skip = (page - 1) * limit
    query = {}

    if category:
        query["category"] = category

    products = await ProductDocument.find(query).skip(skip).limit(limit).to_list()
    return products


# Normalizar el nombre y la descripción del producto sin acentos y con minusculas
def normalize_text(text: str) -> str:
    return unidecode(text).lower().strip()


# POST /productos
@router.post("/", response_model=dict)
async def create_product(
    product_data: str = Form(...), product_image: UploadFile = File(...)
):
    try:
        product_dict = json.loads(product_data)

    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format.")

    # Intentar normalizar el nombre y la descripción del producto
    try:
        product_dict["name_normalized"] = normalize_text(product_dict["name"])
        product_dict["description_normalized"] = normalize_text(
            product_dict["description"]
        )
    except KeyError:
        pass

    # Validar y construir el producto
    try:
        product = ProductDocument(**product_dict)
    except ValidationError as e:
        raise HTTPException(status_code=422, detail=e.errors())

    # Validar imagen
    if not product_image:
        raise HTTPException(status_code=400, detail="Product image is required.")

    # Guardar imagen solo si todo es válido
    image_url = await save_image(product_image, f"products/{product.category}")
    product.image = image_url

    # Guardar producto
    new_product = await product.save()

    return {"product": new_product}


# PUT /productos/:id
@router.put("/{product_id}/", response_model=Product)
async def update_product(
    product_id: PydanticObjectId,
    product_data: str = Form(None),
    product_image: UploadFile = File(None),
):
    product = await ProductDocument.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        product_data = json.loads(product_data)
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format.")

    # Normalizar si vienen name o description
    if "name" in product_data:
        product_data["name_normalized"] = normalize_text(product_data["name"])
    if "description" in product_data:
        product_data["description_normalized"] = normalize_text(
            product_data["description"]
        )

    updated_data = {**product.dict(), **product_data}

    if product_image and product_image.filename:
        image_url = await save_image(
            product_image, f"products/{product_data.get('category', product.category)}"
        )
        updated_data["image"] = image_url

    updated_data["updated_at"] = datetime.utcnow()

    updated_product = ProductDocument(**updated_data)
    await updated_product.replace()

    return updated_product


# DELETE /productos/:id
@router.delete("/{product_id}/")
async def delete_product(product_id: str):
    product = await ProductDocument.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    await product.delete()
    return {"message": "Product deleted"}


@router.get("/all/paginated/", response_model=dict)
async def get_products_paginated(
    query: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    sort: str = "desc",
    category: Optional[str] = None,
    available: Optional[bool] = None,
    featured: Optional[bool] = None,
):
    skip = (page - 1) * limit
    filters = {}

    if query:
        filters["$or"] = [
            {"name_normalized": {"$regex": query, "$options": "i"}},
            {"normalized_description": {"$regex": query, "$options": "i"}},
        ]

    if category:
        filters["category"] = category

    if available is not None:
        filters["available"] = available

    if featured is not None:
        filters["featured"] = featured

    products = (
        await ProductDocument.find(filters)
        .sort([("created_at", -1 if sort == "desc" else 1)])
        .skip(skip)
        .limit(limit)
        .to_list()
    )

    total = await ProductDocument.find(filters).count()

    return {"page": page, "limit": limit, "total": total, "productos": products}
