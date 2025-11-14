import os
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import traceback

from app.api.models.error_log import ErrorLog
from app.api.utils.fprint import fprint
from app.api.utils.send_email import send_email


class ErrorNotifierMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
        except Exception as e:
            tb = traceback.format_exc()
            asunto = f"[ERROR] {request.method} {request.url.path}"
            mensaje_html = f"""
                <p><strong>URL:</strong> {request.url}</p>
                <p><strong>Method:</strong> {request.method}</p>
                <p><strong>Error:</strong> {str(e)}</p>
                <pre>{tb}</pre>
            """
            # solo enviar el correo si esta en produccion
            if os.getenv("ENV") == "production":
                fprint(f"Enviando correo de error: {asunto}", color="RED")
                await send_email("nicolascontreras677@gmail.com", asunto, mensaje_html)
                log = ErrorLog(
                    method=request.method,
                    path=str(request.url.path),
                    error=str(e),
                    traceback=tb,
                    headers=dict(request.headers),
                )
                await log.insert()
            else:
                fprint(
                    "No se enviará el correo de error porque no está en producción",
                    color="YELLOW",
                )
            return JSONResponse(
                status_code=500,
                content={"detail": "Internal server error"},
            )
