"""Request/response schemas for expense categories."""

from pydantic import Field,BaseModel,validator
from typing import List,Optional,Dict,Any
from bson import ObjectId

# Incoming category payload.
class Category(BaseModel):
    name: str

# Outgoing category, with the Mongo _id exposed as "id".
class CategoryOut(Category):
    id:str = Field(alias="_id")

    @validator("id",pre=True,always=True)
    def convert_id_str(cls,v):
        """Turn Mongo's ObjectId into a JSON-safe string."""
        if isinstance(v,ObjectId):
            return str(v)
        return v