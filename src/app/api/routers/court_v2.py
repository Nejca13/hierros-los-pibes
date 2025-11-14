from fastapi import APIRouter

from app.api.models.court_v2 import Court_v2
from app.api.schemas.court_v2 import CourtCreate

router = APIRouter(prefix="/courts_v2", tags=["Courts"])


@router.post("/", status_code=201)
async def create_court(payload: CourtCreate):
    court = Court_v2(**payload.model_dump())
    await court.insert()
    return {"message": "Cancha creada", "court": court}


@router.get("/")
async def list_courts():
    courts = await Court_v2.find_all().to_list()
    return courts
