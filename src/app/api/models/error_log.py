from beanie import Document
from datetime import datetime


class ErrorLog(Document):
    method: str
    path: str
    error: str
    traceback: str
    headers: dict
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "error_logs"
