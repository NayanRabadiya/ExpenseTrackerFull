from fastapi import APIRouter
from controllers import RoleController
from models.RoleModel import Role,RoleOut


router = APIRouter()

@router.get("/roles")
async def getAllRoles():
    return await RoleController.getAllRoles()

@router.get("/role/{id}")
async def getRoleById(id:str):
    return await RoleController.getRoleById(id)

@router.post("/role")
async def addRole(role:Role):
    return await RoleController.addRole(role)

@router.delete("/role/{id}")
async def deleteRoleById(id:str):
    return await RoleController.deleteRoleById(id)