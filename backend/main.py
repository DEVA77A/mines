"""
FastAPI Backend for Tamil Nadu Rockfall Risk Prediction System
This API serves ML predictions, mine data, and handles dashboard requests
"""

from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pandas as pd
import numpy as np
import joblib
import json
from pathlib import Path
from datetime import datetime, timedelta
import logging
import uvicorn
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Global variables for models and data
ml_models = {}
scaler = None
label_encoders = {}
feature_columns = []
mines_data = None
risk_data = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load ML models and data on startup"""
    global ml_models, scaler, label_encoders, feature_columns, mines_data, risk_data
    
    logger.info("Loading ML models and data...")
    
    try:
        # Paths
        data_dir = Path(__file__).parent.parent / "data"
        models_dir = Path(__file__).parent.parent / "models"
        
        # Load ML models
        model_files = {
            'rockfall_model': models_dir / "rockfall_model.pkl",
            'random_forest': models_dir / "random_forest_multiclass.pkl",
            'lightgbm': models_dir / "lightgbm_multiclass.pkl"
        }
        
        for model_name, model_path in model_files.items():
            if model_path.exists():
                ml_models[model_name] = joblib.load(model_path)
                logger.info(f"Loaded {model_name}")
        
        # Load preprocessing objects
        scaler_path = models_dir / "scaler.pkl"
        if scaler_path.exists():
            scaler = joblib.load(scaler_path)
            logger.info("Loaded scaler")
        
        encoders_path = models_dir / "label_encoders.pkl"
        if encoders_path.exists():
            label_encoders = joblib.load(encoders_path)
            logger.info("Loaded label encoders")
        
        features_path = models_dir / "feature_columns.json"
        if features_path.exists():
            with open(features_path, 'r') as f:
                feature_columns = json.load(f)
            logger.info(f"Loaded {len(feature_columns)} feature columns")
        
        # Load mines data
        mines_path = data_dir / "processed" / "tamilnadu_mines_clean.csv"
        if mines_path.exists():
            mines_data = pd.read_csv(mines_path)
            logger.info(f"Loaded {len(mines_data)} mines")
        
        # Load risk data
        risk_path = data_dir / "processed" / "risk_dataset.csv"
        if risk_path.exists():
            risk_data = pd.read_csv(risk_path)
            logger.info(f"Loaded risk dataset with {len(risk_data)} records")
        
        logger.info("Startup completed successfully")
        
    except Exception as e:
        logger.error(f"Error during startup: {e}")
        # Continue without models - API will return appropriate errors
    
    yield
    
    # Cleanup
    logger.info("Shutting down...")

# Create FastAPI app
app = FastAPI(
    title="Tamil Nadu Rockfall Risk Prediction API",
    description="AI-powered rockfall risk assessment for open-pit mines in Tamil Nadu, India",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class MineLocation(BaseModel):
    latitude: float
    longitude: float
    mine_name: Optional[str] = None

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

class MineInfo(BaseModel):
    mine_id: int
    mine_name: str
    district: str
    mineral_type: str
    latitude: float
    longitude: float
    lease_area_ha: float
    status: str
    risk_category: Optional[str] = None
    risk_score: Optional[float] = None

# API Routes

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Tamil Nadu Rockfall Risk Prediction API",
        "version": "1.0.0",
        "status": "active",
        "endpoints": {
            "mines": "/mines",
            "predict": "/predict",
            "mine_details": "/mines/{mine_id}",
            "statistics": "/statistics",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    global ml_models, mines_data, risk_data
    
    status = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "models_loaded": len(ml_models),
        "data_available": {
            "mines": mines_data is not None,
            "risk_data": risk_data is not None,
            "total_mines": len(mines_data) if mines_data is not None else 0
        }
    }
    
    return status

@app.get("/mines", response_model=List[MineInfo])
async def get_mines(
    district: Optional[str] = Query(None, description="Filter by district"),
    mineral_type: Optional[str] = Query(None, description="Filter by mineral type"),
    status: Optional[str] = Query(None, description="Filter by status (Active/Closed)"),
    risk_category: Optional[str] = Query(None, description="Filter by risk category"),
    limit: int = Query(100, description="Maximum number of results")
):
    """Get list of mines with optional filtering"""
    global mines_data, risk_data
    
    if mines_data is None:
        raise HTTPException(status_code=503, detail="Mines data not available")
    
    # Start with all mines
    filtered_data = mines_data.copy()
    
    # Add risk information if available
    if risk_data is not None:
        # Merge risk data
        filtered_data = filtered_data.merge(
            risk_data[['mine_id', 'environmental_risk_score']].rename(columns={'environmental_risk_score': 'risk_score'}),
            left_index=True, right_on='mine_id', how='left'
        )
        
        # Add risk categories
        filtered_data['risk_category'] = pd.cut(
            filtered_data['risk_score'].fillna(0.5),
            bins=[0, 0.4, 0.7, 1.0],
            labels=['Low', 'Medium', 'High']
        )
    
    # Apply filters
    if district:
        filtered_data = filtered_data[filtered_data['district'].str.contains(district, case=False, na=False)]
    
    if mineral_type:
        filtered_data = filtered_data[filtered_data['mineral_type'].str.contains(mineral_type, case=False, na=False)]
    
    if status:
        filtered_data = filtered_data[filtered_data['status'].str.contains(status, case=False, na=False)]
    
    if risk_category:
        filtered_data = filtered_data[filtered_data['risk_category'] == risk_category]
    
    # Limit results (but keep a copy for predictions)
    filtered_data = filtered_data.head(limit)
    
    # Convert to response format
    mines_list = []
    # If ML model is available, attempt batch predictions for returned mines
    predictions = None
    try:
        if ml_models and 'rockfall_model' in ml_models and feature_columns and risk_data is not None:
            model = ml_models['rockfall_model']
            # merge to ensure feature columns exist on filtered_data
            merged = filtered_data.merge(risk_data, left_index=True, right_on='mine_id', how='left')
            # Build feature matrix
            X_pred = pd.DataFrame()
            for col in feature_columns:
                if col in merged.columns:
                    X_pred[col] = merged[col].fillna(0)
                else:
                    X_pred[col] = 0
            if scaler is not None:
                X_pred_scaled = scaler.transform(X_pred)
                X_pred = pd.DataFrame(X_pred_scaled, columns=feature_columns)
            probs = model.predict_proba(X_pred)
            classes = model.classes_
            pred_labels = model.predict(X_pred)
            predictions = []
            for p_label, p_probs in zip(pred_labels, probs):
                predictions.append({'label': str(p_label), 'probs': {str(c): float(p) for c, p in zip(classes, p_probs)}, 'confidence': float(max(p_probs))})
    except Exception as e:
        logger.error(f"Batch prediction failed: {e}")

    for idx, mine in filtered_data.iterrows():
        mine_info = MineInfo(
            mine_id=int(idx + 1),
            mine_name=mine['mine_name'],
            district=mine['district'],
            mineral_type=mine['mineral_type'],
            latitude=float(mine['latitude']),
            longitude=float(mine['longitude']),
            lease_area_ha=float(mine['lease_area_ha']),
            status=mine['status'],
            risk_category=str(mine.get('risk_category', 'Unknown')),
            risk_score=float(mine.get('risk_score', 0.0)) if pd.notna(mine.get('risk_score')) else None
        )
        # attach model prediction if available for this index
        if predictions is not None:
            try:
                pred = predictions.pop(0)
                mine_info.risk_category = pred['label']
                mine_info.risk_score = mine_info.risk_score or None
            except Exception:
                pass
        mines_list.append(mine_info)
    
    return mines_list

@app.get("/mines/{mine_id}")
async def get_mine_details(mine_id: int):
    """Get detailed information for a specific mine"""
    global mines_data, risk_data
    
    if mines_data is None:
        raise HTTPException(status_code=503, detail="Mines data not available")
    
    if mine_id < 1 or mine_id > len(mines_data):
        raise HTTPException(status_code=404, detail="Mine not found")
    
    # Get mine data (mine_id is 1-indexed)
    mine = mines_data.iloc[mine_id - 1]
    
    # Get risk data if available
    risk_info = {}
    if risk_data is not None and mine_id <= len(risk_data):
        risk_row = risk_data.iloc[mine_id - 1]
        risk_info = {
            'environmental_risk_score': float(risk_row.get('environmental_risk_score', 0.0)),
            'slope_degrees': float(risk_row.get('slope_degrees', 0.0)),
            'elevation_m': float(risk_row.get('elevation_m', 0.0)),
            'avg_rainfall_mm': float(risk_row.get('avg_rainfall_mm', 0.0)),
            'avg_temp_c': float(risk_row.get('avg_temp_c', 0.0)),
            'geological_risk': float(risk_row.get('geological_risk', 0.0)),
            'rock_stability_index': float(risk_row.get('rock_stability_index', 0.0))
        }
    
    # Combine mine and risk information
    mine_details = {
        'mine_id': mine_id,
        'mine_name': mine['mine_name'],
        'district': mine['district'],
        'mineral_type': mine['mineral_type'],
        'latitude': float(mine['latitude']),
        'longitude': float(mine['longitude']),
        'lease_area_ha': float(mine['lease_area_ha']),
        'status': mine['status'],
        'risk_assessment': risk_info,
        'last_updated': datetime.now().isoformat()
    }
    
    return mine_details

@app.post("/predict", response_model=RiskPredictionResponse)
async def predict_risk(features: MineFeatures):
    """Predict rockfall risk for given mine features"""
    global ml_models, scaler, feature_columns
    
    if not ml_models or 'rockfall_model' not in ml_models:
        raise HTTPException(status_code=503, detail="ML model not available")
    
    try:
        # Prepare feature vector
        feature_dict = features.dict()
        
        # Create DataFrame with all required features
        input_df = pd.DataFrame([feature_dict])
        
        # Add missing features with default values
        for col in feature_columns:
            if col not in input_df.columns:
                if 'encoded' in col:
                    input_df[col] = 0  # Default encoded value
                else:
                    input_df[col] = 0.0  # Default numerical value
        
        # Select and order features
        X = input_df[feature_columns].fillna(0)
        
        # Scale if scaler is available
        if scaler is not None:
            X_scaled = scaler.transform(X)
            X = pd.DataFrame(X_scaled, columns=feature_columns)
        
        # Make prediction
        model = ml_models['rockfall_model']
        risk_class = model.predict(X)[0]
        risk_probabilities = model.predict_proba(X)[0]
        
        # Get class labels
        class_labels = model.classes_
        risk_prob_dict = {label: float(prob) for label, prob in zip(class_labels, risk_probabilities)}
        
        # Calculate confidence (max probability)
        confidence = float(max(risk_probabilities))
        
        # Identify key risk factors
        risk_factors = {
            'slope_risk': features.slope_degrees / 45.0,  # Normalized slope risk
            'elevation_factor': min(features.elevation_m / 2000.0, 1.0),  # Normalized elevation
            'weather_stress': (features.avg_rainfall_mm - 100) / 1000.0,  # Weather impact
            'mineral_risk': 0.7 if features.mineral_type in ['Granite', 'Iron Ore'] else 0.4
        }
        
        response = RiskPredictionResponse(
            risk_category=risk_class,
            risk_probability=risk_prob_dict,
            risk_factors=risk_factors,
            confidence=confidence
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error in prediction: {e}")
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.get("/statistics")
async def get_statistics():
    """Get overall system statistics"""
    global mines_data, risk_data
    
    if mines_data is None:
        raise HTTPException(status_code=503, detail="Data not available")
    
    stats = {
        'total_mines': len(mines_data),
        'districts': mines_data['district'].nunique(),
        'mineral_types': mines_data['mineral_type'].value_counts().to_dict(),
        'status_distribution': mines_data['status'].value_counts().to_dict(),
        'active_mines': len(mines_data[mines_data['status'] == 'Active']),
        'total_lease_area': float(mines_data['lease_area_ha'].sum()),
        'average_lease_area': float(mines_data['lease_area_ha'].mean()),
    }
    
    # Add risk statistics if available
    if risk_data is not None:
        risk_categories = pd.cut(
            risk_data['environmental_risk_score'],
            bins=[0, 0.4, 0.7, 1.0],
            labels=['Low', 'Medium', 'High']
        )
        
        stats['risk_distribution'] = risk_categories.value_counts().to_dict()
        stats['average_risk_score'] = float(risk_data['environmental_risk_score'].mean())
        stats['high_risk_mines'] = int((risk_data['environmental_risk_score'] >= 0.7).sum())
    
    stats['last_updated'] = datetime.now().isoformat()
    
    return stats


@app.get("/model-metrics")
async def get_model_metrics():
    """Return saved model training results and basic metadata"""
    global feature_columns
    models_dir = Path(__file__).parent.parent / "models"
    results_path = models_dir / "model_results.json"
    summary = {}
    if results_path.exists():
        try:
            with open(results_path, 'r') as f:
                summary = json.load(f)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error reading model results: {e}")
    else:
        raise HTTPException(status_code=404, detail="Model results not found")

    return {
        'feature_columns_count': len(feature_columns),
        'results': summary
    }

@app.get("/districts")
async def get_districts():
    """Get list of all districts"""
    global mines_data
    
    if mines_data is None:
        raise HTTPException(status_code=503, detail="Data not available")
    
    districts = sorted(mines_data['district'].unique().tolist())
    return {"districts": districts}

@app.get("/mineral-types")
async def get_mineral_types():
    """Get list of all mineral types"""
    global mines_data
    
    if mines_data is None:
        raise HTTPException(status_code=503, detail="Data not available")
    
    mineral_types = sorted(mines_data['mineral_type'].unique().tolist())
    return {"mineral_types": mineral_types}

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"message": "Resource not found", "detail": str(exc.detail) if hasattr(exc, 'detail') else "Not found"}
    )

@app.exception_handler(500)
async def internal_server_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"message": "Internal server error", "detail": "An unexpected error occurred"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )