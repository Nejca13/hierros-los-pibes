from collections import defaultdict
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

from app.api.dependencies.auth import get_current_user
from app.api.models.cash_sessions import (
    CashMovement,
    CashMovementType,
    CashSession,
    UpdateCashSession,
)
from app.api.models.order import PaymentMethod
from app.api.models.user import User

router = APIRouter(prefix="/cash-sessions")


class StartSessionInput(BaseModel):
    user_id: str
    opening_amount: float


# GET para ver las sesiones activas
@router.get("/active/")
async def get_active_sessions():
    sessions = await CashSession.find({"active": True}).to_list()
    return sessions


@router.post("/start/")
async def start_session(data: StartSessionInput):
    existing = await CashSession.find_one({"user_id": data.user_id, "active": True})
    if existing:
        raise HTTPException(status_code=400, detail="Ya hay una caja activa.")
    # Validar usuario
    user = await User.get(data.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    new_session = CashSession(
        user_id=data.user_id,
        opening_amount=data.opening_amount,
        user_name=f"{user.name} {user.last_name}",
        user_img=user.img,
        active=True,
    )
    await new_session.insert()
    return new_session


class MovementInput(BaseModel):
    amount: float
    reason: Optional[str] = None
    payment_method: Optional[str] = None


@router.post("/{session_id}/income/")
async def add_income(session_id: str, data: MovementInput):
    session = await CashSession.get(session_id)
    if not session or not session.active:
        raise HTTPException(status_code=404, detail="Caja no encontrada o cerrada.")

    movement = CashMovement(
        amount=data.amount,
        reason=data.reason,
        type=CashMovementType.income,
        payment_method="efectivo",
    )
    session.movements.append(movement)
    await session.save()
    return movement


def summarize_movements(session):
    total_income = 0.0
    total_expense = 0.0
    income_by_method = defaultdict(float)
    expense_by_method = defaultdict(float)

    for m in session.movements:

        if m.type == "income":
            total_income += m.amount
            if m.payment_method:
                income_by_method[m.payment_method] += m.amount
        elif m.type == "expense":
            total_expense += m.amount
            if m.payment_method:
                expense_by_method[m.payment_method] += m.amount

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "income_by_method": dict(income_by_method),
        "expense_by_method": dict(expense_by_method),
    }


@router.get("/", response_model=dict)
async def get_cash_sessions_report(
    page: int = 1,
    limit: int = 25,
    user_id: Optional[str] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    sort_type: Optional[str] = "desc",
    current_user: Optional[User] = Depends(get_current_user),
):
    skip = (page - 1) * limit
    filters = {}

    # Fechas opcionales
    if from_date and to_date:
        to_date = to_date.replace(hour=23, minute=59, second=59, microsecond=999999)
        filters["opened_at"] = {"$gte": from_date, "$lte": to_date}
    elif from_date:
        filters["opened_at"] = {"$gte": from_date}
    elif to_date:
        to_date = to_date.replace(hour=23, minute=59, second=59, microsecond=999999)
        filters["opened_at"] = {"$lte": to_date}

    if user_id:
        filters["user_id"] = user_id

    # solo las cajas cerradas
    filters["active"] = False

    sort = "-opened_at" if sort_type == "desc" else "opened_at"

    if current_user.role == "admin":
        user_id = current_user.id

    total = await CashSession.find(filters).count()
    sessions = (
        await CashSession.find(filters).sort(sort).skip(skip).limit(limit).to_list()
    )

    return {
        "page": page,
        "limit": limit,
        "total": total,
        "sessions": sessions,
        "sessions_summary": [
            {
                **s.dict(exclude={"movements"}, by_alias=True),
                "_id": str(s.id),
                "movements_summary": summarize_movements(s),
            }
            for s in sessions
        ],
    }


# Get detalles de una sesión específica
@router.get("/{session_id}/")
async def get_cash_session_details(session_id: str):
    session = await CashSession.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Caja no encontrada.")

    session.closing_amount = (
        session.opening_amount + session.total_income() - session.total_expense()
    )

    return {
        "session": session,
        "session_summary": {
            **session.dict(exclude={"movements"}, by_alias=True),
            "_id": str(session.id),
            "movements_summary": summarize_movements(session),
        },
    }


@router.post("/{session_id}/expense/")
async def add_expense(session_id: str, data: MovementInput):
    session = await CashSession.get(session_id)
    if not session or not session.active:
        raise HTTPException(status_code=404, detail="Caja no encontrada o cerrada.")

    movement = CashMovement(
        amount=data.amount,
        reason=data.reason,
        type=CashMovementType.expense,
        payment_method=data.payment_method or "efectivo",
    )
    session.movements.append(movement)
    await session.save()
    return movement


class CloseSessionBody(BaseModel):
    counted_cash: float  # efectivo contado al cerrar
    counted_transfer: float  # transferencias contadas al cerrar


@router.post("/{session_id}/close/")
async def close_session(session_id: str, body: CloseSessionBody):
    session = await CashSession.get(session_id)
    if not session or not session.active:
        raise HTTPException(status_code=404, detail="Caja no encontrada o ya cerrada.")

    # 1) Calcular lo que el sistema espera por método:
    expected_cash = session.opening_amount
    expected_transfer = 0.0
    for m in session.movements:
        if m.payment_method == PaymentMethod.efectivo:
            expected_cash += (
                m.amount if m.type == CashMovementType.income else -m.amount
            )
        elif m.payment_method == PaymentMethod.transferencia:
            expected_transfer += (
                m.amount if m.type == CashMovementType.income else -m.amount
            )

    # 2) Comparar con lo contado:
    diff_cash = body.counted_cash - expected_cash
    diff_transfer = body.counted_transfer - expected_transfer

    # 3) Generar nota automática:
    partes = []
    if diff_cash < 0:
        partes.append(f"faltante en efectivo {abs(diff_cash):.2f}")
    elif diff_cash > 0:
        partes.append(f"excedente en efectivo {diff_cash:.2f}")
    else:
        partes.append("efectivo cuadrado")

    if diff_transfer < 0:
        partes.append(f"faltante en transferencia {abs(diff_transfer):.2f}")
    elif diff_transfer > 0:
        partes.append(f"excedente en transferencia {diff_transfer:.2f}")
    else:
        partes.append("transferencia cuadrada")

    nota = " y ".join(
        partes
    ).capitalize()  # e.g. "Faltante en efectivo 10.00 y transferencia cuadrada"

    # 4) Guardar en el modelo:
    session.cash_diff = diff_cash
    session.transfer_diff = diff_transfer
    session.closing_amount = body.counted_cash + body.counted_transfer
    session.closed_at = datetime.utcnow()
    session.active = False
    session.closing_note = nota
    await session.save()

    return {"session": session, "closing_note": nota}


@router.get("/{session_id}/summary/")
async def get_summary(session_id: str):
    session = await CashSession.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Caja no encontrada.")

    return {
        "opening_amount": session.opening_amount,
        "total_income": session.total_income(),
        "total_expense": session.total_expense(),
        "closing_amount": session.closing_amount,
        "status": "active" if session.active else "closed",
        "opened_at": session.opened_at,
        "closed_at": session.closed_at,
    }


# Permite actualizar el monto de apertura de una caja
@router.put("/{session_id}/update-opening-amount/")
async def update_opening_amount(session_id: str, opening_amount: float):
    session = await CashSession.get(session_id)
    if not session or not session.active:
        raise HTTPException(status_code=404, detail="Caja no encontrada o cerrada.")

    if opening_amount < 0:
        raise HTTPException(
            status_code=400, detail="El monto de apertura no puede ser negativo."
        )

    session.opening_amount = opening_amount
    await session.save()
    return {"message": "Monto de apertura actualizado correctamente."}


@router.put("/update/{session_id}/")
async def update_cash_session(session_id: str, data: UpdateCashSession):
    session = await CashSession.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if data.opening_amount is not None:
        session.opening_amount = data.opening_amount

    if data.updated_expenses:
        for updated in data.updated_expenses:
            for i, m in enumerate(session.movements):
                if m.id == updated.id and m.type == CashMovementType.expense:
                    session.movements[i].amount = updated.amount
                    session.movements[i].reason = updated.reason
                    session.movements[i].payment_method = updated.payment_method

    await session.save()
    return {"message": "Session updated", "session": session}
