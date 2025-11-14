from typing import Optional
from beanie import Document, PydanticObjectId
from pydantic import BaseModel, Field


class Court(Document):
    name: str = Field(..., description="Nombre de la cancha")
    sport_type: str = Field(
        ..., description="Tipo de deporte ('futbol', 'padel', etc.')"
    )
    location: Optional[str] = Field(None, description="Ubicación de la cancha")
    is_active: bool = Field(default=True)
    image: Optional[str] = Field(None, description="URL de la imagen de la cancha")
    price: Optional[int] = Field(None, description="Precio de la cancha")

    class Settings:
        name = "courts"

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Cancha 1",
                "sport_type": "futbol",
                "image": "https://example.com/cancha1.jpg",
                "location": "Av. Siempre Viva 123",
                "is_active": True,
                "price": 50,
            }
        }


class CourtResponse(BaseModel):
    id: PydanticObjectId
    name: str
    sport_type: str
    image: str
    location: Optional[str]
    is_active: bool
    price: Optional[int]

    class Config:
        from_attributes = True


class CourtUpdate(BaseModel):
    name: Optional[str] = None
    sport_type: Optional[str] = None
    location: Optional[str] = None
    is_active: Optional[bool] = None
    image: Optional[str] = None
    price: Optional[int] = None
