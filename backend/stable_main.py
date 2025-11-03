from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import uvicorn
from datetime import datetime

app = FastAPI(title="Tamil Nadu Rockfall Risk API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple in-memory data
MINE_DATA = [
    {
        "mine_id": "TN_001",
        "mine_name": "Salem Iron Ore Mine",
        "district": "Salem",
        "mine_type": "Iron Ore",
        "latitude": 11.6643,
        "longitude": 78.1460,
        "elevation": 278.5,
        "slope_angle": 45.2,
        "rock_type": "Granite",
        "weathering_grade": 3,
        "joint_density": 0.4,
        "rainfall_mm": 850.0,
        "temperature_c": 27.5,
        "humidity": 65.0,
        "wind_speed": 8.5,
        "risk_score": 68.5,
        "status": "Active",
        "area_hectares": 125.5
    },
    {
        "mine_id": "TN_002",
        "mine_name": "Dharmapuri Granite Quarry",
        "district": "Dharmapuri",
        "mine_type": "Granite",
        "latitude": 12.1211,
        "longitude": 78.1597,
        "elevation": 350.0,
        "slope_angle": 35.8,
        "rock_type": "Granite",
        "weathering_grade": 2,
        "joint_density": 0.3,
        "rainfall_mm": 720.0,
        "temperature_c": 26.0,
        "humidity": 58.0,
        "wind_speed": 7.2,
        "risk_score": 42.3,
        "status": "Active",
        "area_hectares": 89.2
    },
    {
        "mine_id": "TN_003",
        "mine_name": "Krishnagiri Bauxite Mine",
        "district": "Krishnagiri",
        "mine_type": "Bauxite",
        "latitude": 12.5265,
        "longitude": 78.2140,
        "elevation": 425.0,
        "slope_angle": 52.1,
        "rock_type": "Limestone",
        "weathering_grade": 4,
        "joint_density": 0.6,
        "rainfall_mm": 950.0,
        "temperature_c": 28.2,
        "humidity": 72.0,
        "wind_speed": 9.8,
        "risk_score": 78.9,
        "status": "Under Review",
        "area_hectares": 67.8
    }
]

@app.get("/")
def read_root():
    return {"message": "Tamil Nadu Rockfall Risk Prediction API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/health")
def api_health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/api/mines")
def get_mines():
    """Get all mines data"""
    try:
        return MINE_DATA
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/mines/{mine_id}")
def get_mine_details(mine_id: str):
    """Get detailed information for a specific mine"""
    try:
        mine = next((m for m in MINE_DATA if m['mine_id'] == mine_id), None)
        if not mine:
            raise HTTPException(status_code=404, detail="Mine not found")
        
        # Add additional detailed information
        detailed_mine = mine.copy()
        detailed_mine.update({
            "geological_data": {
                "rock_strength": 125.5,
                "fracture_frequency": 0.8,
                "groundwater_level": 25.0
            },
            "environmental_factors": {
                "seismic_activity": 2.1,
                "erosion_rate": 1.5,
                "vegetation_cover": 45.0
            },
            "monitoring_data": {
                "sensors_installed": 15,
                "last_monitoring": datetime.now().isoformat(),
                "alert_threshold": 70.0
            }
        })
        
        return detailed_mine
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/predict/{mine_id}")
def predict_risk_for_mine(mine_id: str):
    """Predict risk for a specific mine"""
    try:
        mine = next((m for m in MINE_DATA if m['mine_id'] == mine_id), None)
        if not mine:
            raise HTTPException(status_code=404, detail="Mine not found")
        
        risk_score = mine['risk_score']
        risk_level = "Low" if risk_score < 40 else "Medium" if risk_score < 70 else "High"
        
        return {
            "mine_id": mine_id,
            "mine_name": mine['mine_name'],
            "risk_score": risk_score,
            "risk_level": risk_level,
            "confidence": 85.5,
            "prediction_time": datetime.now().isoformat(),
            "factors": {
                "geological": round(mine['slope_angle'] * 0.5, 2),
                "environmental": round(mine['rainfall_mm'] * 0.01, 2),
                "operational": 25.0
            }
        }
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/stats")
def get_statistics():
    """Get comprehensive system statistics"""
    try:
        mines = MINE_DATA
        total_mines = len(mines)
        
        # Calculate risk distribution
        low_risk = len([m for m in mines if m['risk_score'] < 40])
        medium_risk = len([m for m in mines if 40 <= m['risk_score'] < 70])
        high_risk = len([m for m in mines if m['risk_score'] >= 70])
        
        return {
            "total_mines": total_mines,
            "risk_distribution": {
                "low": low_risk,
                "medium": medium_risk,
                "high": high_risk
            },
            "average_risk_score": round(sum([m['risk_score'] for m in mines]) / total_mines, 2),
            "active_mines": len([m for m in mines if m['status'] == 'Active']),
            "high_risk_mines": high_risk,
            "last_updated": datetime.now().isoformat()
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    print("🚀 Starting stable backend server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)