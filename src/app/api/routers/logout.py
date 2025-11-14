# Router de Logout
from fastapi import APIRouter, Response

router = APIRouter(
    prefix="/logout",
    tags=["Logout"],
)


@router.post("/")
async def logout(response: Response):
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="currentUser")

    return {"message": "Session cerrada correctamente"}
