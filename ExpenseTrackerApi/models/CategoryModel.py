from pydantic import Field,BaseModel,validator
from typing import List,Optional,Dict,Any
from bson import ObjectId

class Category(BaseModel):
    name: str
    
class CategoryOut(Category):
    id:str = Field(alias="_id")
    
    @validator("id",pre=True,always=True)
    def convert_id_str(cls,v): 
        if isinstance(v,ObjectId):
            return str(v)
        return v