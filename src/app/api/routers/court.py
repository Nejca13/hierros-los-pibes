# CRUD de canchas
import json
from typing import Optional
from beanie import PydanticObjectId
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from app.api.dependencies.auth import get_current_user
from app.api.models.court import Court, CourtResponse
from app.api.models.user import User
from app.api.utils.save_image import save_image

router = APIRouter(
    prefix="/courts",
    tags=["Canchas"],
)


async def get_update_data(
    name: Optional[str] = Form(None),
    sport_type: Optional[str] = Form(None),
    location: Optional[str] = Form(None),
    is_active: Optional[bool] = Form(None),
    price: Optional[int] = Form(None),
    image: Optional[UploadFile] = File(None),
) -> dict:
    update_data = {
        "name": name,
        "sport_type": sport_type,
        "location": location,
        "is_active": is_active,
        "price": price,
    }
    if image:
        update_data["image"] = image
    return {k: v for k, v in update_data.items() if v is not None}


@router.get("/test-error/")
async def test_error():
    raise ValueError("Esto es un error de prueba forzado")


@router.get("/me")
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/create-court/")
async def create_court(court: str = Form(...), image: UploadFile = File(...)):

    court_data = json.loads(court)

    # Guardar la imagen en el servidor
    folder = f"courts/{court_data['name']}"
    court_data["image"] = await save_image(image, folder)
    new_court = Court(**court_data)
    try:
        new_court = await new_court.create()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear la cancha. {e}")

    # Retornar la cancha guardada
    return new_court


@router.get("/get-courts/")
async def get_courts():
    courts = await Court.find().to_list()
    return courts


@router.get("/get-court/{court_id}/")
async def get_court(court_id: str):
    court = await Court.find_one(Court.id == PydanticObjectId(court_id))
    return court


@router.put("/update-court/{court_id}/")
async def update_court(court_id: str, court: dict):
    court = await Court.find_one(Court.id == PydanticObjectId(court_id))
    if not court:
        raise HTTPException(status_code=404, detail="Court not found")

    await court.update(court)
    return court


# Filtrar cancha por deporte
@router.get("/filter/by-sport-type/", response_model=list)
async def filter_courts(sport_type: str):
    courts = await Court.find(Court.sport_type == sport_type).to_list()
    return courts


# Eliminar una cancha
@router.delete("/delete-court/{court_id}/")
async def delete_court(court_id: str):
    court = await Court.find_one(Court.id == PydanticObjectId(court_id))
    if not court:
        raise HTTPException(status_code=404, detail="Court not found")
    await court.delete()

    # Devolver un mensaje de confirmación
    return {"message": "Cancha eliminada correctamente"}


@router.patch("/update-court/{court_id}/", response_model=CourtResponse)
async def update_court(
    court_id: PydanticObjectId,
    update_data: dict = Depends(get_update_data),
):
    court = await Court.get(court_id)
    if not court:
        raise HTTPException(status_code=404, detail="Court not found")

    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Procesar el archivo si se proporciona
    if "image" in update_data:
        image: UploadFile = update_data.pop("image")
        folder = f"courts/{court.name}"  # Carpeta específica para cada cancha
        update_data["image"] = await save_image(image, folder)

    # Aplicar los cambios
    await court.set(update_data)
    await court.save()

    return CourtResponse(**court.dict())
