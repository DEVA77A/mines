from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/api/mines")
def get_mines():
    return [
        {
            "mine_id": "TN_001",
            "mine_name": "Salem Iron Ore Mine",
            "district": "Salem",
            "mine_type": "Iron Ore",
            "latitude": 11.6643,
            "longitude": 78.1460,
            "risk_score": 68.5,
            "status": "Active"
        },
        {
            "mine_id": "TN_002", 
            "mine_name": "Dharmapuri Granite Quarry",
            "district": "Dharmapuri",
            "mine_type": "Granite",
            "latitude": 12.1211,
            "longitude": 78.1597,
            "risk_score": 42.3,
            "status": "Active"
        },
        {
            "mine_id": "TN_003",
            "mine_name": "Krishnagiri Bauxite Mine",
            "district": "Krishnagiri", 
            "mine_type": "Bauxite",
            "latitude": 12.5265,
            "longitude": 78.2140,
            "risk_score": 78.9,
            "status": "Under Review"
        }
    ]

@app.get("/api/mines/{mine_id}")
def get_mine_details(mine_id: str):
    mines = {
        "TN_001": {
            "mine_id": "TN_001",
            "mine_name": "Salem Iron Ore Mine",
            "district": "Salem",
            "mine_type": "Iron Ore",
            "latitude": 11.6643,
            "longitude": 78.1460,
            "risk_score": 68.5,
            "status": "Active",
            "geological_data": {
                "rock_strength": 125.5,
                "fracture_frequency": 0.8,
                "groundwater_level": 25.0
            },
            "environmental_factors": {
                "seismic_activity": 2.1,
                "erosion_rate": 1.5,
                "vegetation_cover": 45.0
            }
        },
        "TN_002": {
            "mine_id": "TN_002", 
            "mine_name": "Dharmapuri Granite Quarry",
            "district": "Dharmapuri",
            "mine_type": "Granite",
            "latitude": 12.1211,
            "longitude": 78.1597,
            "risk_score": 42.3,
            "status": "Active",
            "geological_data": {
                "rock_strength": 180.2,
                "fracture_frequency": 0.4,
                "groundwater_level": 35.0
            },
            "environmental_factors": {
                "seismic_activity": 1.8,
                "erosion_rate": 1.2,
                "vegetation_cover": 60.0
            }
        },
        "TN_003": {
            "mine_id": "TN_003",
            "mine_name": "Krishnagiri Bauxite Mine",
            "district": "Krishnagiri", 
            "mine_type": "Bauxite",
            "latitude": 12.5265,
            "longitude": 78.2140,
            "risk_score": 78.9,
            "status": "Under Review",
            "geological_data": {
                "rock_strength": 95.8,
                "fracture_frequency": 1.2,
                "groundwater_level": 15.0
            },
            "environmental_factors": {
                "seismic_activity": 3.2,
                "erosion_rate": 2.8,
                "vegetation_cover": 25.0
            }
        }
    }
    
    if mine_id in mines:
        return mines[mine_id]
    else:
        return {"error": "Mine not found"}

@app.get("/api/stats")
def get_stats():
    return {
        "total_mines": 3,
        "risk_distribution": {
            "low": 0,
            "medium": 1,
            "high": 2
        },
        "active_mines": 2,
        "average_risk_score": 63.2
    }

@app.get("/api/predict/{mine_id}")
def predict_risk(mine_id: str):
    predictions = {
        "TN_001": {
            "mine_id": mine_id,
            "risk_score": 68.5,
            "risk_level": "Medium",
            "confidence": 85.2,
            "factors": {
                "geological": 25.5,
                "environmental": 30.2,
                "operational": 12.8
            },
            "recommendations": [
                "Increase monitoring frequency",
                "Install additional sensors",
                "Review drainage systems"
            ]
        },
        "TN_002": {
            "mine_id": mine_id,
            "risk_score": 42.3,
            "risk_level": "Medium",
            "confidence": 92.1,
            "factors": {
                "geological": 15.8,
                "environmental": 18.5,
                "operational": 8.0
            },
            "recommendations": [
                "Continue regular monitoring",
                "Maintain current safety protocols"
            ]
        },
        "TN_003": {
            "mine_id": mine_id,
            "risk_score": 78.9,
            "risk_level": "High",
            "confidence": 88.7,
            "factors": {
                "geological": 35.2,
                "environmental": 28.7,
                "operational": 15.0
            },
            "recommendations": [
                "Immediate safety review required",
                "Consider temporary operations halt",
                "Deploy emergency monitoring systems"
            ]
        }
    }
    
    if mine_id in predictions:
        return predictions[mine_id]
    else:
        return {"error": "Prediction not available for this mine"}

@app.get("/api/alerts")
def get_alerts():
    return {
        "alerts": [
            {
                "id": "alert_TN_003",
                "mine_id": "TN_003",
                "mine_name": "Krishnagiri Bauxite Mine",
                "message": "High risk detected - immediate inspection required",
                "priority": "High",
                "timestamp": "2024-01-15T10:30:00Z"
            }
        ],
        "total_alerts": 1,
        "high_priority": 1
    }

if __name__ == "__main__":
    print("🚀 Starting minimal backend server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)