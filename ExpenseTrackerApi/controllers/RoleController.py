from models.RoleModel import Role,RoleOut
from config.database import role_collection,user_collection
from bson import ObjectId
from fastapi import HTTPException
from fastapi.responses import JSONResponse
# from fastapi import APIRouter

async def addRole(role:Role):
    saved = await role_collection.insert_one(role.dict())
   
    if saved.acknowledged:
        return JSONResponse(status_code=200,content=role.dict())
    raise HTTPException(status_code=500,detail="Role doesnot added..")
    
    
async def getAllRoles():
    roles = await role_collection.find().to_list()
    if len(roles) == 0:
        return JSONResponse(status_code=404,detail="No roles found")
    return [RoleOut(**role) for role in roles]

async def getRoleById(id:str):
    role = await role_collection.find_one({"_id":ObjectId(id)})
    if role:
        return JSONResponse(status_code=200,content=RoleOut(**role).dict())
    else:
        raise HTTPException(status_code=404,detail=f"Role with id {id} not found")

async def deleteRoleById(id:str):
    role = await role_collection.delete_one({"_id":ObjectId(id)})
    if role.deleted_count == 1:
        await user_collection.delete_many({"roleId":ObjectId(id)})
        return {"message":"Role deleted successfully"}
    else:
        raise HTTPException(status_code=404,detail=f"Role with id {id} not found")