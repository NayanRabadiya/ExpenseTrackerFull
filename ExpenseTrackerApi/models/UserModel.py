from pydantic import BaseModel,Field,validator
from typing import List,Optional,Dict,Any,Annotated
from fastapi import UploadFile,File,Form
from bson import ObjectId
import bcrypt

class User(BaseModel):
    name: str
    contact: str
    email: str
    password: str
    address: Optional[str]
    roleId: str
    imgUrl: Optional[str] = None
    # image: UploadFile = File(...) 

    
    @validator("roleId",pre=True, always= True)
    def convertRoleId_str(cls,v):
        if isinstance(v,ObjectId):
            return str(v)
        return v
    
    
    
class UserOut(User):
    id:str = Field(alias="_id")
    role:Optional[Dict[str,Any]] = None

    @validator("id",pre=True,always=True)
    def convert_id_str(cls,v): 
        if isinstance(v,ObjectId):
            return str(v)
        return v
    
    @validator("role",pre=True,always=True)
    def convert_role_dict(cls,v):
        if isinstance(v,dict) and "_id" in v:
            v["_id"] = str(v["_id"])
        return v
    
class UserLogin(BaseModel):
    email: str
    password: str
    
    
    
class ForgotPasswordReq(BaseModel):
    email:str
    
class ResetPasswordReq(BaseModel):
    token:str
    password:str    