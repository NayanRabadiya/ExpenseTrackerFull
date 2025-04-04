from models.CategoryModel import Category,CategoryOut
from config.database import category_collection
from bson import ObjectId
from fastapi import HTTPException
from fastapi.responses import JSONResponse

async def getAllCategories():
    categories = await category_collection.find().to_list()
    if len(categories) == 0:
        return JSONResponse(status_code=404,content={"message":"No categories found"})
    return [CategoryOut(**category) for category in categories]

async def getCategoryById(id:str):
    category = await category_collection.find_one({"_id":ObjectId(id)})
    if category:
        return JSONResponse(status_code=200,content=CategoryOut(**category).dict())
    else:
        raise HTTPException(status_code=404,content={"message":"Category with id {id} not found"})

async def addCategory(category:Category):
    saved = await category_collection.insert_one(category.dict())
    if saved.inserted_id:
        return JSONResponse(status_code=200,content=category.dict())
    raise HTTPException(status_code=500,detail="Category doesnot added..")

async def deleteCategoryById(id:str):
    category = await category_collection.delete_one({"_id":ObjectId(id)})
    if category.deleted_count == 1:
        return {"message":"Category deleted successfully"}
    else:
        raise HTTPException(status_code=404,content={"message":"Category with id {id} not found"})  
