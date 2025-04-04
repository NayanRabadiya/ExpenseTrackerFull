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
    
    expense.userId = ObjectId(expense.userId)
    expense.categoryId = ObjectId(expense.categoryId)
    saved = await expenses_collection.insert_one(expense.dict()) 
    expense.userId = str(expense.userId)
    expense.categoryId = str(expense.categoryId)
      
    if saved.inserted_id:
        return JSONResponse(status_code=200,content=expense.dict())
    return JSONResponse(status_code=500,content="Expense doesnot added..")

async def getAllExpenses():
    expenses = await expenses_collection.find().to_list()
    
    if len(expenses) == 0:
        # print("00000000000")
        return JSONResponse(status_code=404,content={"message":"No expenses found"})
    for expense in expenses:
        expense = await getCategoryData(expense)
        expense = await getUserData(expense)
    return [ExpensesOut(**expense) for expense in expenses]

async def getExpensesByuserId(userId:str):
    expenses = await expenses_collection.find({"userId":ObjectId(userId)}).to_list()
    
    if len(expenses) == 0:
        return JSONResponse(status_code=404,content={"message":"No expenses found for this user"})
    for expense in expenses:
        expense = await getCategoryData(expense)
        expense = await getUserData(expense)
    return [ExpensesOut(**expense) for expense in expenses]

async def deleteExpenseById(id:str):
    # print("......id",id)
    result = await expenses_collection.delete_one({"_id":ObjectId(id)})
    if result.deleted_count == 1:
        return {"message":"Expense deleted successfully"}
    else:
        return JSONResponse(status_code=404,content={"message":f'Expense with id {id} not found'})



























async def getCategoryData(expense):
    if "categoryId" in expense:
        category = await category_collection.find_one({"_id":ObjectId(expense["categoryId"])})

        expense["category"] = {"name":category['name']}
    else:
        expense["category"] = None
    return expense

async def getUserData(expense):
    # print("........expense user id",expense["userId"])
    if "userId" in expense:
        # print("........expense",expense)
        user = await user_collection.find_one({"_id":ObjectId(expense["userId"])})
        # print("........user",user)
        user = await getRoleData(user)
        expense["user"] = {"name":user['name'],"email":user['email']}
    else:
        expense["user"] = None
    return expense