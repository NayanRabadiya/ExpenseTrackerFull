from fastapi import FastAPI
from routes.RoleRoutes import router as role_router
from routes.UserRoutes import router as User_router
from routes.CategoryRoutes import router as Category_router
from routes.ExpenseRoutes import router as Expense_router
from routes.BudgetRoutes import router as Budget_router

from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(role_router)
app.include_router(User_router)
app.include_router(Category_router)
app.include_router(Expense_router)
app.include_router(Budget_router)