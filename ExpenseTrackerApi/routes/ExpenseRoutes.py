from fastapi import APIRouter
from controllers import ExpenseController
from models.ExpenseModel import Expenses,ExpensesOut
from fastapi import File, Form, UploadFile, Depends


router = APIRouter()

@router.get("/expenses")
async def getAllExpenses():
    return await ExpenseController.getAllExpenses()

@router.get("/expenses/{id}")
async def getExpensesByuserId(id:str):    
    return await ExpenseController.getExpensesByuserId(id)

@router.post("/expense")
async def addExpense(expense:Expenses):
    return await ExpenseController.addExpense(expense)



@router.delete("/expense/{id}")
async def deleteExpenseById(id:str):
    return await ExpenseController.deleteExpenseById(id)

@router.put("/expense/{id}")
async def update_expense(id: str, data: Expenses):
    return await ExpenseController.updateExpense(id, data)
