"""Expense CRUD against the `expenses` collection.

Reads are enriched with the related category and user via the helpers at the
bottom of this file.
"""

from models.ExpenseModel import Expenses,ExpensesOut
from models.UserModel import UserOut
from models.CategoryModel import CategoryOut
from controllers.UserController import getRoleData
from config.database import user_collection,expenses_collection,category_collection
from bson import ObjectId
from fastapi import HTTPException
from fastapi.responses import JSONResponse
import bcrypt


async def addExpense(expense:Expenses):
    """Insert an expense, storing userId/categoryId as real ObjectIds."""

    expense.userId = ObjectId(expense.userId)
    expense.categoryId = ObjectId(expense.categoryId)
    saved = await expenses_collection.insert_one(expense.dict())
    expense.userId = str(expense.userId)
    expense.categoryId = str(expense.categoryId)

    if saved.inserted_id:
        return JSONResponse(status_code=200,content=expense.dict())
    return JSONResponse(status_code=500,content="Expense doesnot added..")

async def getAllExpenses():
    """Return every expense with its category and user, or 404 when none exist."""
    expenses = await expenses_collection.find().to_list()

    if len(expenses) == 0:
        # print("00000000000")
        return JSONResponse(status_code=404,content={"message":"No expenses found"})
    for expense in expenses:
        expense = await getCategoryData(expense)
        expense = await getUserData(expense)
    return [ExpensesOut(**expense) for expense in expenses]

async def getExpensesByuserId(userId:str):
    """Return one user's expenses, or 404 when they have none yet."""
    expenses = await expenses_collection.find({"userId":ObjectId(userId)}).to_list()

    if len(expenses) == 0:
        return JSONResponse(status_code=404,content={"message":"No expenses found for this user"})
    for expense in expenses:
        expense = await getCategoryData(expense)
        expense = await getUserData(expense)
    return [ExpensesOut(**expense) for expense in expenses]

async def deleteExpenseById(id:str):
    """Delete one expense, or 404 if that id doesn't exist."""
    # print("......id",id)
    result = await expenses_collection.delete_one({"_id":ObjectId(id)})
    if result.deleted_count == 1:
        return {"message":"Expense deleted successfully"}
    else:
        return JSONResponse(status_code=404,content={"message":f'Expense with id {id} not found'})

async def updateExpense(id: str, updated_data: Expenses):
    """Overwrite one expense and return it with category/user attached."""
    try:
        # Convert IDs to ObjectId for DB query
        updated_data.userId = ObjectId(updated_data.userId)
        updated_data.categoryId = ObjectId(updated_data.categoryId)

        result = await expenses_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": updated_data.dict()}
        )

        updated_expense = await expenses_collection.find_one({"_id": ObjectId(id)})
        updated_expense = await getCategoryData(updated_expense)
        updated_expense = await getUserData(updated_expense)

        return JSONResponse(status_code=200, content=ExpensesOut(**updated_expense).dict())

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating expense: {str(e)}")


# ---- helpers: attach related documents to an expense ----

async def getCategoryData(expense):
    """Attach {"category": {...}} to an expense; None if the category is gone."""
    if "categoryId" in expense:
        category = await category_collection.find_one({"_id":ObjectId(expense["categoryId"])})

        expense["category"] = {"name":category['name']} if category else None
    else:
        expense["category"] = None
    return expense

async def getUserData(expense):
    """Attach {"user": {...}} to an expense; None if the user is gone."""
    # print("........expense user id",expense["userId"])
    if "userId" in expense:
        # print("........expense",expense)
        user = await user_collection.find_one({"_id":ObjectId(expense["userId"])})
        # print("........user",user)
        if user:
            user = await getRoleData(user)
            expense["user"] = {"name":user['name'],"email":user['email']}
        else:
            expense["user"] = None
    else:
        expense["user"] = None
    return expense
