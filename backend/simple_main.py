from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from pathlib import Path
import uvicorn

app = FastAPI(title="Tamil Nadu Rockfall Risk API", version="1.0.0")

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
    return {"message": "Tamil Nadu Rockfall Risk Prediction API", "status": "running"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": pd.Timestamp.now().isoformat()}

@app.get("/api/mines")
def get_mines():
    """Get all mines data"""
    try:
        data_file = Path("data/processed/tamil_nadu_mines.csv")
        if data_file.exists():
            df = pd.read_csv(data_file)
            return df.to_dict(orient="records")
        else:
            # Return sample data if file doesn't exist
            return [
                {
                    "mine_id": "TN_001",
                    "mine_name": "Sample Mine",
                    "district": "Salem",
                    "latitude": 11.664,
                    "longitude": 78.146,
                    "risk_score": 75.5,
                    "mine_type": "Iron Ore"
                }
            ]
    except Exception as e:
        return {"error": str(e)}

@app.get("/api/predict/{mine_id}")
def predict_risk(mine_id: str):
    """Predict risk for a specific mine"""
    # Simple mock prediction
    risk_score = np.random.uniform(20, 95)
    risk_level = "Low" if risk_score < 40 else "Medium" if risk_score < 70 else "High"
    
    return {
        "mine_id": mine_id,
        "risk_score": round(risk_score, 2),
        "risk_level": risk_level,
        "prediction_time": pd.Timestamp.now().isoformat(),
        "factors": {
            "geological": round(np.random.uniform(10, 30), 2),
            "environmental": round(np.random.uniform(10, 30), 2),
            "operational": round(np.random.uniform(10, 30), 2)
        }
    }

@app.get("/api/stats")
def get_statistics():
    """Get system statistics"""
    return {
        "total_mines": 127,
        "high_risk_mines": 23,
        "medium_risk_mines": 54,
        "low_risk_mines": 50,
        "last_updated": pd.Timestamp.now().isoformat()
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
