from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.api.utils.ws_manager import manager

router = APIRouter(prefix="/ws", tags=["WebSocket"])


@router.websocket("/{role}/")
async def websocket_endpoint(websocket: WebSocket, role: str):
    await manager.connect(websocket, role)
    try:
        while True:
            await websocket.receive_text()  # Espera para recibir mensajes del cliente (si es necesario)
    except WebSocketDisconnect:
        manager.disconnect(websocket, role)
