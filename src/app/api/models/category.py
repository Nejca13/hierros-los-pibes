from typing import Optional
from pydantic import BaseModel, Field
from beanie import Document
import uuid


class Category(BaseModel):
    name: str
    icon: Optional[str] = None


class CategoryDocument(Category, Document):

    class Settings:
        collection = "categories"
