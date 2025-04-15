from fastapi import FastAPI
from routes.RoleRoutes import router as role_router
from routes.UserRoutes import router as User_router
from routes.CategoryRoutes import router as Category_router
from routes.ExpenseRoutes import router as Expense_router
from routes.BudgetRoutes import router as Budget_router

from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
import datetime
import os

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(role_router)
app.include_router(User_router)
app.include_router(Category_router)
app.include_router(Expense_router)
app.include_router(Budget_router)

# Scheduled Task Function
def backup_mongodb():
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_dir = f"backups/mongodb_backup_{timestamp}"
    os.makedirs(backup_dir, exist_ok=True)

    mongo_uri = "mongodb://localhost:27017"
    db_name = "ExpenseTracker"
    os.system(f"mongodump --uri={mongo_uri} --db={db_name} --out={backup_dir}")
    print(f"[{timestamp}] MongoDB backup completed.")

# Scheduler Setup
scheduler = BackgroundScheduler()
scheduler.add_job(backup_mongodb, 'cron', hour=12, minute=0)  # Daily at 2:00 AM
scheduler.start()

# Graceful Shutdown
@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()
    
@app.on_event("startup")
async def run_backup_on_startup():
    print("Server is starting... Running MongoDB backup.")
    backup_mongodb()

# Optional Root Endpoint
@app.get("/")
async def root():
    return {"message": "Expense Tracker API with MongoDB backup job running."}
