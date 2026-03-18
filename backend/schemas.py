from pydantic import BaseModel
from typing import Optional


class MapCreate(BaseModel):
    title: str
    nodes: str  # JSON stringified
    description: str = ''
    tags: list[str] = []


class MapUpdate(BaseModel):
    title: Optional[str] = None
    nodes: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[list[str]] = None


class AiExpandRequest(BaseModel):
    text: str


class SearchRequest(BaseModel):
    query: str
