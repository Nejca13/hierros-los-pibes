from email.policy import default
from beanie import Document
from pydantic import BaseModel, Field
from datetime import datetime


class WebSocketMessage(Document):
    role: str  # "kitchen", "cashier", "screen"
    message: dict
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "websocket_messages"

        class Config:
            indexes = [{"key": [("timestamp", 1)], "expireAfterSeconds": 86400}]
