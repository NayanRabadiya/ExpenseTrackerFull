"""Request/response schemas for users, login, and password reset."""

from pydantic import BaseModel,Field,validator
from typing import List,Optional,Dict,Any,Annotated
from fastapi import UploadFile,File,Form
from bson import ObjectId
import bcrypt

# Incoming user payload (password arrives plain, is hashed before saving).
class User(BaseModel):
    name: str
    contact: str
    email: str
    password: str
    address: Optional[str] = None
    roleId: str
    imgUrl: Optional[str] = None
    # image: UploadFile = File(...)


    @validator("roleId",pre=True, always= True)
    def convertRoleId_str(cls,v):
        """Turn Mongo's ObjectId into a JSON-safe string."""
        if isinstance(v,ObjectId):
            return str(v)
        return v



# Outgoing user: adds the id and the joined role name.
class UserOut(User):
    id:str = Field(alias="_id")
    role:Optional[Dict[str,Any]] = None

    @validator("id",pre=True,always=True)
    def convert_id_str(cls,v):
        """Turn Mongo's ObjectId into a JSON-safe string."""
        if isinstance(v,ObjectId):
            return str(v)
        return v

    @validator("role",pre=True,always=True)
    def convert_role_dict(cls,v):
        """Stringify the _id inside the embedded role, if present."""
        if isinstance(v,dict) and "_id" in v:
            v["_id"] = str(v["_id"])
        return v

# Login body for both /login/user and /login/admin.
class UserLogin(BaseModel):
    email: str
    password: str



# Body for /forgotpassword — the address to mail the reset link to.
class ForgotPasswordReq(BaseModel):
    email:str

# Body for /resetpassword — the emailed token plus the new password.
class ResetPasswordReq(BaseModel):
    token:str
    password:str
