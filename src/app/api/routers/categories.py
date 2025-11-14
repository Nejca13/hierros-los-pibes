from fastapi import APIRouter, HTTPException
from typing import List
from beanie import PydanticObjectId

from app.api.models.category import Category, CategoryDocument

router = APIRouter(prefix="/categories", tags=["Categorias"])


# GET all categories
@router.get("/", response_model=List[CategoryDocument])
async def get_categories():
    return await CategoryDocument.find_all().sort("nombre").to_list()


# POST create category
@router.post("/", response_model=CategoryDocument)
async def create_category(category: CategoryDocument):
    return await category.create()


# PUT update category
@router.put("/{id}/", response_model=CategoryDocument)
async def update_category(id: PydanticObjectId, data: Category):
    category = await CategoryDocument.get(id)
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")

    # Actualiza solo los campos modificables
    category.name = data.name
    category.icon = data.icon
    await category.save()
    return category


# DELETE category
@router.delete("/{id}/")
async def delete_category(id: PydanticObjectId):
    category = await CategoryDocument.get(id)
    if not category:
        raise HTTPException(status_code=404, detail="Categoría no encontrada")
    await category.delete()
    return {"ok": True}
