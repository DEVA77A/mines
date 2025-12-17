import os
from pymongo import MongoClient
from dotenv import load_dotenv
import urllib.parse

load_dotenv()

url = os.getenv("MONGO_URL")
print(f"Attempting to connect with URL length: {len(url) if url else 0}")

# Mask password for display
if "@" in url:
    prefix = url.split("@")[0]
    suffix = url.split("@")[1]
    if ":" in prefix:
        user = prefix.split("://")[1].split(":")[0]
        password = prefix.split("://")[1].split(":")[1]
        print(f"User: {user}")
        print(f"Password: {password}") # Printing password for debugging since user is having trouble
    print(f"Host: {suffix}")

try:
    client = MongoClient(url)
    # The ismaster command is cheap and does not require auth.
    # But to check auth we need to do something that requires it, like list_database_names
    print("Connection created. Testing authentication...")
    dbs = client.list_database_names()
    print("✅ Authentication Successful!")
    print("Databases:", dbs)
except Exception as e:
    print("❌ Connection/Auth Failed")
    print(e)
