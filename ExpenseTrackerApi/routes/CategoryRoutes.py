from fastapi import APIRouter
from controllers import CategoryController
from models.CategoryModel  import Category,CategoryOut



router = APIRouter()

@router.get("/categories")
async def getAllCategories():
    return await CategoryController.getAllCategories()

@router.get("/category/{id}")
async def getCategoryById(id:str):
    return await CategoryController.getCategoryById(id)

@router.post("/category")
async def addCategory(cat:Category):
    return await CategoryController.addCategory(cat)

@router.delete("/category/{id}")
async def deleteCategoryById(id:str):
    return await CategoryController.deleteCategoryById(id)