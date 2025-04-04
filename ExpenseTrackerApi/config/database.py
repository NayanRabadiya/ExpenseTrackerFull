from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb://localhost:27017"
DATABASE_NAME ="ExpenseTracker"

client = AsyncIOMotorClient(MONGO_URL) #server
db = client[DATABASE_NAME] #db

role_collection = db["roles"] #table
user_collection = db["users"]
category_collection = db["category"]
expenses_collection = db["expenses"]
budget_collection = db["budget"]