"""Creates the MongoDB connection and exposes one handle per collection."""

from motor.motor_asyncio import AsyncIOMotorClient
from config.settings import MONGO_URL, DATABASE_NAME

client = AsyncIOMotorClient(MONGO_URL) #server
db = client[DATABASE_NAME] #db

role_collection = db["roles"] #table
user_collection = db["users"]
category_collection = db["category"]
expenses_collection = db["expenses"]
budget_collection = db["budget"]