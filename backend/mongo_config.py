import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient

# Load environment variables
load_dotenv()

# MongoDB Configuration
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = "rockfall_system"

class MongoDB:
    client: AsyncIOMotorClient = None
    db = None

    def connect(self):
        """Connect to MongoDB (Async)"""
        self.client = AsyncIOMotorClient(MONGO_URL)
        self.db = self.client[DB_NAME]
        print(f"✅ Connected to MongoDB at {MONGO_URL} (Database: {DB_NAME})")

    def close(self):
        """Close MongoDB connection"""
        if self.client:
            self.client.close()
            print("🛑 MongoDB connection closed")

    def get_sync_client(self):
        """Get a synchronous client for scripts/migrations"""
        return MongoClient(MONGO_URL)

# Singleton instance
db = MongoDB()

async def get_database():
    return db.db
