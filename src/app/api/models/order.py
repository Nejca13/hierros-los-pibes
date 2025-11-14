from re import L
from typing import List, Optional
from beanie import Document
from pydantic import BaseModel, Field
from datetime import datetime
from enum import Enum

from app.api.models.product import ProductDetail


class PaymentOrigin(str, Enum):
    caja = "caja"
    mercadopago = "mercadopago"


class OrderItem(BaseModel):
    product_id: str
    quantity: int


class KitchenStatus(str, Enum):
    pending = "pending"  # Pedido creado, aún no enviado
    sent = "sent"  # Enviado a cocina
    finished = "finished"  # Cocina lo terminó


class UserSnapshot(BaseModel):
    user_id: str
    name: str
    email: str


class PaymentMethod(str, Enum):
    efectivo = "efectivo"
    transferencia = "transferencia"
    mixto = "mixto"
    interno = "interno"


class PaymentBreakdown(BaseModel):
    method: str  # 'efectivo', 'transferencia', etc.
    amount: float


class Order(Document):
    user_id: Optional[str] = None
    guest_email: Optional[str] = None
    guest_name: Optional[str] = None
    products: List[OrderItem]
    products_details: Optional[List[ProductDetail]] = None
    total: float
    table: Optional[str]
    note: Optional[str] = None
    status: Optional[str] = "pending"
    kitchen_status: Optional[KitchenStatus] = KitchenStatus.pending
    payment_method: Optional[PaymentMethod] = PaymentMethod.transferencia or None
    payment_origin: Optional[PaymentOrigin] = None
    payment_url: Optional[str] = None
    sent_to_kitchen: bool = False
    displayed_to_client: bool = False
    payment_breakdown: Optional[List[PaymentBreakdown]] = None
    pickup_number: Optional[int] = None
    finished_at: Optional[datetime] = None
    attended_by_user: Optional[UserSnapshot] = None
    cancelled: Optional[bool] = False
    is_internal_order: Optional[bool] = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "orders"

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "64b2f437a8d4f5c9e8a73e12",
                "guest_email": "2H2QW@example.com",
                "guest_name": "John Doe",
                "products": [
                    {"product_id": "64b2f437a8d4f5c9e8a73e13", "quantity": 2},
                    {"product_id": "64b2f437a8d4f5c9e8a73e14", "quantity": 1},
                ],
                "total": 150.0,
                "table": "Table 1",
                "note": "Please deliver quickly",
                "status": "pending",
                "kitchen_status": "pending",
                "payment_method": "transferencia",
                "payment_origin": "caja",
                "payment_url": "https://example.com/payment",
                "sent_to_kitchen": False,
                "displayed_to_client": False,
                "pickup_number": 1,
                "finished_at": None,
                "attended_by_user": {
                    "user_id": "64b2f437a8d4f5c9e8a73e15",
                    "name": "Jane Smith",
                    "email": "WgG0p@example.com",
                },
                "cancelled": False,
                "created_at": "2023-08-01T12:34:56.789Z",
                "updated_at": "2023-08-01T12:34:56.789Z",
            }
        }
