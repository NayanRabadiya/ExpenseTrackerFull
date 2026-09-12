"""HTTP endpoints for categories; all logic lives in CategoryController."""

from fastapi import APIRouter
from controllers import CategoryController
from models.CategoryModel  import Category,CategoryOut



router = APIRouter()

@router.get("/categories")
async def getAllCategories():
    """List every category."""
    return await CategoryController.getAllCategories()

@router.get("/category/{id}")
async def getCategoryById(id:str):
    """Fetch one category by id."""
    return await CategoryController.getCategoryById(id)

@router.post("/category")
async def addCategory(cat:Category):
    """Create a category."""
    return await CategoryController.addCategory(cat)

@router.delete("/category/{id}")
async def deleteCategoryById(id:str):
    """Delete a category, and every expense/budget under it."""
    return await CategoryController.deleteCategoryById(id)


@router.put("/category/{id}")
async def deleteCategoryById(id:str,cat:Category):
    """Rename an existing category."""
    return await CategoryController.updateCategory(id, cat)
