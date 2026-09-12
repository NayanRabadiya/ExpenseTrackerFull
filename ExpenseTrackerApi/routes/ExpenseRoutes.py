"""HTTP endpoints for expenses; all logic lives in ExpenseController."""

from fastapi import APIRouter
from controllers import ExpenseController
from models.ExpenseModel import Expenses,ExpensesOut
from fastapi import File, Form, UploadFile, Depends


router = APIRouter()

@router.get("/expenses")
async def getAllExpenses():
    """List every expense (admin view)."""
    return await ExpenseController.getAllExpenses()

@router.get("/expenses/{id}")
async def getExpensesByuserId(id:str):
    """List one user's expenses. Note: {id} is a USER id, not an expense id."""
    return await ExpenseController.getExpensesByuserId(id)

@router.post("/expense")
async def addExpense(expense:Expenses):
    """Create an expense."""
    return await ExpenseController.addExpense(expense)



@router.delete("/expense/{id}")
async def deleteExpenseById(id:str):
    """Delete one expense."""
    return await ExpenseController.deleteExpenseById(id)

@router.put("/expense/{id}")
async def update_expense(id: str, data: Expenses):
    """Replace the fields of one expense."""
    return await ExpenseController.updateExpense(id, data)
