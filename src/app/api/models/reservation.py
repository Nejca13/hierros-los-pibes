from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from app.api.models.court import CourtResponse
from app.api.models.user import UserResponse


class Reservation(Document):
    # Relación con usuario y cancha
    user: UserResponse = Field(..., description="Información del usuario")
    court: CourtResponse = Field(..., description="Información de la cancha")
    # Detalles de la reserva
    date: datetime = Field(..., description="Fecha y hora de la reserva")
    duration: Optional[int] = Field(60, description="Duración de la reserva en minutos")
    status: str = Field(
        "pending",
        description="Estado de la reserva ('pending', 'confirmed', 'cancelled')",
    )
    payment_url: Optional[str] = None

    # Auditoría
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)

    class Settings:
        name = "reservations"  # Nombre de la colección en MongoDB

    class Config:
        json_schema_extra = {
            "example": {
                "user_id": "64b2f437a8d4f5c9e8a73e12",
                "court_id": "64b2f437a8d4f5c9e8a73e34",
                "date": "2025-01-14T15:00:00Z",
                "duration": 60,
                "status": "pending",
                "payment_url": "https://example.com/payment/123",
                "created_at": "2025-01-13T00:00:00Z",
            }
        }


# Modelo para creación de reservas
class ReservationCreate(BaseModel):
    user_id: str
    court_id: str
    date: datetime
    duration: int
    payment_url: Optional[str] = None


# Modelo para actualización de reservas (por ejemplo, cambiar el estado)
class ReservationUpdate(BaseModel):
    status: Optional[str] = None
    date: Optional[datetime] = None
    duration: Optional[int] = None
    payment_url: Optional[str] = None


class ReservationResponse(BaseModel):
    id: PydanticObjectId
    user: UserResponse
    court: CourtResponse
    date: datetime
    duration: int
    status: str
    payment_url: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = Field(default=None)
