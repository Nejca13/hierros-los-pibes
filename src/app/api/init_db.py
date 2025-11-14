import os

from beanie import init_beanie
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

from app.api.models.alquiler import Alquiler
from app.api.models.cash_sessions import CashSession
from app.api.models.category import CategoryDocument
from app.api.models.court import Court
from app.api.models.court_v2 import Court_v2
from app.api.models.error_log import ErrorLog
from app.api.models.order import Order
from app.api.models.product import ProductDocument
from app.api.models.product_waste import ProductWaste
from app.api.models.reservation import Reservation
from app.api.models.user import User
from app.api.models.web_socket_message import WebSocketMessage
from app.api.schemas.court_v2 import CourtCreate
from app.api.utils.fprint import fprint

load_dotenv()
BASE_URL = os.getenv("BASE_URL", "http://localhost:3000")
MODE = os.getenv("MODE", "PROD")


fprint(f"MODE: {MODE}", color="GREEN")
fprint(f"BASE_URL: {BASE_URL}", color="GREEN")


async def init_db():
    project_name = "sportiumCAFE" if MODE == "DEV" else "panchos222"
    client = AsyncIOMotorClient(os.getenv("mongodb://localhost:27017"))
    await init_beanie(
        database=client[project_name],
        document_models=[
            User,
            Court,
            Reservation,
            ProductDocument,
            CategoryDocument,
            Order,
            WebSocketMessage,
            ErrorLog,
            CashSession,
            ProductWaste,
            Alquiler,
            Court_v2,
        ],
    )
