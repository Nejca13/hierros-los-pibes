from pydantic import BaseModel, Field


class CourtCreate(BaseModel):
    court_type: str = Field(...)
    court_name: str | None = None
