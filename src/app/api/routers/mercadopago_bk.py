from datetime import datetime
import os
from beanie import PydanticObjectId
from fastapi import APIRouter, HTTPException, Query, Request, status
from pydantic import BaseModel
import mercadopago
from app.api.models.reservation import Reservation
from app.api.utils.fprint import fprint

sdk = mercadopago.SDK(os.getenv("MERCADOPAGO_ACCESS_TOKEN"))

router = APIRouter(
    prefix="/mercadopago",
    tags=["Mercado Pago"],
)


# Modelo opcional para validar el payload del webhook
class MercadoPagoWebhook(BaseModel):
    id: str
    live_mode: bool
    type: str
    date_created: str
    application_id: str
    user_id: str
    version: str
    api_version: str
    action: str
    data: dict  # {"id": "payment_id_o_otra_data"}


@router.post("/webhook/", status_code=status.HTTP_200_OK)
async def mercado_pago_webhook(
    request: Request, data_id: str = Query(None), event_type: str = Query(None)
):
    try:
        # Procesar datos desde query parameters
        if not data_id or not event_type:
            # Intentar leer desde el cuerpo si no están en la URL
            payload = await request.json()
            data_id = payload.get("data", {}).get("id")
            event_type = payload.get("type")

        if not data_id or not event_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No se encontró data.id o type en la solicitud",
            )

        fprint(f"Evento recibido: {event_type}, ID: {data_id}", color="BLUE")

        # Procesar el evento
        if event_type == "payment":
            fprint(f"Procesando pago. ID: {data_id}", color="GREEN")

            # Obtener detalles del pago desde Mercado Pago
            try:
                payment_response = sdk.payment().get(data_id)
                payment = payment_response.get("response")
            except Exception as e:
                fprint(f"Error al obtener detalles del pago: {str(e)}", color="RED")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Error al obtener el pago: {str(e)}",
                )

            # Validar external_reference
            external_reference = payment.get("external_reference")
            if not external_reference:
                fprint(
                    f"No se encontró external_reference en el pago: {payment}",
                    color="RED",
                )
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No se encontró external_reference en el pago",
                )

            # Buscar y actualizar la reserva
            try:
                reservation = await Reservation.get(
                    PydanticObjectId(external_reference)
                )
                if reservation:
                    try:
                        # Actualizar directamente el documento y guardar
                        reservation.status = "confirmed"
                        reservation.updated_at = (
                            datetime.utcnow()
                        )  # Actualizar timestamp
                        await reservation.save()  # Guardar cambios en la base de datos

                        fprint(
                            f"Reserva confirmada. ID: {external_reference}",
                            color="GREEN",
                        )
                    except Exception as e:
                        fprint(f"Error al actualizar la reserva: {str(e)}", color="RED")
                        raise HTTPException(
                            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            detail=f"Error al buscar o actualizar la reserva: {str(e)}",
                        )
                else:
                    fprint(
                        f"No se encontró la reserva. ID: {external_reference}",
                        color="RED",
                    )
            except Exception as e:
                fprint(f"Error al actualizar la reserva: {str(e)}", color="RED")
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Error al buscar o actualizar la reserva: {str(e)}",
                )

        else:
            fprint(f"Evento no manejado: {event_type}", color="YELLOW")

        return {"status": "success"}  # Responder 200 a Mercado Pago

    except Exception as e:
        fprint(f"Error procesando el webhook: {str(e)}", color="RED")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error procesando el webhook: {str(e)}",
        )
