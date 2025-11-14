from datetime import date

from fastapi import APIRouter, HTTPException, Query
from fastapi.encoders import jsonable_encoder

from app.api.models.alquiler import Alquiler, AlquilerCreate
from app.api.models.cash_sessions import CashMovement, CashMovementType, CashSession

router = APIRouter(
    prefix="/alquileres",
    tags=["Alquileres"],
)


@router.post("/create-alquiler/")
async def create_alquiler(alquiler: AlquilerCreate):
    new_alquiler = Alquiler(**alquiler.dict())
    try:
        new_alquiler = await new_alquiler.create()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al crear el alquiler. {e}")

    # 👉 Buscar caja activa
    cash_session = await CashSession.find_one(CashSession.active == True)
    if not cash_session:
        raise HTTPException(status_code=400, detail="No hay caja abierta.")

    # 👉 Registrar movimiento
    movement = CashMovement(
        payment_method=alquiler.payment_method,
        amount=alquiler.price,
        reason=f"Alquiler de {alquiler.court_name}",
        type=CashMovementType.income,
    )
    cash_session.movements.append(movement)
    await cash_session.save()

    return new_alquiler.dict()


@router.get("/summary/")
async def get_daily_summary(
    selected_date: date = Query(
        date.today(), description="Fecha para el resumen diario"
    )
):
    alquileres_del_dia = await Alquiler.find(
        Alquiler.alquiler_date == selected_date
    ).to_list()

    total_alquileres = len(alquileres_del_dia)
    total_revenue = sum(alquiler.price for alquiler in alquileres_del_dia)

    # Convert Alquiler objects to dictionaries for the response
    alquileres_data = [jsonable_encoder(alquiler) for alquiler in alquileres_del_dia]

    return {
        "date": selected_date.isoformat(),
        "total_alquileres": total_alquileres,
        "total_revenue": round(total_revenue, 2),
        "alquileres": alquileres_data,
    }
