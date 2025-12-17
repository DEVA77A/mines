import sys
import os
from pathlib import Path
import json
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add parent directory to path to import backend modules
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from backend.perfect_backend import Mine, Alert, SensorReading, WeatherHistory, Base
from backend.mongo_config import MongoDB, DB_NAME

# SQLite Setup
# Use absolute path to ensure we find the DB regardless of CWD
DB_PATH = Path(__file__).parent.parent / "perfect_rockfall_system.db"
SQLITE_URL = f"sqlite:///{DB_PATH}"
engine = create_engine(SQLITE_URL)
SessionLocal = sessionmaker(bind=engine)

def migrate():
    print("🚀 Starting migration from SQLite to MongoDB...")
    
    # Connect to MongoDB (Sync)
    mongo = MongoDB()
    client = mongo.get_sync_client()
    db = client[DB_NAME]
    
    # Connect to SQLite
    session = SessionLocal()
    
    try:
        # 1. Migrate Mines
        print("📦 Migrating Mines...")
        mines = session.query(Mine).all()
        mine_collection = db["mines"]
        mine_collection.drop()  # Clear existing data
        
        mine_docs = []
        for mine in mines:
            doc = {
                "id": mine.id,  # Keep original ID for reference
                "name": mine.name,
                "location": {
                    "type": "Point",
                    "coordinates": [mine.longitude, mine.latitude]
                },
                "district": mine.district,
                "type": mine.type,
                "status": mine.status,
                "risk_level": mine.risk_level,
                "risk_score": mine.risk_score,
                "safety_score": mine.safety_score,
                "production_capacity": mine.production_capacity,
                "elevation": mine.elevation,
                "slope_angle": mine.slope_angle,
                "weather": {
                    "temperature": mine.temperature,
                    "humidity": mine.humidity,
                    "wind_speed": mine.wind_speed,
                    "recent_rainfall": mine.recent_rainfall,
                    "pressure": mine.pressure,
                    "description": mine.weather_description
                },
                "last_inspection": mine.last_inspection,
                "last_updated": mine.last_updated,
                "image_url": mine.image_url,
                "description": mine.description
            }
            mine_docs.append(doc)
        
        if mine_docs:
            mine_collection.insert_many(mine_docs)
            # Create geospatial index
            mine_collection.create_index([("location", "2dsphere")])
            mine_collection.create_index("id")
            mine_collection.create_index("district")
            mine_collection.create_index("risk_level")
            print(f"✅ Migrated {len(mine_docs)} mines")
            
        # 2. Migrate Alerts
        print("🚨 Migrating Alerts...")
        alerts = session.query(Alert).all()
        alert_collection = db["alerts"]
        alert_collection.drop()
        
        alert_docs = []
        for alert in alerts:
            doc = {
                "mine_id": alert.mine_id,
                "alert_type": alert.alert_type,
                "severity": alert.severity,
                "message": alert.message,
                "timestamp": alert.timestamp,
                "is_active": alert.is_active,
                "resolved_at": alert.resolved_at
            }
            alert_docs.append(doc)
            
        if alert_docs:
            alert_collection.insert_many(alert_docs)
            alert_collection.create_index("mine_id")
            alert_collection.create_index("timestamp")
            print(f"✅ Migrated {len(alert_docs)} alerts")

        # 3. Migrate Sensor Readings (Sample)
        print("📡 Migrating Sensor Readings...")
        readings = session.query(SensorReading).limit(1000).all() # Limit to avoid huge migration
        sensor_collection = db["sensor_readings"]
        sensor_collection.drop()
        
        reading_docs = []
        for reading in readings:
            doc = {
                "mine_id": reading.mine_id,
                "timestamp": reading.timestamp,
                "vibration": reading.vibration,
                "tilt": reading.tilt,
                "temperature": reading.temperature,
                "humidity": reading.humidity,
                "pressure": reading.pressure,
                "sound_level": reading.sound_level,
                "dust_particles": reading.dust_particles
            }
            reading_docs.append(doc)
            
        if reading_docs:
            sensor_collection.insert_many(reading_docs)
            sensor_collection.create_index("mine_id")
            sensor_collection.create_index("timestamp")
            print(f"✅ Migrated {len(reading_docs)} sensor readings")
            
        print("\n🎉 Migration Complete! MongoDB is ready.")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
    finally:
        session.close()
        client.close()

if __name__ == "__main__":
    migrate()
