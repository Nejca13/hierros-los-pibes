import base64
from fastapi import APIRouter, Form, HTTPException, Response, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from app.api.models.user import User, UserResponse
from app.api.utils.hash_password.def_hash_password import verify_password
from app.api.utils.jwt import create_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login/")

router = APIRouter(
    tags=["Login"],
)


class LoginRequest(BaseModel):
    username: str
    password: str


class ResponseModel(BaseModel):
    user: UserResponse


@router.post("/login/", response_model=ResponseModel)
async def login(
    username: str = Form(...), password: str = Form(...), response: Response = None
):
    # Buscar al usuario por email
    user = await User.find_one(User.email == username)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
        )

    # Verificar la contraseña
    if not verify_password(password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
        )

    # Generar un JWT
    access_token = create_access_token(data={"sub": str(user.id), "role": user.role})

    # Establecer la cookie con el JWT
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,  # Para que solo sea accesible a través de HTTP, no por JavaScript
        max_age=120 * 60 * 24 * 50,  # Expira en 15 días
        secure=False,  # Solo si usas HTTPS, para mayor seguridad
        samesite="Strict",  # Previene el envío de cookies en solicitudes de otros dominios
    )
    # devolver user completo

    # Crear el objeto del usuario para retornar
    user_response = UserResponse.from_orm(user)
    encoded_user = base64.b64encode(user_response.json().encode("utf-8")).decode(
        "utf-8"
    )

    # Establecer la cookie con el objeto del usuario serializado
    response.set_cookie(
        key="currentUser",
        value=encoded_user,
        httponly=True,
        secure=False,
        samesite="Strict",
        max_age=120 * 60 * 24 * 50,
    )

    # Retornar el usuario logeado
    return ResponseModel(user=UserResponse.from_orm(user))
