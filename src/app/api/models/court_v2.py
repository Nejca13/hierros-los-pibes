from beanie import Document
from pydantic import Field


class Court_v2(Document):
    court_type: str = Field(..., description="padel o pickelball")
    court_name: str | None = None

    class Settings:
        name = "courts"
