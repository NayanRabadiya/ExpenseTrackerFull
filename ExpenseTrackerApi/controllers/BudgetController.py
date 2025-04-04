from models.BudgetModel import Budget, BudgetOut
from models.UserModel import UserOut
from models.CategoryModel import CategoryOut
from config.database import budget_collection, user_collection, category_collection
from bson import ObjectId
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from controllers.UserController import getRoleData


async def getAllBudgets():
    budgets = await budget_collection.find().to_list(length=100)
    if not budgets:
        return JSONResponse(status_code=404, content={"message": "No Budget found"})
    
    for i in range(len(budgets)):
        budgets[i] = await getUserData(budgets[i])
        budgets[i] = await getCategoryData(budgets[i])

    return [BudgetOut(**budget).dict() for budget in budgets]


async def addBudget(budget: Budget):
    existing_budget = await budget_collection.find_one(
        {"userId": ObjectId(budget.userId), "categoryId": ObjectId(budget.categoryId)}
    )

    if existing_budget:
        existing_budget["_id"] = str(existing_budget["_id"])  # Convert ObjectId to string
        print(BudgetOut(**existing_budget).dict())
        raise HTTPException(status_code=400, detail={"message": "Budget already exists", "budget": BudgetOut(**existing_budget).dict()})

    
    budget_dict = budget.dict()
    budget_dict['categoryId'] = ObjectId(budget.categoryId)
    budget_dict['userId'] = ObjectId(budget.userId)
    saved = await budget_collection.insert_one(budget_dict)

    print("....saved",saved)
    if saved.inserted_id:
        result  = await budget_collection.find_one({"_id": saved.inserted_id})
        
        return JSONResponse(status_code=200, content=BudgetOut(**result).dict())
    
    raise HTTPException(status_code=500, detail="Budget not added..")


async def getBudgetByUserId(id: str):
    budgets = await budget_collection.find({"userId": ObjectId(id)}).to_list(length=100)
    if not budgets:
        return JSONResponse(status_code=404, content={"message": "No Budget found"})

    for i in range(len(budgets)):
        budgets[i] = await getUserData(budgets[i])
        budgets[i] = await getCategoryData(budgets[i])

    total_Budget = sum(budget["amount"] for budget in budgets)
    budget_list = [BudgetOut(**budget).dict() for budget in budgets]

    return {"Budget": budget_list, "total_Budget": total_Budget}


async def deleteBudget(id: str):
    result = await budget_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 1:
        return {"message": "Budget deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail=f"Budget with id {id} not found")


async def getUserData(budget):
    if "userId" in budget:
        user = await user_collection.find_one({"_id": ObjectId(budget["userId"])})
        if user:
            budget["user"] = {"name": user["name"], "email": user["email"]}
        else:
            budget["user"] = None
    return budget


async def getCategoryData(budget):
    if "categoryId" in budget:
        category = await category_collection.find_one({"_id": ObjectId(budget["categoryId"])})
        if category:
            budget["category"] = {"name": category["name"]}
        else:
            budget["category"] = None
    return budget
