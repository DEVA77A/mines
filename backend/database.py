from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, Text, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import os

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./rockfall_system.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Database Models
class Mine(Base):
    __tablename__ = "mines"

    id = Column(Integer, primary_key=True, index=True)
    mine_id = Column(String, unique=True, index=True)
    mine_name = Column(String)
    district = Column(String)
    mine_type = Column(String)
    latitude = Column(Float)
    longitude = Column(Float)
    elevation = Column(Float)
    status = Column(String, default="Active")
    monitoring_status = Column(String, default="Online")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Geological Data (stored as JSON)
    geological_data = Column(JSON)

    # Environmental Factors (stored as JSON)
    environmental_factors = Column(JSON)

    # Sensor Data (stored as JSON)
    sensor_data = Column(JSON)

    # DEM Data (stored as JSON)
    dem_data = Column(JSON)

    # Drone Imagery Data (stored as JSON)
    drone_imagery = Column(JSON)

    # Operational Data (stored as JSON)
    operational_data = Column(JSON)

    # Risk Assessment (stored as JSON)
    risk_assessment = Column(JSON)

class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, index=True)
    mine_id = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    # Sensor measurements
    displacement_mm = Column(Float)
    strain_rate = Column(Float)
    pore_pressure = Column(Float)
    temperature_c = Column(Float)
    humidity = Column(Float)
    vibration_frequency = Column(Float)
    crack_width_mm = Column(Float)
    x_tilt = Column(Float)
    y_tilt = Column(Float)

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String, unique=True, index=True)
    mine_id = Column(String, index=True)
    alert_type = Column(String)
    message = Column(Text)
    priority = Column(String, default="Medium")
    status = Column(String, default="Active")
    acknowledged = Column(Boolean, default=False)
    acknowledged_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True)
    mine_id = Column(String, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    risk_score = Column(Float)
    risk_level = Column(String)
    confidence = Column(Float)
    model_version = Column(String, default="1.0")

    # Feature importance (stored as JSON)
    feature_importance = Column(JSON)

    # Recommendations (stored as JSON)
    recommendations = Column(JSON)

class SystemAnalytics(Base):
    __tablename__ = "system_analytics"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime, index=True)
    average_risk_score = Column(Float)
    high_risk_mines = Column(Integer)
    alerts_generated = Column(Integer)
    inspections_completed = Column(Integer)
    sensor_readings = Column(Integer)
    false_positives = Column(Integer)

# Create database tables
def create_tables():
    Base.metadata.create_all(bind=engine)

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize database
if __name__ == "__main__":
    create_tables()
    print("✅ Database tables created successfully!")