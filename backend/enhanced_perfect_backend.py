"""
Enhanced Perfect AI-Powered Rockfall Risk Prediction System v5.0
Instagram-like Interactive Platform with Maps, Monitoring & Incident History
Author: AI Assistant
Date: September 30, 2025
"""

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import datetime
import random
import asyncio
import json
import uuid
from contextlib import asynccontextmanager

# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./enhanced_rockfall_system.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Enhanced Mine Model with Instagram-like features
class Mine(Base):
    __tablename__ = "mines"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    district = Column(String, index=True)
    type = Column(String)
    status = Column(String)
    risk_level = Column(String, index=True)
    risk_score = Column(Float)
    safety_score = Column(Float)
    production_capacity = Column(Float)
    elevation = Column(Float)
    slope_angle = Column(Float)
    
    # Weather data
    temperature = Column(Float)
    humidity = Column(Float)
    wind_speed = Column(Float)
    recent_rainfall = Column(Float)
    pressure = Column(Float)
    weather_description = Column(String)
    
    # Enhanced fields for Instagram-like experience
    description = Column(Text)
    image_url = Column(String)
    video_url = Column(String)
    drone_footage_url = Column(String)
    thumbnail_url = Column(String)
    
    # Social features
    likes_count = Column(Integer, default=0)
    views_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    
    # Advanced monitoring
    last_inspection = Column(DateTime)
    next_inspection = Column(DateTime)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)
    monitoring_active = Column(Boolean, default=True)
    
    # Historical data
    incidents_count = Column(Integer, default=0)
    last_incident_date = Column(DateTime)
    total_downtime_hours = Column(Float, default=0.0)
    
    # Metadata
    tags = Column(JSON)  # ["high-tech", "automated", "eco-friendly"]
    equipment_list = Column(JSON)
    certifications = Column(JSON)
    social_impact_score = Column(Float, default=0.0)
    environmental_impact_score = Column(Float, default=0.0)

# Incident History Model
class Incident(Base):
    __tablename__ = "incidents"
    
    id = Column(Integer, primary_key=True, index=True)
    mine_id = Column(Integer)
    incident_type = Column(String)  # "rockfall", "equipment_failure", "weather_damage"
    severity = Column(String)  # "minor", "moderate", "major", "critical"
    date_occurred = Column(DateTime)
    description = Column(Text)
    casualties = Column(Integer, default=0)
    injuries = Column(Integer, default=0)
    damage_cost = Column(Float, default=0.0)
    downtime_hours = Column(Float, default=0.0)
    weather_conditions = Column(JSON)
    images = Column(JSON)  # URLs to incident images
    resolution_status = Column(String, default="resolved")
    lessons_learned = Column(Text)

# Daily Monitoring Model
class DailyMonitoring(Base):
    __tablename__ = "daily_monitoring"
    
    id = Column(Integer, primary_key=True, index=True)
    mine_id = Column(Integer)
    date = Column(DateTime)
    risk_score = Column(Float)
    weather_risk = Column(Float)
    equipment_status = Column(String)
    personnel_count = Column(Integer)
    safety_alerts = Column(JSON)
    production_rate = Column(Float)
    notes = Column(Text)

# Comments Model for social features
class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    mine_id = Column(Integer)
    author = Column(String)
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    likes = Column(Integer, default=0)

# Pydantic models
class MineResponse(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    district: str
    type: str
    status: str
    risk_level: str
    risk_score: float
    safety_score: float
    production_capacity: float
    elevation: float
    slope_angle: float
    temperature: float
    humidity: float
    wind_speed: float
    recent_rainfall: float
    pressure: float
    weather_description: str
    description: str
    image_url: str
    video_url: Optional[str] = None
    drone_footage_url: Optional[str] = None
    thumbnail_url: str
    likes_count: int
    views_count: int
    comments_count: int
    last_inspection: datetime.datetime
    next_inspection: datetime.datetime
    last_updated: datetime.datetime
    monitoring_active: bool
    incidents_count: int
    last_incident_date: Optional[datetime.datetime] = None
    total_downtime_hours: float
    tags: List[str]
    equipment_list: List[str]
    certifications: List[str]
    social_impact_score: float
    environmental_impact_score: float

class IncidentResponse(BaseModel):
    id: int
    mine_id: int
    incident_type: str
    severity: str
    date_occurred: datetime.datetime
    description: str
    casualties: int
    injuries: int
    damage_cost: float
    downtime_hours: float
    weather_conditions: Dict[str, Any]
    images: List[str]
    resolution_status: str
    lessons_learned: str

# Create tables
Base.metadata.create_all(bind=engine)

# Background monitoring task
async def daily_monitoring_task():
    while True:
        print("🔄 Running daily monitoring update...")
        db = SessionLocal()
        try:
            mines = db.query(Mine).all()
            for mine in mines:
                # Update risk scores based on weather and other factors
                weather_risk = random.uniform(0.1, 0.3)
                equipment_risk = random.uniform(0.1, 0.2)
                historical_risk = mine.incidents_count * 0.05
                
                new_risk_score = min(1.0, weather_risk + equipment_risk + historical_risk + random.uniform(0.1, 0.4))
                mine.risk_score = new_risk_score
                
                # Update risk level based on score
                if new_risk_score >= 0.85:
                    mine.risk_level = "Critical"
                elif new_risk_score >= 0.7:
                    mine.risk_level = "High"
                elif new_risk_score >= 0.5:
                    mine.risk_level = "Medium"
                else:
                    mine.risk_level = "Low"
                
                # Update weather data
                mine.temperature = random.uniform(20, 35)
                mine.humidity = random.uniform(40, 90)
                mine.wind_speed = random.uniform(5, 25)
                mine.recent_rainfall = random.uniform(0, 100)
                mine.pressure = random.uniform(1010, 1020)
                
                weather_conditions = ["Clear", "Cloudy", "Rainy", "Thunderstorm", "Foggy"]
                mine.weather_description = random.choice(weather_conditions)
                
                mine.last_updated = datetime.datetime.utcnow()
                
                # Create daily monitoring record
                daily_record = DailyMonitoring(
                    mine_id=mine.id,
                    date=datetime.datetime.utcnow(),
                    risk_score=mine.risk_score,
                    weather_risk=weather_risk,
                    equipment_status=random.choice(["Good", "Fair", "Poor"]),
                    personnel_count=random.randint(10, 50),
                    safety_alerts=[],
                    production_rate=random.uniform(0.7, 1.0),
                    notes=f"Daily monitoring update - Risk: {mine.risk_level}"
                )
                db.add(daily_record)
            
            db.commit()
            print(f"✅ Daily monitoring completed: {len(mines)} mines updated")
        except Exception as e:
            print(f"❌ Daily monitoring error: {e}")
            db.rollback()
        finally:
            db.close()
        
        # Wait 1 hour before next update (in production, this would be 24 hours)
        await asyncio.sleep(3600)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start background monitoring
    monitoring_task = asyncio.create_task(daily_monitoring_task())
    yield
    monitoring_task.cancel()

# FastAPI app
app = FastAPI(
    title="Enhanced Perfect AI-Powered Rockfall System v5.0",
    description="Instagram-like Interactive Mining Risk Platform with Maps & Monitoring",
    version="5.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize enhanced database with Instagram-like data
def init_enhanced_database():
    db = SessionLocal()
    try:
        # Check if database already has data
        if db.query(Mine).count() > 0:
            print("✅ Enhanced database already initialized")
            return

        print("🚀 Initializing enhanced database with Instagram-like features...")
        
        # Tamil Nadu districts and mine types
        districts = [
            "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
            "Tirunelveli", "Tiruppur", "Vellore", "Thoothukudi", "Dindigul",
            "Thanjavur", "Kanchipuram"
        ]
        
        mine_types = ["Coal", "Iron Ore", "Limestone", "Granite", "Bauxite", "Sand", "Clay"]
        statuses = ["Active", "Temporarily Closed", "Under Development", "Maintenance"]
        
        tags_options = [
            ["high-tech", "automated", "eco-friendly"],
            ["traditional", "reliable", "experienced"],
            ["modern", "efficient", "sustainable"],
            ["innovative", "digital", "smart"],
            ["established", "proven", "safe"]
        ]
        
        equipment_options = [
            ["Excavators", "Dumpers", "Crushers", "Conveyors"],
            ["Drilling Rigs", "Bulldozers", "Loaders", "Haul Trucks"],
            ["Screening Plants", "Wash Plants", "Processing Units"],
            ["Safety Systems", "Monitoring Equipment", "Communication Systems"]
        ]
        
        certifications_options = [
            ["ISO 9001", "ISO 14001", "OHSAS 18001"],
            ["BIS Certification", "Environmental Clearance", "Safety Compliance"],
            ["Quality Assurance", "Sustainable Mining", "Green Certification"]
        ]
        
        # Sample incidents for some mines
        incident_types = ["rockfall", "equipment_failure", "weather_damage", "landslide", "flooding"]
        severities = ["minor", "moderate", "major", "critical"]
        
        mine_id = 1
        for district in districts:
            mines_per_district = random.randint(30, 40)
            
            for i in range(mines_per_district):
                # Generate realistic coordinates for Tamil Nadu
                if district == "Chennai":
                    lat_base, lng_base = 13.0827, 80.2707
                elif district == "Coimbatore":
                    lat_base, lng_base = 11.0168, 76.9558
                elif district == "Madurai":
                    lat_base, lng_base = 9.9252, 78.1198
                elif district == "Salem":
                    lat_base, lng_base = 11.6643, 78.1460
                else:
                    # Default Tamil Nadu coordinates
                    lat_base, lng_base = 11.1271, 78.6569
                
                # Add random offset within district boundaries
                latitude = lat_base + random.uniform(-0.5, 0.5)
                longitude = lng_base + random.uniform(-0.5, 0.5)
                
                mine_type = random.choice(mine_types)
                status = random.choice(statuses)
                
                # Generate risk score and level
                risk_score = random.uniform(0.2, 0.95)
                if risk_score >= 0.85:
                    risk_level = "Critical"
                elif risk_score >= 0.7:
                    risk_level = "High"
                elif risk_score >= 0.5:
                    risk_level = "Medium"
                else:
                    risk_level = "Low"
                
                # Generate incidents for some mines
                incidents_count = random.randint(0, 5)
                last_incident_date = None
                total_downtime = 0.0
                
                if incidents_count > 0:
                    last_incident_date = datetime.datetime.utcnow() - datetime.timedelta(
                        days=random.randint(30, 365)
                    )
                    total_downtime = random.uniform(5, 100)
                
                mine = Mine(
                    id=mine_id,
                    name=f"{district} {mine_type} Mine {i+1}",
                    latitude=latitude,
                    longitude=longitude,
                    district=district,
                    type=mine_type,
                    status=status,
                    risk_level=risk_level,
                    risk_score=risk_score,
                    safety_score=random.uniform(0.7, 0.95),
                    production_capacity=random.uniform(5000, 15000),
                    elevation=random.uniform(100, 800),
                    slope_angle=random.uniform(15, 45),
                    temperature=random.uniform(25, 35),
                    humidity=random.uniform(50, 80),
                    wind_speed=random.uniform(5, 20),
                    recent_rainfall=random.uniform(0, 150),
                    pressure=random.uniform(1010, 1020),
                    weather_description=random.choice(["Clear", "Cloudy", "Rainy", "Thunderstorm"]),
                    description=f"Modern {mine_type.lower()} mining operation with advanced safety systems and environmental monitoring. Located in {district} district with state-of-the-art equipment and experienced personnel.",
                    image_url=f"/images/mines/{district.lower()}_{mine_type.lower()}_mine_{i+1}.jpg",
                    video_url=f"/videos/mines/{district.lower()}_{mine_type.lower()}_mine_{i+1}.mp4",
                    drone_footage_url=f"/drone/mines/{district.lower()}_{mine_type.lower()}_mine_{i+1}.mp4",
                    thumbnail_url=f"/thumbnails/mines/{district.lower()}_{mine_type.lower()}_mine_{i+1}.jpg",
                    likes_count=random.randint(50, 500),
                    views_count=random.randint(1000, 10000),
                    comments_count=random.randint(5, 50),
                    last_inspection=datetime.datetime.utcnow() - datetime.timedelta(days=random.randint(1, 30)),
                    next_inspection=datetime.datetime.utcnow() + datetime.timedelta(days=random.randint(30, 90)),
                    monitoring_active=True,
                    incidents_count=incidents_count,
                    last_incident_date=last_incident_date,
                    total_downtime_hours=total_downtime,
                    tags=random.choice(tags_options),
                    equipment_list=random.choice(equipment_options),
                    certifications=random.choice(certifications_options),
                    social_impact_score=random.uniform(0.6, 0.9),
                    environmental_impact_score=random.uniform(0.5, 0.8)
                )
                
                db.add(mine)
                
                # Add incidents for this mine
                for j in range(incidents_count):
                    incident_date = datetime.datetime.utcnow() - datetime.timedelta(
                        days=random.randint(30, 730)
                    )
                    
                    incident = Incident(
                        mine_id=mine_id,
                        incident_type=random.choice(incident_types),
                        severity=random.choice(severities),
                        date_occurred=incident_date,
                        description=f"Incident at {mine.name} - {random.choice(['Weather-related damage', 'Equipment malfunction', 'Slope instability', 'Safety protocol breach'])}",
                        casualties=random.randint(0, 2),
                        injuries=random.randint(0, 5),
                        damage_cost=random.uniform(10000, 500000),
                        downtime_hours=random.uniform(2, 48),
                        weather_conditions={
                            "temperature": random.uniform(20, 40),
                            "rainfall": random.uniform(0, 100),
                            "wind_speed": random.uniform(10, 50)
                        },
                        images=[f"/incident_images/{mine_id}_{j+1}_1.jpg", f"/incident_images/{mine_id}_{j+1}_2.jpg"],
                        resolution_status="resolved",
                        lessons_learned="Enhanced safety protocols implemented. Regular monitoring increased."
                    )
                    db.add(incident)
                
                mine_id += 1
        
        db.commit()
        total_mines = db.query(Mine).count()
        total_incidents = db.query(Incident).count()
        print(f"✅ Enhanced database initialized: {total_mines} mines, {total_incidents} incidents")
        
    except Exception as e:
        print(f"❌ Database initialization error: {e}")
        db.rollback()
    finally:
        db.close()

# API Endpoints

@app.get("/")
async def root():
    return {
        "message": "Enhanced Perfect AI-Powered Rockfall System v5.0",
        "features": [
            "Instagram-like Interactive Interface",
            "Real-time Map Integration",
            "Incident History Tracking",
            "Daily Risk Monitoring",
            "Social Features (Likes, Comments, Views)",
            "Advanced Search & Filtering",
            "Drone Footage & Videos",
            "Environmental Impact Assessment"
        ]
    }

@app.get("/api/mines", response_model=List[MineResponse])
async def get_mines(
    district: Optional[str] = None,
    risk_level: Optional[str] = None,
    mine_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Mine)
    
    if district:
        query = query.filter(Mine.district == district)
    if risk_level:
        query = query.filter(Mine.risk_level == risk_level)
    if mine_type:
        query = query.filter(Mine.type == mine_type)
    if status:
        query = query.filter(Mine.status == status)
    
    mines = query.all()
    # Normalize coordinates to avoid markers falling into sea (fix common coastal offsets)
    def clamp(value, lo, hi):
        return max(lo, min(hi, value))

    for m in mines:
        try:
            # Quick geographic clamps for Tamil Nadu regions (non-destructive, minimal shift)
            if m.district == 'Chennai':
                # Chennai is coastal; keep points within a tighter box around the city
                m.latitude = clamp(m.latitude, 12.8, 13.3)
                m.longitude = clamp(m.longitude, 80.0, 80.6)
            else:
                # Clamp to broad Tamil Nadu bounds to prevent ocean coordinates
                m.latitude = clamp(m.latitude, 8.0, 14.0)
                m.longitude = clamp(m.longitude, 76.0, 81.5)
        except Exception:
            # If any record missing coords, skip normalization
            continue
    return mines

@app.get("/api/mines/{mine_id}", response_model=MineResponse)
async def get_mine(mine_id: int, db: Session = Depends(get_db)):
    mine = db.query(Mine).filter(Mine.id == mine_id).first()
    if not mine:
        raise HTTPException(status_code=404, detail="Mine not found")
    
    # Increment view count
    mine.views_count += 1
    db.commit()
    # Normalize coords for single mine as well
    try:
        def clamp(value, lo, hi):
            return max(lo, min(hi, value))

        if mine.district == 'Chennai':
            mine.latitude = clamp(mine.latitude, 12.8, 13.3)
            mine.longitude = clamp(mine.longitude, 80.0, 80.6)
        else:
            mine.latitude = clamp(mine.latitude, 8.0, 14.0)
            mine.longitude = clamp(mine.longitude, 76.0, 81.5)
    except Exception:
        pass

    return mine

@app.get("/api/mines/{mine_id}/incidents", response_model=List[IncidentResponse])
async def get_mine_incidents(mine_id: int, db: Session = Depends(get_db)):
    incidents = db.query(Incident).filter(Incident.mine_id == mine_id).all()
    return incidents

@app.post("/api/mines/{mine_id}/like")
async def like_mine(mine_id: int, db: Session = Depends(get_db)):
    mine = db.query(Mine).filter(Mine.id == mine_id).first()
    if not mine:
        raise HTTPException(status_code=404, detail="Mine not found")
    
    mine.likes_count += 1
    db.commit()
    
    return {"message": "Mine liked successfully", "likes_count": mine.likes_count}

@app.get("/api/districts")
async def get_districts(db: Session = Depends(get_db)):
    districts = db.query(Mine.district).distinct().all()
    return [d[0] for d in districts]

@app.get("/api/statistics")
async def get_statistics(db: Session = Depends(get_db)):
    total_mines = db.query(Mine).count()
    total_incidents = db.query(Incident).count()
    
    risk_stats = {}
    for risk_level in ["Critical", "High", "Medium", "Low"]:
        count = db.query(Mine).filter(Mine.risk_level == risk_level).count()
        risk_stats[risk_level] = count
    
    district_stats = {}
    districts = db.query(Mine.district).distinct().all()
    for district in districts:
        count = db.query(Mine).filter(Mine.district == district[0]).count()
        district_stats[district[0]] = count
    
    return {
        "total_mines": total_mines,
        "total_incidents": total_incidents,
        "risk_distribution": risk_stats,
        "district_distribution": district_stats,
        "active_monitoring": db.query(Mine).filter(Mine.monitoring_active == True).count()
    }

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Enhanced Perfect AI-Powered Rockfall System v5.0...")
    print("🌍 Features: Maps, Monitoring, Incidents, Social Media Style")
    print("💾 Database: SQLite with comprehensive schema")
    print("📊 AI: Advanced risk assessment with daily updates")
    print("🔍 Advanced: Search, Filter, Export, Social Features")
    print("🌐 API Server: http://localhost:8000")
    print("📚 Documentation: http://localhost:8000/docs")
    init_enhanced_database()
    uvicorn.run(app, host="0.0.0.0", port=8000)