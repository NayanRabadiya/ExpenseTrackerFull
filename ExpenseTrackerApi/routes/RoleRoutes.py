"""HTTP endpoints for roles; all logic lives in RoleController."""

from fastapi import APIRouter
from controllers import RoleController
from models.RoleModel import Role,RoleOut


router = APIRouter()

@router.get("/roles")
async def getAllRoles():
    """List every role."""
    return await RoleController.getAllRoles()

@router.get("/role/{id}")
async def getRoleById(id:str):
    """Fetch one role by id."""
    return await RoleController.getRoleById(id)

@router.post("/role")
async def addRole(role:Role):
    """Create a role."""
    return await RoleController.addRole(role)

@router.delete("/role/{id}")
async def deleteRoleById(id:str):
    """Delete a role, and every user holding it."""
    return await RoleController.deleteRoleById(id)
