from fastapi import APIRouter

from app.api.models.error_log import ErrorLog

router = APIRouter()


@router.get("/status")
async def get_status():
    logs = await ErrorLog.find_all().sort("-created_at").limit(20).to_list()
    return {
        "ok": True,
        "errors": [
            {
                "path": log.path,
                "method": log.method,
                "error": log.error,
                "date": log.created_at,
            }
            for log in logs
        ],
    }
