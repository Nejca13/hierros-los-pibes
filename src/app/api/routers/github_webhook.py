import subprocess

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from app.api.utils.fprint import fprint

router = APIRouter()


@router.post("/github/webhook/")
async def github_webhook(payload: Request):
    fprint("Payload recibido")

    # Leer y verificar el payload
    try:
        data = await payload.json()
    except Exception as e:
        fprint(f"Error al leer el payload: {e}", color="RED")
        return JSONResponse(
            content={"error": f"Payload inválido: {str(e)}"}, status_code=400
        )

    if data.get("ref") == "refs/heads/main":
        fprint("Se ha detectado una actualización en la rama main")
        try:
            # Ejecutar el script externo
            process = subprocess.run(
                ["bash", "/home/sportiumcafe/update_script.sh"],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )

            # Detallar el resultado del script
            fprint("---- Resultado del script ----", color="YELLOW")
            fprint(f"STDOUT:\n{process.stdout}", color="BLUE")
            fprint(f"STDERR:\n{process.stderr}", color="RED")

            # Verificar el código de salida
            if process.returncode == 0:
                fprint("Actualización completada con éxito.", color="GREEN")
                return JSONResponse(
                    content={
                        "message": "Actualización exitosa",
                        "stdout": process.stdout,
                        "stderr": process.stderr,
                    }
                )
            else:
                fprint("Error durante la ejecución del script.", color="RED")
                return JSONResponse(
                    content={
                        "error": "Fallo en el script",
                        "return_code": process.returncode,
                        "stdout": process.stdout,
                        "stderr": process.stderr,
                    },
                    status_code=200,
                )
        except FileNotFoundError as e:
            fprint(f"Script no encontrado o comando inválido: {e}", color="RED")
            return JSONResponse(
                content={"error": f"Script no encontrado: {str(e)}"}, status_code=200
            )
        except Exception as e:
            fprint(f"Error inesperado al ejecutar el script: {e}", color="RED")
            return JSONResponse(content={"error": str(e)}, status_code=200)

    fprint("El payload no contiene cambios en la rama main.")
    return JSONResponse(content={"message": "No se detectaron cambios en la rama main"})
