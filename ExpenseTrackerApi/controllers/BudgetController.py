"""Budget CRUD against the `budget` collection.

One budget per user+category; reads are enriched with the related user and
category via the helpers at the bottom of this file.
"""

from models.BudgetModel import Budget, BudgetOut
from models.UserModel import UserOut
from models.CategoryModel import CategoryOut
from config.database import budget_collection, user_collection, category_collection
from bson import ObjectId
from fastapi import HTTPException
from fastapi.responses import JSONResponse
from controllers.UserController import getRoleData


async def getAllBudgets():
    """Return every budget (capped at 100), or 404 when none exist."""
    budgets = await budget_collection.find().to_list(length=100)
    if not budgets:
        return JSONResponse(status_code=404, content={"message": "No Budget found"})

    for i in range(len(budgets)):
        budgets[i] = await getUserData(budgets[i])
        budgets[i] = await getCategoryData(budgets[i])

    return [BudgetOut(**budget).dict() for budget in budgets]


async def addBudget(budget: Budget):
    """Create a budget, rejecting a duplicate for the same user+category."""
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
    """Return one user's budgets plus their summed total, or 404 if they have none."""
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
    """Delete one budget, or 404 if that id doesn't exist."""
    result = await budget_collection.delete_one({"_id": ObjectId(id)})
    if result.deleted_count == 1:
        return {"message": "Budget deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail=f"Budget with id {id} not found")

async def updateBudget(id: str, budget: Budget):
    """Overwrite one budget and return it with user/category attached."""

    try:
        budget.categoryId = ObjectId(budget.categoryId)
        budget.userId = ObjectId(budget.userId)

        result = await budget_collection.update_one({"_id": ObjectId(id)}, {"$set": budget.dict()})

        updatedBudget = await budget_collection.find_one({"_id": ObjectId(id)})
        updateBudget = await getCategoryData(updatedBudget)
        updateBudget = await getUserData(updateBudget)

        return JSONResponse(status_code=200, content=BudgetOut(**updatedBudget).dict())

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating Budget: {str(e)}")


# ---- helpers: attach related documents to a budget ----

async def getUserData(budget):
    """Attach {"user": {...}} to a budget; None if the user is gone."""
    if "userId" in budget:
        user = await user_collection.find_one({"_id": ObjectId(budget["userId"])})
        if user:
            budget["user"] = {"name": user["name"], "email": user["email"]}
        else:
            budget["user"] = None
    return budget


async def getCategoryData(budget):
    """Attach {"category": {...}} to a budget; None if the category is gone."""
    if "categoryId" in budget:
        category = await category_collection.find_one({"_id": ObjectId(budget["categoryId"])})
        if category:
            budget["category"] = {"name": category["name"]}
        else:
            budget["category"] = None
    return budget
