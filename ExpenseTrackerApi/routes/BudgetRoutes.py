"""HTTP endpoints for budgets; all logic lives in BudgetController."""

from fastapi import APIRouter
from controllers import BudgetController
from models.BudgetModel import Budget,BudgetOut

router = APIRouter()

@router.get("/budgets")
async def getAllBudgets():
    """List every budget (admin view)."""
    return await BudgetController.getAllBudgets()

@router.get("/budget/user/{id}")
async def getBudgetByUserId(id:str):
    """List one user's budgets, plus their total."""
    return await BudgetController.getBudgetByUserId(id)

@router.post("/budget")
async def addBudget(budget:Budget):
    """Create a budget; rejected if one already exists for that user+category."""
    return await BudgetController.addBudget(budget)

@router.delete("/budget/{id}")
async def deleteBudget(id:str):
    """Delete one budget."""
    return await BudgetController.deleteBudget(id)

@router.put("/budget/{id}")
async def updateBudget(id:str,budget:Budget):
    """Replace the fields of one budget."""
    return await BudgetController.updateBudget(id,budget)
