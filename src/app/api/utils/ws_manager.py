from typing import Dict, List
from fastapi import WebSocket
from datetime import datetime
from app.api.models.web_socket_message import WebSocketMessage
from app.api.utils.fprint import fprint


class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {
            "kitchen": [],
            "cashier": [],
            "screen": [],
            "orders": [],
        }

    async def connect(self, websocket: WebSocket, role: str):
        await websocket.accept()
        self.active_connections[role].append(websocket)

    def disconnect(self, websocket: WebSocket, role: str):
        self.active_connections[role].remove(websocket)

    async def broadcast(self, role: str, message: dict):
        # Convertir el timestamp a formato serializable
        message["timestamp"] = datetime.utcnow().isoformat()

        # Guardar en Mongo
        await WebSocketMessage(
            role=role, message=message, timestamp=datetime.utcnow()
        ).insert()

        # Enviar en tiempo real
        for connection in self.active_connections[role]:
            await connection.send_json(message)


manager = ConnectionManager()
