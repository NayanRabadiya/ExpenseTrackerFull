from pydantic import BaseModel,Field,validator
from typing import List,Optional,Dict,Any
from bson import ObjectId

class Budget(BaseModel):
    amount:float
    categoryId:str
    userId:str
    
    @validator("userId",pre=True, always= True)
    def convertUserId_str(cls,v):
        if isinstance(v,ObjectId):
            return str(v)
        return v
    
    @validator("categoryId",pre=True, always= True)
    def convertCategoryId_str(cls,v):
        if isinstance(v,ObjectId):
            return str(v)
        return v
    
    
class BudgetOut(Budget):
    id:str = Field(alias="_id")
    user:Optional[Dict[str,Any]] = None
    category:Optional[Dict[str,Any]] = None
    
    @validator("user",pre=True,always=True)
    def convert_user_dict(cls,v):    
        if isinstance(v,dict) and "_id" in v:
            v["_id"] = str(v["_id"])
        return v
    
    @validator("category",pre=True,always=True)
    def convert_category_dict(cls,v):
        if isinstance(v,dict) and "_id" in v:
            v["_id"] = str(v["_id"])
        return v
    
    @validator("id",pre=True,always=True)
    def convert_id_str(cls,v): 
        if isinstance(v,ObjectId):
            return str(v)
        return v
    
    