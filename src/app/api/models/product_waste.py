from typing import Optional
from beanie import Document
from pydantic import Field
from datetime import datetime


class ProductWaste(Document):
    product_id: str
    product_name: str
    product_image: Optional[str] = None
    quantity: int
    reason: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

    class Settings:
        collection = "product_waste"

    class Config:
        json_schema_extra = {
            "example": {
                "product_id": "1234567890abcdef12345678",
                "product_name": "Producto de ejemplo",
                "product_image": "https://example.com/product.jpg",
                "quantity": 5,
                "reason": "Producto vencido",
                "created_at": "2025-01-13T00:00:00Z",
                "updated_at": "2025-01-13T00:00:00Z",
            }
        }
