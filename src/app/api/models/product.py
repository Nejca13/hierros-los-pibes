from datetime import datetime
from pydantic import BaseModel, Field
from beanie import Document, init_beanie
from typing import Optional


class Product(BaseModel):
    name: str
    description: str
    price: float
    image: Optional[str] = None
    category: str  # Assuming it's a category ID
    available: Optional[bool] = True
    featured: Optional[bool] = False
    created_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    inventory_count: Optional[int] = None
    name_normalized: Optional[str] = None
    description_normalized: Optional[str] = None


class ProductDocument(Product, Document):

    class Settings:
        collection = "products"

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Producto 1",
                "description": "Descripción del producto 1",
                "price": 10.99,
                "image": "https://example.com/product1.jpg",
                "category": "Nombre de la categoria",  # Category ID
                "available": True,
                "featured": False,
                "created_at": "2025-01-13T00:00:00Z",
                "updated_at": "2025-01-13T00:00:00Z",
                "inventory_count": 100,
                "name_normalized": "producto 1",
                "description_normalized": "descripción del producto 1",
            }
        }


class ProductDetail(BaseModel):
    product_id: str
    image: Optional[str]
    name: str
    quantity: int
    unit_price: float
    total_price: float
