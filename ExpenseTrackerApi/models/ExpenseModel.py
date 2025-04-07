from pydantic import BaseModel,Field,validator,ConfigDict
from typing import List,Optional,Dict,Any
from bson import ObjectId

class Expenses(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    amount:float
    date:str
    description:Optional[str]
    title:str
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
    
class ExpensesOut(Expenses):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    id:str = Field(alias="_id")
    category:Optional[Dict[str,Any]] = None
    user:Optional[Dict[str,Any]] = None
    
    @validator("category",pre=True,always=True)
    def convert_category_dict(cls,v):
        if isinstance(v,dict) and "_id" in v:
            v["_id"] = str(v["_id"])
        return v
    
    @validator("user",pre=True,always=True)
    def convert_user_dict(cls,v):    
        if isinstance(v,dict) and "_id" in v:
            v["_id"] = str(v["_id"])
        return v
    
    @validator("id",pre=True,always=True)
    def convert_id_str(cls,v): 
        if isinstance(v,ObjectId):
            return str(v)
        return v
    
    
        