import asyncio
from unidecode import unidecode

from app.api.init_db import init_db
from app.api.models.product import ProductDocument


def normalize_text(text: str) -> str:
    return unidecode(text).lower().strip()


async def normalize_existing_products():
    await init_db()
    productos = await ProductDocument.find_all().to_list()
    for prod in productos:
        updated = False
        if not getattr(prod, "name_normalized", None):
            prod.name_normalized = normalize_text(prod.name)
            updated = True
        if not getattr(prod, "description_normalized", None):
            prod.description_normalized = normalize_text(prod.description)
            updated = True
        if updated:
            await prod.save()
    print("Productos actualizados.")


if __name__ == "__main__":
    asyncio.run(normalize_existing_products())
