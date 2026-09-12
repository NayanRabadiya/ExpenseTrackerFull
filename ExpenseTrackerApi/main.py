"""App entrypoint: CORS, error handlers, routers, and the MongoDB backup job."""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from bson.errors import InvalidId
from routes.RoleRoutes import router as role_router
from routes.UserRoutes import router as User_router
from routes.CategoryRoutes import router as Category_router
from routes.ExpenseRoutes import router as Expense_router
from routes.BudgetRoutes import router as Budget_router

from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler
import datetime
import os

from config.database import MONGO_URL, DATABASE_NAME
from config.settings import CORS_ORIGIN

app = FastAPI()

# CORS Configuration — only the frontend origins from .env may call this API.
# Comma-separated so a deployed origin and localhost can be allowed at once.
allowed_origins = [origin.strip() for origin in CORS_ORIGIN.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# A malformed path id (not a 24-char hex string) would otherwise surface as a 500
@app.exception_handler(InvalidId)
async def invalid_id_handler(request: Request, exc: InvalidId):
    """Answer 422 instead of 500 when a path id isn't a valid ObjectId."""
    return JSONResponse(status_code=422, content={"message": "Invalid id format"})


# Register Routers — one per resource
app.include_router(role_router)
app.include_router(User_router)
app.include_router(Category_router)
app.include_router(Expense_router)
app.include_router(Budget_router)

# Scheduled Task Function
def backup_mongodb():
    """Dump the database into a timestamped folder under backups/.

    Needs the MongoDB Database Tools (`mongodump`) on PATH; without them this
    logs a failure and the server carries on regardless.
    """
    timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
    backup_dir = f"backups/mongodb_backup_{timestamp}"
    os.makedirs(backup_dir, exist_ok=True)

    os.system(f"mongodump --uri={MONGO_URL} --db={DATABASE_NAME} --out={backup_dir}")
    print(f"[{timestamp}] MongoDB backup completed.")

# The backup job needs a long-lived process, a writable working directory and
# `mongodump` on PATH — none of which a serverless host provides, so it is set up
# only when running as a normal server. Vercel sets VERCEL=1 in every deployment.
IS_SERVERLESS = bool(os.getenv("VERCEL"))

if not IS_SERVERLESS:
    # Scheduler Setup
    scheduler = BackgroundScheduler()
    scheduler.add_job(backup_mongodb, 'cron', hour=12, minute=0)  # Daily at 12:00 noon
    scheduler.start()

    # Graceful Shutdown
    @app.on_event("shutdown")
    def shutdown_event():
        """Stop the scheduler so the process can exit cleanly."""
        scheduler.shutdown()

    @app.on_event("startup")
    async def run_backup_on_startup():
        """Take one backup as soon as the server boots."""
        print("Server is starting... Running MongoDB backup.")
        backup_mongodb()

# Optional Root Endpoint
@app.get("/")
async def root():
    """Health check — confirms the API is up."""
    return {"message": "Expense Tracker API with MongoDB backup job running."}


# TEMPORARY — delete once Vercel routing is confirmed working.
# Registered last, so it only runs for requests no real route matched, and
# reports what the ASGI app actually received instead of a bare 404.
@app.api_route("/{unmatched_path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def debug_unmatched(unmatched_path: str, request: Request):
    """Echo the received path so a routing mismatch is visible from the browser."""
    return {
        "debug": "no route matched",
        "received_path": request.url.path,
        "root_path": request.scope.get("root_path"),
        "registered_paths": sorted(
            {route.path for route in app.routes if hasattr(route, "path")}
        ),
    }
