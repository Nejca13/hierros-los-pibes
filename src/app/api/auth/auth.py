from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, constr
from pymongo import MongoClient
from passlib.context import CryptContext
import jwt
from datetime import datetime, timedelta
import os

from app.api.core.settings import ALGORITHM, SECRET_KEY
from app.api.dependencies.auth import get_current_user
from app.api.models.user import User

client = MongoClient(os.getenv("MONGO_URI"))
db = client.festclub
usuarios_collection = db.usuarios

router = APIRouter(prefix="/auth", tags=["Auth"])


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# Modelo para la solicitud de login
class LoginRequest(BaseModel):
    email: EmailStr
    password: constr(min_length=8)  # Contraseña debe tener mínimo 8 caracteres


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta = timedelta(minutes=120)):
    to_encode = data.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


@router.post("/login")
async def login(request: LoginRequest):
    usuario = usuarios_collection.find_one({"email": request.email})

    if usuario and verify_password(request.password, usuario["password"]):
        usuario["_id"] = str(usuario["_id"])
        token = create_access_token(data={"sub": usuario["_id"]})
        return {
            "access_token": token,
            "token_type": "bearer",
            **{k: v for k, v in usuario.items() if k != "password"},
        }
    else:
        raise HTTPException(status_code=400, detail="Email o Password inválido")


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/token", response_model=TokenResponse)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    user = await User.find_one(User.email == form_data.username)
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña inválida",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token}


@router.get("/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user
