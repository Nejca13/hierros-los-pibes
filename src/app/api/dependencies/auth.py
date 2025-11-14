# app/api/dependencies/auth.py
from typing import Optional

from fastapi import Depends, HTTPException, status, Header, Cookie
from jose import JWTError, jwt
from beanie import PydanticObjectId

from app.api.models.user import User
from app.api.core.settings import SECRET_KEY, ALGORITHM


async def _get_raw_token(
    authorization: Optional[str] = Header(None),
    access_token: Optional[str] = Cookie(None),
) -> str:
    # 1) Intentá extraer de Authorization: "Bearer <token>"
    if authorization and authorization.startswith("Bearer "):
        return authorization.split(" ", 1)[1]
    # 2) Si no, usá la cookie
    if access_token:
        return access_token
    return None


async def get_current_user(token: str = Depends(_get_raw_token)) -> User:
    if token is None:
        return None
    creds_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        uid: str = payload.get("sub")
        if not uid:
            raise creds_exc
    except JWTError:
        raise creds_exc

    user = await User.get(PydanticObjectId(uid))
    if not user:
        raise creds_exc
    return user
