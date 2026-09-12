"""Request/response schemas for roles (admin vs standard user)."""

from pydantic import BaseModel,Field,validator
from typing import List,Optional,Dict,Any
from bson import ObjectId

# Incoming role payload.
class Role(BaseModel):
    name:str
    description:str

# Outgoing role, with the Mongo _id exposed as "id".
class RoleOut(Role):
    id:str = Field(alias="_id")

    @validator("id",pre=True,always=True)
    def convert_id_str(cls,v):
        """Turn Mongo's ObjectId into a JSON-safe string."""
        if isinstance(v,ObjectId):
            return str(v)
        return v