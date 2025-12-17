#!/usr/bin/env python3
"""
Perfect AI-Powered Rockfall Risk Prediction System v5.0 (MongoDB Edition)
- MongoDB Integration for scalable data storage
- Perfect mine placement within Tamil Nadu land boundaries
- Real-time Weather Monitoring & Risk Assessment
"""

import asyncio
import json
import logging
import random
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager
from pathlib import Path

import uvicorn
from fastapi import FastAPI, HTTPException, Query, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
import numpy as np
import joblib
from motor.motor_asyncio import AsyncIOMotorDatabase
import httpx

# Import MongoDB Config
try:
    from backend.mongo_config import MongoDB, get_database, DB_NAME
except ImportError:
    # Fallback for direct execution
    import sys
    sys.path.append(str(Path(__file__).parent.parent))
    from backend.mongo_config import MongoDB, get_database, DB_NAME

# Global variables for ML models
ml_models = {}
scaler = None
feature_columns = []

# Pydantic models (Updated for MongoDB)
class MineResponse(BaseModel):
    id: int
    name: str
    latitude: float = Field(alias="latitude")
    longitude: float = Field(alias="longitude")
    district: str
    type: str
    status: str
    risk_level: str
    risk_score: float
    safety_score: float
    production_capacity: float
    elevation: float
    slope_angle: float
    temperature: float = Field(default=0.0)
    humidity: float = Field(default=0.0)
    wind_speed: float = Field(default=0.0)
    recent_rainfall: float = Field(default=0.0)
    pressure: float = Field(default=0.0)
    weather_description: str = Field(default="Unknown")
    last_inspection: str
    last_updated: str
    image_url: str
    description: str

    def __init__(self, **data):
        # Handle nested location and weather data from MongoDB
        if "location" in data and "coordinates" in data["location"]:
            data["longitude"] = data["location"]["coordinates"][0]
            data["latitude"] = data["location"]["coordinates"][1]
        
        if "weather" in data:
            w = data["weather"]
            data["temperature"] = w.get("temperature", 0.0)
            data["humidity"] = w.get("humidity", 0.0)
            data["wind_speed"] = w.get("wind_speed", 0.0)
            data["recent_rainfall"] = w.get("recent_rainfall", 0.0)
            data["pressure"] = w.get("pressure", 0.0)
            data["weather_description"] = w.get("description", "Unknown")
            
        # Handle datetime objects
        if isinstance(data.get("last_inspection"), datetime):
            data["last_inspection"] = data["last_inspection"].isoformat()
        if isinstance(data.get("last_updated"), datetime):
            data["last_updated"] = data["last_updated"].isoformat()
            
        super().__init__(**data)

class WeatherData(BaseModel):
    temperature: float
    humidity: float
    wind_speed: float
    pressure: float
    rainfall: float
    description: str
    timestamp: str

class AlertResponse(BaseModel):
    mine_id: int
    alert_type: str
    severity: str
    message: str
    timestamp: str
    is_active: bool

class MineFeatures(BaseModel):
    latitude: float
    longitude: float
    elevation_m: float
    slope_degrees: float
    avg_rainfall_mm: float
    avg_temp_c: float
    mineral_type: str
    lease_area_ha: float

class RiskPredictionResponse(BaseModel):
    risk_category: str
    risk_probability: Dict[str, float]
    risk_factors: Dict[str, Any]
    confidence: float

# Mine Types Configuration
MINE_TYPES = {
    "Iron Ore": {"elevation_range": (200, 600), "risk_factor": 0.7, "color": "#8B4513"},
    "Coal": {"elevation_range": (100, 400), "risk_factor": 0.6, "color": "#2F4F4F"},
    "Limestone": {"elevation_range": (50, 300), "risk_factor": 0.5, "color": "#D3D3D3"},
    "Granite": {"elevation_range": (300, 800), "risk_factor": 0.8, "color": "#FF69B4"},
    "Bauxite": {"elevation_range": (150, 500), "risk_factor": 0.6, "color": "#CD853F"},
    "Copper": {"elevation_range": (200, 700), "risk_factor": 0.9, "color": "#B87333"},
    "Manganese": {"elevation_range": (100, 400), "risk_factor": 0.7, "color": "#4B0082"},
    "Mica": {"elevation_range": (200, 600), "risk_factor": 0.5, "color": "#F0E68C"}
}

# Global variable for background task
daily_task = None
OPENWEATHER_API_KEY = "81c0c1ee714a03fff54ccd1c39dc0b8c"

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting Perfect AI-Powered Rockfall Risk Prediction System v5.0 (MongoDB)...")
    
    # Connect to MongoDB
    mongo = MongoDB()
    mongo.connect()
    
    # Load ML Models
    global ml_models, scaler, feature_columns
    try:
        models_dir = Path(__file__).parent.parent / "models"
        model_files = {
            'rockfall_model': models_dir / "rockfall_model.pkl",
            'random_forest': models_dir / "random_forest_multiclass.pkl",
            'lightgbm': models_dir / "lightgbm_multiclass.pkl"
        }
        for model_name, model_path in model_files.items():
            if model_path.exists():
                ml_models[model_name] = joblib.load(model_path)
                print(f"✅ Loaded {model_name}")
        
        scaler_path = models_dir / "scaler.pkl"
        if scaler_path.exists():
            scaler = joblib.load(scaler_path)
            
        features_path = models_dir / "feature_columns.json"
        if features_path.exists():
            with open(features_path, 'r') as f:
                feature_columns = json.load(f)
            
    except Exception as e:
        print(f"⚠️ Error loading ML models: {e}")

    # Start background task
    global daily_task
    daily_task = asyncio.create_task(daily_monitoring_loop())
    yield
    # Shutdown
    if daily_task:
        daily_task.cancel()
    mongo.close()
    print("🛑 System shutdown complete")

app = FastAPI(
    title="Perfect AI-Powered Rockfall Risk Prediction System (MongoDB)",
    description="MongoDB-backed system with PERFECT mine placement",
    version="5.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Background Tasks ---

async def daily_monitoring_loop():
    """Background task for daily monitoring"""
    while True:
        try:
            await asyncio.sleep(1440)  # Run every 24 minutes
            await daily_monitoring_task()
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"❌ Daily monitoring error: {e}")
            await asyncio.sleep(1800)

async def daily_monitoring_task():
    """Perform daily monitoring updates with State-Wide Optimization (Strict 60 calls/day limit)"""
    db = MongoDB.db
    if not db: return

    print(f"🔄 Starting optimized state-wide weather update...")
    
    # 1. Fetch weather ONCE for the entire state (Central Location: Trichy)
    # This ensures we only use 1 API call per update cycle (60 calls/day max)
    TRICHY_LAT = 10.7905
    TRICHY_LON = 78.7047
    
    weather_data = await get_real_weather(TRICHY_LAT, TRICHY_LON)
    
    updated_count = 0
    
    if weather_data:
        # 2. Apply this weather to ALL mines
        await db.mines.update_many(
            {},
            {"$set": {"weather": weather_data, "last_updated": datetime.now()}}
        )
        
        # 3. Recalculate Risk for each mine (Risk depends on Slope + Weather)
        # We can do this in batches or iterate all
        async for mine in db.mines.find({}):
            await update_risk_assessment(mine, db)
            await check_and_create_alerts(mine, db)
            updated_count += 1
            
    print(f"✅ Daily monitoring completed: {updated_count} mines updated using State-Wide weather")

async def get_real_weather(lat: float, lon: float) -> Optional[Dict]:
    try:
        async with httpx.AsyncClient() as client:
            url = "https://api.openweathermap.org/data/2.5/weather"
            params = {
                "lat": lat,
                "lon": lon,
                "appid": OPENWEATHER_API_KEY,
                "units": "metric"
            }
            response = await client.get(url, params=params, timeout=10.0)
            response.raise_for_status()
            data = response.json()
            
            # Extract data
            main = data.get("main", {})
            wind = data.get("wind", {})
            weather_list = data.get("weather", [{}])
            weather_desc = weather_list[0].get("main", "Clear")
            rain_data = data.get("rain", {})
            rain_1h = rain_data.get("1h", 0)
            
            print(f"✅ Weather for {lat},{lon}: {main.get('temp')}°C, {weather_desc}")
            
            return {
                "temperature": main.get("temp", 0),
                "humidity": main.get("humidity", 0),
                "wind_speed": wind.get("speed", 0) * 3.6, # Convert m/s to km/h
                "recent_rainfall": rain_1h,
                "pressure": main.get("pressure", 0),
                "description": weather_desc
            }
    except Exception as e:
        print(f"⚠️ Weather API Error for {lat},{lon}: {e}")
        return None

async def update_mine_weather(mine: dict, db: AsyncIOMotorDatabase):
    """Update weather data for a mine using Real-Time Open-Meteo API"""
    lat = mine.get("latitude")
    lon = mine.get("longitude")
    
    # Fallback to simulation if no location
    if not lat or not lon:
        weather = mine.get("weather", {})
        # Simple random weather simulation
        temp_change = random.uniform(-1, 1)
        weather["temperature"] = max(20, min(45, weather.get("temperature", 30) + temp_change))
        weather["humidity"] = max(30, min(100, weather.get("humidity", 60) + random.uniform(-3, 3)))
        weather["wind_speed"] = max(0, min(50, weather.get("wind_speed", 10) + random.uniform(-2, 2)))
        
        # Rain logic
        if random.random() < 0.2: # 20% chance of rain change
            weather["recent_rainfall"] = max(0, weather.get("recent_rainfall", 0) + random.uniform(0, 20))
            weather["description"] = "Rain"
        else:
            weather["recent_rainfall"] = max(0, weather.get("recent_rainfall", 0) * 0.9) # Dry out
            weather["description"] = "Clear" if weather["recent_rainfall"] < 5 else "Cloudy"

        await db.mines.update_one(
            {"_id": mine["_id"]},
            {"$set": {"weather": weather}}
        )
        return

    real_weather = await get_real_weather(lat, lon)
    
    if real_weather:
        weather = real_weather
        # Enhance description
        if weather["recent_rainfall"] > 20:
            weather["description"] = "Heavy Rain"
        elif weather["recent_rainfall"] > 0:
            weather["description"] = "Light Rain"
        elif weather["wind_speed"] > 20:
            weather["description"] = "Windy"
        else:
            weather["description"] = "Clear"
            
        await db.mines.update_one(
            {"_id": mine["_id"]},
            {"$set": {"weather": weather}}
        )
    else:
        # API Failed - Keep existing weather data, DO NOT SIMULATE
        print(f"⚠️ Keeping existing weather for mine {mine.get('id')} due to API failure")
        return

async def update_risk_assessment(mine: dict, db: AsyncIOMotorDatabase):
    """Update risk assessment based on current conditions"""
    weather = mine.get("weather", {})
    risk_factors = []
    
    rainfall = weather.get("recent_rainfall", 0)
    if rainfall > 120: risk_factors.append(0.3)
    elif rainfall > 60: risk_factors.append(0.2)
    
    slope = mine.get("slope_angle", 0)
    if slope > 40: risk_factors.append(0.2)
    
    base_risk = MINE_TYPES.get(mine.get("type"), {"risk_factor": 0.5})["risk_factor"]
    
    new_risk_score = min(0.95, max(0.05, base_risk + sum(risk_factors)))
    new_risk_level = "Low" if new_risk_score < 0.4 else "Medium" if new_risk_score < 0.7 else "High"
    
    await db.mines.update_one(
        {"_id": mine["_id"]},
        {"$set": {
            "risk_score": new_risk_score,
            "risk_level": new_risk_level
        }}
    )

async def check_and_create_alerts(mine: dict, db: AsyncIOMotorDatabase):
    """Check conditions and create alerts"""
    risk_score = mine.get("risk_score", 0)
    alerts = []
    
    if risk_score > 0.85:
        alerts.append({
            "type": "Critical Risk Alert",
            "severity": "Critical",
            "message": f"CRITICAL: Mine {mine.get('name')} at critical risk: {risk_score:.2f}"
        })
    
    for alert in alerts:
        alert_doc = {
            "mine_id": mine.get("id"),
            "alert_type": alert["type"],
            "severity": alert["severity"],
            "message": alert["message"],
            "timestamp": datetime.now(),
            "is_active": True
        }
        await db.alerts.insert_one(alert_doc)

# --- API Routes ---

@app.get("/health")
async def health_check():
    return {"status": "healthy", "database": "MongoDB", "timestamp": datetime.now().isoformat()}

@app.get("/api/mines", response_model=List[MineResponse])
async def get_mines(
    district: Optional[str] = None,
    risk_level: Optional[str] = None,
    mine_type: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: Optional[int] = None,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get mines with filtering"""
    query = {}
    
    if district: query["district"] = {"$regex": district, "$options": "i"}
    if risk_level: query["risk_level"] = risk_level
    if mine_type: query["type"] = {"$regex": mine_type, "$options": "i"}
    if status: query["status"] = {"$regex": status, "$options": "i"}
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"district": {"$regex": search, "$options": "i"}}
        ]
    
    cursor = db.mines.find(query).sort("risk_score", -1)
    if limit:
        cursor = cursor.limit(limit)
        
    mines = await cursor.to_list(length=limit or 1000)
    return [MineResponse(**mine) for mine in mines]

@app.get("/api/mines/{mine_id}", response_model=MineResponse)
async def get_mine_details(mine_id: int, db: AsyncIOMotorDatabase = Depends(get_database)):
    mine = await db.mines.find_one({"id": mine_id})
    if not mine:
        raise HTTPException(status_code=404, detail="Mine not found")
    
    # Force live weather update for accuracy
    await update_mine_weather(mine, db)
    # Re-fetch updated mine
    mine = await db.mines.find_one({"id": mine_id})
    
    return MineResponse(**mine)

@app.get("/api/weather/{mine_id}", response_model=WeatherData)
async def get_mine_weather(mine_id: int, db: AsyncIOMotorDatabase = Depends(get_database)):
    mine = await db.mines.find_one({"id": mine_id})
    if not mine:
        raise HTTPException(status_code=404, detail="Mine not found")
    
    # Force live weather update for accuracy
    await update_mine_weather(mine, db)
    # Re-fetch updated mine
    mine = await db.mines.find_one({"id": mine_id})
    
    w = mine.get("weather", {})
    return WeatherData(
        temperature=w.get("temperature", 0),
        humidity=w.get("humidity", 0),
        wind_speed=w.get("wind_speed", 0),
        pressure=w.get("pressure", 0),
        rainfall=w.get("recent_rainfall", 0),
        description=w.get("description", "Unknown"),
        timestamp=mine.get("last_updated", datetime.now()).isoformat()
    )

@app.get("/api/districts")
async def get_districts(db: AsyncIOMotorDatabase = Depends(get_database)):
    pipeline = [
        {"$group": {
            "_id": "$district",
            "mine_count": {"$sum": 1},
            "high_risk": {"$sum": {"$cond": [{"$eq": ["$risk_level", "High"]}, 1, 0]}},
            "medium_risk": {"$sum": {"$cond": [{"$eq": ["$risk_level", "Medium"]}, 1, 0]}},
            "low_risk": {"$sum": {"$cond": [{"$eq": ["$risk_level", "Low"]}, 1, 0]}}
        }},
        {"$sort": {"mine_count": -1}}
    ]
    
    results = await db.mines.aggregate(pipeline).to_list(length=100)
    
    districts = []
    for r in results:
        districts.append({
            "name": r["_id"],
            "mine_count": r["mine_count"],
            "risk_distribution": {
                "high": r["high_risk"],
                "medium": r["medium_risk"],
                "low": r["low_risk"]
            }
        })
    return districts

@app.get("/api/analytics")
async def get_system_analytics(db: AsyncIOMotorDatabase = Depends(get_database)):
    total_mines = await db.mines.count_documents({})
    high_risk = await db.mines.count_documents({"risk_level": "High"})
    medium_risk = await db.mines.count_documents({"risk_level": "Medium"})
    low_risk = await db.mines.count_documents({"risk_level": "Low"})
    
    return {
        "total_mines": total_mines,
        "risk_distribution": {
            "high": high_risk,
            "medium": medium_risk,
            "low": low_risk
        },
        "last_updated": datetime.now().isoformat()
    }

@app.get("/api/alerts", response_model=List[AlertResponse])
async def get_alerts(
    mine_id: Optional[int] = None,
    severity: Optional[str] = None,
    active_only: bool = True,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    query = {}
    if mine_id: query["mine_id"] = mine_id
    if severity: query["severity"] = severity
    if active_only: query["is_active"] = True
    
    cursor = db.alerts.find(query).sort("timestamp", -1).limit(100)
    alerts = await cursor.to_list(length=100)
    
    return [
        AlertResponse(
            mine_id=a["mine_id"],
            alert_type=a["alert_type"],
            severity=a["severity"],
            message=a["message"],
            timestamp=a["timestamp"].isoformat(),
            is_active=a["is_active"]
        ) for a in alerts
    ]

@app.post("/api/manual-monitoring")
async def trigger_manual_monitoring():
    await daily_monitoring_task()
    return {"status": "success", "message": "Manual monitoring triggered"}

@app.get("/api/mine-colors")
async def get_mine_colors():
    return {
        "risk_colors": {"High": "#FF0000", "Medium": "#FFA500", "Low": "#00FF00"},
        "type_colors": MINE_TYPES
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
