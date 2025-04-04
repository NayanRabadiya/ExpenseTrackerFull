from fastapi import APIRouter
from controllers import BudgetController
from models.BudgetModel import Budget,BudgetOut

router = APIRouter()

@router.get("/budgets")
async def getAllBudgets():
    return await BudgetController.getAllBudgets()

@router.get("/budget/user/{id}")
async def getBudgetByUserId(id:str):
    return await BudgetController.getBudgetByUserId(id)

@router.post("/budget")
async def addBudget(budget:Budget):
    return await BudgetController.addBudget(budget)

@router.delete("/budget/{id}")
async def deleteBudget(id:str):
    return await BudgetController.deleteBudget(id)
