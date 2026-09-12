"""Category CRUD against the `category` collection."""

from models.CategoryModel import Category, CategoryOut
from config.database import category_collection, expenses_collection, budget_collection
from bson import ObjectId
from fastapi import HTTPException
from fastapi.responses import JSONResponse


async def getAllCategories():
    """Return every category, or 404 when none exist."""
    categories = await category_collection.find().to_list()
    if len(categories) == 0:
        return JSONResponse(status_code=404, content={"message": "No categories found"})
    return [CategoryOut(**category) for category in categories]


async def getCategoryById(id: str):
    """Return one category, or 404 if it doesn't exist."""
    category = await category_collection.find_one({"_id": ObjectId(id)})
    if category:
        return JSONResponse(status_code=200, content=CategoryOut(**category).dict())
    else:
        raise HTTPException(status_code=404, detail=f"Category with id {id} not found")


async def addCategory(category: Category):
    """Insert a new category."""
    saved = await category_collection.insert_one(category.dict())
    if saved.inserted_id:
        return JSONResponse(status_code=200, content=category.dict())
    raise HTTPException(status_code=500, detail="Category doesnot added..")


async def deleteCategoryById(id: str):
    """Delete a category and cascade-delete its expenses and budgets."""
    category = await category_collection.delete_one({"_id": ObjectId(id)})

    if category.deleted_count == 1:
        await expenses_collection.delete_many({"categoryId": ObjectId(id)})
        await budget_collection.delete_many({"categoryId": ObjectId(id)})
        return {"message": "Category deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail=f"Category with id {id} not found")


async def updateCategory(id: str, category: Category):
    """Rename a category.

    Note: update_one always returns a result object, so this reports success
    even when no document matched that id.
    """
    result = await category_collection.update_one(
        {"_id": ObjectId(id)}, {"$set": category.dict()}
    )
    if result:
        return JSONResponse(status_code=200, content={"_id": id, "name": category.name})
    else:
        raise HTTPException(status_code=404, detail=f"Category with id {id} not found")
