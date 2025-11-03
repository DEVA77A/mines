from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import uvicorn
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import json
import random
import math
import requests
import asyncio
import threading
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import joblib
import os

# Import database models and functions
from database import get_db, create_tables, Mine, SensorReading, Alert, RiskPrediction, SystemAnalytics
from ai_rockfall_system import RockfallPredictor, generate_comprehensive_mine_data

app = FastAPI(
    title="AI-Powered Rockfall Risk Prediction System",
    description="Advanced rockfall prediction using ML models and multi-source data integration with database storage",
    version="3.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize ML predictor
predictor = RockfallPredictor()

# Weather API Configuration
WEATHER_API_KEY = os.getenv("WEATHER_API_KEY", "demo_key")  # Replace with actual API key
WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather"

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    create_tables()
    # Initialize with sample data if database is empty
    db = next(get_db())
    if db.query(Mine).count() == 0:
        initialize_sample_data(db)
    db.close()

def initialize_sample_data(db: Session):
    """Initialize database with sample mine data"""
    print("🏗️ Initializing database with sample mine data...")
    
    # Generate comprehensive mine data
    mines_data = generate_comprehensive_mine_data()
    
    for mine_data in mines_data:
        # Create Mine record
        mine = Mine(
            mine_id=mine_data["mine_id"],
            mine_name=mine_data["mine_name"],
            district=mine_data["district"],
            mine_type=mine_data["mine_type"],
            latitude=mine_data["latitude"],
            longitude=mine_data["longitude"],
            elevation=mine_data["elevation"],
            status=mine_data["status"],
            monitoring_status=mine_data["monitoring_status"],
            geological_data=mine_data["geological_data"],
            environmental_factors=mine_data["environmental_factors"],
            sensor_data=mine_data["sensor_data"],
            dem_data=mine_data["dem_data"],
            drone_imagery=mine_data["drone_imagery"],
            operational_data=mine_data["operational_data"],
            risk_assessment=mine_data["risk_assessment"]
        )
        db.add(mine)
        
        # Create initial sensor reading
        sensor_reading = SensorReading(
            mine_id=mine_data["mine_id"],
            displacement_mm=mine_data["sensor_data"]["displacement_mm"],
            strain_rate=mine_data["sensor_data"]["strain_rate"],
            pore_pressure=mine_data["sensor_data"]["pore_pressure"],
            temperature_c=mine_data["environmental_factors"]["temperature_c"],
            humidity=mine_data["environmental_factors"]["humidity"],
            vibration_frequency=mine_data["sensor_data"]["vibration_frequency"],
            crack_width_mm=mine_data["sensor_data"]["crack_monitoring"]["crack_width_mm"],
            x_tilt=mine_data["sensor_data"]["tilt_sensors"]["x_tilt"],
            y_tilt=mine_data["sensor_data"]["tilt_sensors"]["y_tilt"]
        )
        db.add(sensor_reading)
    
    db.commit()
    print(f"✅ Initialized {len(mines_data)} mines in database")

async def fetch_weather_data(latitude: float, longitude: float) -> Dict[str, Any]:
    """Fetch current weather data for given coordinates"""
    try:
        params = {
            "lat": latitude,
            "lon": longitude,
            "appid": WEATHER_API_KEY,
            "units": "metric"
        }
        
        # For demo purposes, return mock weather data
        # In production, uncomment the line below and use actual API
        # response = requests.get(WEATHER_API_URL, params=params, timeout=10)
        
        # Mock weather data for demo
        return {
            "temperature": round(25 + np.random.normal(0, 5), 2),
            "humidity": round(60 + np.random.normal(0, 15), 2),
            "pressure": round(1013 + np.random.normal(0, 10), 2),
            "wind_speed": round(10 + np.random.normal(0, 5), 2),
            "rainfall": round(max(0, np.random.exponential(2)), 2),
            "weather_condition": np.random.choice(["Clear", "Cloudy", "Rainy", "Stormy"]),
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"Weather API error: {e}")
        # Return default weather data
        return {
            "temperature": 25.0,
            "humidity": 60.0,
            "pressure": 1013.0,
            "wind_speed": 10.0,
            "rainfall": 0.0,
            "weather_condition": "Unknown",
            "timestamp": datetime.now().isoformat()
        }

# API Endpoints
@app.get("/")
def read_root():
    return {
        "message": "AI-Powered Rockfall Risk Prediction System v3.0",
        "version": "3.0.0",
        "database": "SQLite with SQLAlchemy",
        "ml_model": "Random Forest Regressor",
        "features": [
            "Database-backed mine storage",
            "Daily weather updates",
            "Real-time sensor monitoring",
            "ML-based risk prediction",
            "Alert management system",
            "Comprehensive analytics"
        ]
    }

@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint"""
    mine_count = db.query(Mine).count()
    sensor_count = db.query(SensorReading).count()
    alert_count = db.query(Alert).filter(Alert.status == "Active").count()
    
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "database": "connected",
        "mines_count": mine_count,
        "sensor_readings_count": sensor_count,
        "active_alerts_count": alert_count,
        "ml_model": "operational"
    }

@app.get("/api/mines")
def get_mines(
    district: Optional[str] = None,
    risk_level: Optional[str] = None,
    status: Optional[str] = None,
    limit: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Get all mines with optional filtering"""
    query = db.query(Mine)
    
    if district:
        query = query.filter(Mine.district.ilike(f"%{district}%"))
    if status:
        query = query.filter(Mine.status.ilike(f"%{status}%"))
    
    mines = query.all()
    
    # Convert to dict format and apply risk_level filter
    result = []
    for mine in mines:
        mine_dict = {
            "mine_id": mine.mine_id,
            "mine_name": mine.mine_name,
            "district": mine.district,
            "mine_type": mine.mine_type,
            "latitude": mine.latitude,
            "longitude": mine.longitude,
            "elevation": mine.elevation,
            "status": mine.status,
            "monitoring_status": mine.monitoring_status,
            "geological_data": mine.geological_data,
            "environmental_factors": mine.environmental_factors,
            "sensor_data": mine.sensor_data,
            "dem_data": mine.dem_data,
            "drone_imagery": mine.drone_imagery,
            "operational_data": mine.operational_data,
            "risk_assessment": mine.risk_assessment,
            "last_update": mine.updated_at.isoformat()
        }
        
        # Apply risk level filter
        if risk_level:
            if mine.risk_assessment and mine.risk_assessment.get('risk_level', '').lower() == risk_level.lower():
                result.append(mine_dict)
        else:
            result.append(mine_dict)
    
    if limit:
        result = result[:limit]
    
    return result

@app.get("/api/mines/{mine_id}")
def get_mine_details(mine_id: str, db: Session = Depends(get_db)):
    """Get comprehensive mine information"""
    mine = db.query(Mine).filter(Mine.mine_id == mine_id).first()
    if not mine:
        raise HTTPException(status_code=404, detail="Mine not found")
    
    # Get latest sensor readings
    latest_sensors = db.query(SensorReading).filter(
        SensorReading.mine_id == mine_id
    ).order_by(SensorReading.timestamp.desc()).limit(10).all()
    
    # Get recent alerts
    recent_alerts = db.query(Alert).filter(
        Alert.mine_id == mine_id,
        Alert.status == "Active"
    ).order_by(Alert.created_at.desc()).limit(5).all()
    
    return {
        "mine_id": mine.mine_id,
        "mine_name": mine.mine_name,
        "district": mine.district,
        "mine_type": mine.mine_type,
        "latitude": mine.latitude,
        "longitude": mine.longitude,
        "elevation": mine.elevation,
        "status": mine.status,
        "monitoring_status": mine.monitoring_status,
        "geological_data": mine.geological_data,
        "environmental_factors": mine.environmental_factors,
        "sensor_data": mine.sensor_data,
        "dem_data": mine.dem_data,
        "drone_imagery": mine.drone_imagery,
        "operational_data": mine.operational_data,
        "risk_assessment": mine.risk_assessment,
        "last_update": mine.updated_at.isoformat(),
        "recent_sensor_readings": [
            {
                "timestamp": reading.timestamp.isoformat(),
                "displacement_mm": reading.displacement_mm,
                "strain_rate": reading.strain_rate,
                "pore_pressure": reading.pore_pressure,
                "temperature_c": reading.temperature_c,
                "humidity": reading.humidity,
                "vibration_frequency": reading.vibration_frequency
            }
            for reading in latest_sensors
        ],
        "active_alerts": [
            {
                "id": alert.alert_id,
                "type": alert.alert_type,
                "message": alert.message,
                "priority": alert.priority,
                "timestamp": alert.created_at.isoformat()
            }
            for alert in recent_alerts
        ]
    }

@app.get("/api/weather/{mine_id}")
async def get_mine_weather(mine_id: str, db: Session = Depends(get_db)):
    """Get current weather data for a specific mine"""
    mine = db.query(Mine).filter(Mine.mine_id == mine_id).first()
    if not mine:
        raise HTTPException(status_code=404, detail="Mine not found")
    
    weather_data = await fetch_weather_data(mine.latitude, mine.longitude)
    
    return {
        "mine_id": mine_id,
        "mine_name": mine.mine_name,
        "coordinates": {
            "latitude": mine.latitude,
            "longitude": mine.longitude
        },
        "weather": weather_data
    }

@app.post("/api/mines/{mine_id}/sensor-reading")
def add_sensor_reading(
    mine_id: str,
    reading_data: dict,
    db: Session = Depends(get_db)
):
    """Add a new sensor reading for a mine"""
    mine = db.query(Mine).filter(Mine.mine_id == mine_id).first()
    if not mine:
        raise HTTPException(status_code=404, detail="Mine not found")
    
    sensor_reading = SensorReading(
        mine_id=mine_id,
        displacement_mm=reading_data.get("displacement_mm"),
        strain_rate=reading_data.get("strain_rate"),
        pore_pressure=reading_data.get("pore_pressure"),
        temperature_c=reading_data.get("temperature_c"),
        humidity=reading_data.get("humidity"),
        vibration_frequency=reading_data.get("vibration_frequency"),
        crack_width_mm=reading_data.get("crack_width_mm"),
        x_tilt=reading_data.get("x_tilt"),
        y_tilt=reading_data.get("y_tilt")
    )
    
    db.add(sensor_reading)
    db.commit()
    db.refresh(sensor_reading)
    
    return {"message": "Sensor reading added successfully", "id": sensor_reading.id}

@app.get("/api/alerts")
def get_alerts(
    mine_id: Optional[str] = None,
    priority: Optional[str] = None,
    status: Optional[str] = "Active",
    db: Session = Depends(get_db)
):
    """Get alerts with optional filtering"""
    query = db.query(Alert)
    
    if mine_id:
        query = query.filter(Alert.mine_id == mine_id)
    if priority:
        query = query.filter(Alert.priority.ilike(f"%{priority}%"))
    if status:
        query = query.filter(Alert.status == status)
    
    alerts = query.order_by(Alert.created_at.desc()).limit(50).all()
    
    return {
        "alerts": [
            {
                "id": alert.alert_id,
                "mine_id": alert.mine_id,
                "type": alert.alert_type,
                "message": alert.message,
                "priority": alert.priority,
                "status": alert.status,
                "acknowledged": alert.acknowledged,
                "timestamp": alert.created_at.isoformat()
            }
            for alert in alerts
        ],
        "summary": {
            "total_active": len([a for a in alerts if a.status == "Active"]),
            "high_priority": len([a for a in alerts if a.priority == "High"]),
            "medium_priority": len([a for a in alerts if a.priority == "Medium"]),
            "last_updated": datetime.now().isoformat()
        }
    }

@app.get("/api/stats")
def get_system_stats(db: Session = Depends(get_db)):
    """Get comprehensive system statistics"""
    mines = db.query(Mine).all()
    
    # Risk distribution
    risk_dist = {"low": 0, "medium": 0, "high": 0}
    district_dist = {}
    status_dist = {}
    
    for mine in mines:
        # Risk distribution
        if mine.risk_assessment:
            risk_level = mine.risk_assessment.get('risk_level', 'Unknown').lower()
            if risk_level in risk_dist:
                risk_dist[risk_level] += 1
        
        # District distribution
        district = mine.district
        district_dist[district] = district_dist.get(district, 0) + 1
        
        # Status distribution
        status = mine.status
        status_dist[status] = status_dist.get(status, 0) + 1
    
    # Calculate average risk score
    risk_scores = []
    for mine in mines:
        if mine.risk_assessment and 'risk_score' in mine.risk_assessment:
            risk_scores.append(mine.risk_assessment['risk_score'])
    
    avg_risk_score = round(np.mean(risk_scores), 2) if risk_scores else 0
    
    return {
        "total_mines": len(mines),
        "active_mines": len([m for m in mines if m.status == 'Active']),
        "high_risk_mines": risk_dist['high'],
        "risk_distribution": risk_dist,
        "district_distribution": district_dist,
        "status_distribution": status_dist,
        "average_risk_score": avg_risk_score,
        "total_area_monitored": round(sum([
            m.operational_data.get('area_hectares', 0) for m in mines 
            if m.operational_data
        ]), 2),
        "active_sensors": len([m for m in mines if m.monitoring_status == 'Online']),
        "last_updated": datetime.now().isoformat(),
        "system_health": "Operational",
        "ai_model_status": "Active"
    }

# Background task for daily monitoring
async def daily_monitoring_task():
    """Background task for daily mine monitoring and risk updates"""
    while True:
        try:
            print(f"🔄 Starting daily monitoring task at {datetime.now()}")
            
            db = next(get_db())
            mines = db.query(Mine).all()
            
            for mine in mines:
                try:
                    # Fetch current weather
                    weather_data = await fetch_weather_data(mine.latitude, mine.longitude)
                    
                    # Update environmental factors with current weather
                    if mine.environmental_factors:
                        mine.environmental_factors.update({
                            "current_temperature": weather_data["temperature"],
                            "current_humidity": weather_data["humidity"],
                            "current_rainfall": weather_data["rainfall"],
                            "current_wind_speed": weather_data["wind_speed"],
                            "weather_condition": weather_data["weather_condition"],
                            "last_weather_update": weather_data["timestamp"]
                        })
                    
                    # Generate new sensor reading with some variation
                    if mine.sensor_data:
                        new_reading = SensorReading(
                            mine_id=mine.mine_id,
                            displacement_mm=mine.sensor_data["displacement_mm"] + np.random.normal(0, 0.5),
                            strain_rate=mine.sensor_data["strain_rate"] + np.random.normal(0, 0.0001),
                            pore_pressure=mine.sensor_data["pore_pressure"] + np.random.normal(0, 2),
                            temperature_c=weather_data["temperature"],
                            humidity=weather_data["humidity"],
                            vibration_frequency=mine.sensor_data["vibration_frequency"] + np.random.normal(0, 0.1)
                        )
                        db.add(new_reading)
                    
                    # Recalculate risk assessment
                    if mine.geological_data and mine.environmental_factors and mine.sensor_data:
                        features = {
                            'slope_angle': mine.geological_data.get('slope_angle', 45),
                            'rock_strength': mine.geological_data.get('rock_strength', 100),
                            'joint_density': mine.geological_data.get('joint_density', 1.0),
                            'rainfall_mm': weather_data["rainfall"],
                            'temperature_c': weather_data["temperature"],
                            'humidity': weather_data["humidity"],
                            'wind_speed': weather_data["wind_speed"],
                            'seismic_activity': mine.environmental_factors.get('seismic_activity', 2.0),
                            'pore_pressure': mine.sensor_data.get('pore_pressure', 50),
                            'displacement_mm': mine.sensor_data.get('displacement_mm', 10),
                            'strain_rate': mine.sensor_data.get('strain_rate', 0.001),
                            'elevation': mine.elevation or 500,
                            'vegetation_cover': mine.environmental_factors.get('vegetation_cover', 50),
                            'erosion_rate': mine.environmental_factors.get('erosion_rate', 2.0)
                        }
                        
                        # Get ML prediction
                        prediction = predictor.predict_risk(features)
                        mine.risk_assessment = prediction
                        
                        # Generate alert for high risk
                        if prediction['risk_level'] == 'High' and prediction['risk_score'] > 75:
                            alert = Alert(
                                alert_id=f"alert_{mine.mine_id}_{int(datetime.now().timestamp())}",
                                mine_id=mine.mine_id,
                                alert_type="High Risk Detection",
                                message=f"Critical risk level detected at {mine.mine_name} (Score: {prediction['risk_score']:.2f})",
                                priority="High"
                            )
                            db.add(alert)
                    
                    mine.updated_at = datetime.now()
                    
                except Exception as e:
                    print(f"Error updating mine {mine.mine_id}: {e}")
                    continue
            
            db.commit()
            db.close()
            
            print(f"✅ Daily monitoring completed for {len(mines)} mines")
            
            # Wait 24 hours for next update (3600 seconds for testing, use 86400 for production)
            await asyncio.sleep(3600)  # 1 hour for testing
            
        except Exception as e:
            print(f"Daily monitoring error: {e}")
            await asyncio.sleep(1800)  # Retry in 30 minutes on error

# Start background monitoring
@app.on_event("startup")
async def start_background_tasks():
    asyncio.create_task(daily_monitoring_task())

if __name__ == "__main__":
    print("🚀 Starting AI-Powered Rockfall Risk Prediction System v3.0...")
    print("💾 Database: SQLite with SQLAlchemy")
    print("📊 ML Model: Random Forest Regressor")
    print("🌤️ Weather Integration: Enabled")
    print("🔄 Daily Monitoring: Background Task Active")
    print("🌐 API running on http://localhost:8000")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)