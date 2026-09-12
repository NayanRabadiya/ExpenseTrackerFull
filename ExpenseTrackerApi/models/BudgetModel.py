"""Request/response schemas for per-category budgets."""

from pydantic import BaseModel,Field,validator
from typing import List,Optional,Dict,Any
from bson import ObjectId

# Incoming budget payload.
class Budget(BaseModel):
    amount:float
    categoryId:str
    userId:str

    @validator("userId",pre=True, always= True)
    def convertUserId_str(cls,v):
        """Turn Mongo's ObjectId into a JSON-safe string."""
        if isinstance(v,ObjectId):
            return str(v)
        return v

    @validator("categoryId",pre=True, always= True)
    def convertCategoryId_str(cls,v):
        """Turn Mongo's ObjectId into a JSON-safe string."""
        if isinstance(v,ObjectId):
            return str(v)
        return v


# Outgoing budget: adds the id and the joined user/category details.
class BudgetOut(Budget):
    id:str = Field(alias="_id")
    user:Optional[Dict[str,Any]] = None
    category:Optional[Dict[str,Any]] = None

    @validator("user",pre=True,always=True)
    def convert_user_dict(cls,v):
        """Stringify the _id inside the embedded user, if present."""
        if isinstance(v,dict) and "_id" in v:
            v["_id"] = str(v["_id"])
        return v

    @validator("category",pre=True,always=True)
    def convert_category_dict(cls,v):
        """Stringify the _id inside the embedded category, if present."""
        if isinstance(v,dict) and "_id" in v:
            v["_id"] = str(v["_id"])
        return v

    @validator("id",pre=True,always=True)
    def convert_id_str(cls,v):
        """Turn Mongo's ObjectId into a JSON-safe string."""
        if isinstance(v,ObjectId):
            return str(v)
        return v


