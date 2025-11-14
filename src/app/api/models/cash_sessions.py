from enum import Enum
from beanie import Document
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
from uuid import uuid4


class CashMovementType(str, Enum):
    income = "income"
    expense = "expense"


class PaymentMethod(str, Enum):
    cash = "efectivo"
    transfer = "transferencia"


class CashMovement(BaseModel):
    id: Optional[str] = Field(default_factory=lambda: str(uuid4()))
    amount: float
    reason: Optional[str] = None
    type: CashMovementType
    payment_method: Optional[PaymentMethod] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CashSession(Document):
    user_id: str
    user_name: Optional[str] = None
    user_img: Optional[str] = None
    opened_at: datetime = Field(default_factory=datetime.utcnow)
    closed_at: Optional[datetime] = None
    opening_amount: float
    closing_amount: Optional[float] = None
    movements: List[CashMovement] = Field(default_factory=list)
    active: bool = True
    cash_diff: Optional[float] = None
    transfer_diff: Optional[float] = None
    closing_note: Optional[str] = None

    class Settings:
        name = "cash_sessions"

    def total_income(self) -> float:
        return sum(
            m.amount for m in self.movements if m.type == CashMovementType.income
        )

    def total_expense(self) -> float:
        return sum(
            m.amount for m in self.movements if m.type == CashMovementType.expense
        )


class UpdateCashSession(BaseModel):
    opening_amount: Optional[float] = None
    updated_expenses: Optional[List[CashMovement]] = None  # deben tener `id` válido
