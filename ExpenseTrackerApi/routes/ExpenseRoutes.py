from fastapi import APIRouter
from controllers import ExpenseController
from models.ExpenseModel import Expenses,ExpensesOut

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