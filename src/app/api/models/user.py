from beanie import Document, PydanticObjectId
from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class User(Document):
    # Información básica
    name: str
    last_name: str
    img: Optional[str] = Field(None)
    email: EmailStr
    password: str
    phone_number: Optional[str] = Field(None)
    role: str = Field(
        "user", description="Puede ser 'user', 'admin', 'superadmin', 'empleado"
    )
    preferred_sports: Optional[List[str]] = Field(default_factory=list)
    is_active: bool = Field(default=True)
    is_verified: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)

    class Settings:
        name = "users"

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Nicolás",
                "last_name": "Contreras",
                "img": "https://example.com/profile.jpg",
                "email": "nico@example.com",
                "password": "password_here",
                "phone_number": "+5491123456789",
                "role": "user",
                "preferred_sports": ["futbol", "padel"],
                "is_active": True,
                "is_verified": False,
                "created_at": "2025-01-13T00:00:00Z",
            }
        }


# Modelo para creación de usuarios (sin password)
class UserCreate(BaseModel):
    name: str
    last_name: str
    img: Optional[str]
    email: EmailStr
    role: str
    password: str
    phone_number: Optional[str]
    preferred_sports: Optional[List[str]] = Field(default_factory=list)


# Modelo para respuesta pública
class UserResponse(BaseModel):
    id: PydanticObjectId
    role: str
    name: str
    img: Optional[str]
    last_name: str
    email: EmailStr
    role: str
    phone_number: Optional[str]
    preferred_sports: List[str]
    is_active: bool
    is_verified: bool

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None)
    last_name: Optional[str] = Field(None)
    img: Optional[str] = Field(None)
    role: Optional[str] = Field(None)
    email: Optional[EmailStr] = Field(None)
    phone_number: Optional[str] = Field(None)
    preferred_sports: Optional[List[str]] = Field(default_factory=list)
    is_active: Optional[bool] = Field(None)
    is_verified: Optional[bool] = Field(None)
    password: Optional[str] = Field(None)
