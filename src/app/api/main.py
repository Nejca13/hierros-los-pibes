from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api.init_db import init_db

from .routers.alquileres import router as alquileres
from .routers.auth import router as auth
from .routers.cash_sessions import router as cash_sessions
from .routers.categories import router as categories
from .routers.court import router as courts
from .routers.court_v2 import router as courts_v2
from .routers.github_webhook import router as github
from .routers.login import router as login
from .routers.logout import router as logout
from .routers.mercadopago import router as mercado_pago
from .routers.order import router as order
from .routers.password_recovery import router as password_recovery
from .routers.product_waste import router as product_waste
from .routers.products import router as products
from .routers.reservation import router as reservation
from .routers.status import router as status
from .routers.users import router as usuarios
from .routers.ws import router as ws_router

app = FastAPI()


@app.on_event("startup")
async def on_startup():
    await init_db()  # Inicializar la base de datos Beanie


""" 
app.add_middleware(ErrorNotifierMiddleware) """

app.include_router(auth, tags=["Auth"])
app.include_router(courts_v2, tags=["Courts"])
app.include_router(usuarios, tags=["Usuarios"])
app.include_router(reservation, tags=["Reservas"])  # Incluir el router de usuarios
app.include_router(courts, tags=["Canchas"])
app.include_router(products, tags=["Productos"])
app.include_router(product_waste, tags=["Desperdicio de Productos"])
app.include_router(categories, tags=["Categorias"])
app.include_router(order, tags=["Ordenes"])
app.include_router(ws_router, tags=["WebSocket"])
app.include_router(cash_sessions, tags=["Sesiones de caja"])
app.include_router(alquileres, tags=["Alquileres"])

app.include_router(mercado_pago, tags=["Mercado Pago"])

""" app.include_router(github, tags=["Github"]) """
app.include_router(status, tags=["Estado"])

app.include_router(password_recovery, tags=["Recuperación de contraseña"])
app.include_router(login, tags=["Login"])
app.include_router(logout, tags=["Logout"])

app.mount("/media", StaticFiles(directory="media"), name="media")
