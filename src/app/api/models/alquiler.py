from typing import Optional
from beanie import Document
from pydantic import BaseModel, Field, field_serializer, field_validator
from datetime import date, time


class Alquiler(Document):
    court_type: str = Field(..., description="Tipo de cancha ('padel', 'futbol')")
    court_name: Optional[str] = Field(None, description="Nombre de la cancha")
    alquiler_date: date = Field(..., description="Fecha del alquiler")
    alquiler_start_time: str = Field(..., description="Hora de inicio del alquiler (HH:MM)")
    alquiler_end_time: str = Field(..., description="Hora de fin del alquiler (HH:MM)")
    price: float = Field(..., description="Precio del alquiler")
    payment_method: Optional[str] = Field("efectivo", description="Método de pago ('efectivo', 'transferencia')")

    @field_validator('alquiler_start_time', 'alquiler_end_time', mode='before')
    @classmethod
    def convert_time_to_str(cls, v):
        if isinstance(v, time):
            return v.strftime('%H:%M')
        return v

    @field_serializer('alquiler_start_time', 'alquiler_end_time')
    def serialize_time_output(self, t: str) -> str:
        return t

    class Settings:
        name = "alquileres"

    class Config:
        json_schema_extra = {
            "example": {
                "court_type": "padel",
                "court_name": "Cancha 1",
                "alquiler_date": "2024-07-26",
                "alquiler_start_time": "18:00",
                "alquiler_end_time": "19:00",
                "price": 25.50,
            }
        }


class AlquilerCreate(BaseModel):
    court_type: str
    court_name: Optional[str] = None
    alquiler_date: date
    alquiler_start_time: time
    alquiler_end_time: time
    price: float
    payment_method: Optional[str] = "efectivo"
