# Tamil Nadu Rockfall Risk Prediction System
# Configuration file for system settings

# Database Configuration
DATABASE_CONFIG = {
    "type": "sqlite",
    "url": "sqlite:///./data/rockfall_db.sqlite",
    "echo": False
}

# API Configuration
API_CONFIG = {
    "host": "0.0.0.0",
    "port": 8000,
    "debug": True,
    "reload": True,
    "cors_origins": [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000"
    ]
}

# Frontend Configuration
FRONTEND_CONFIG = {
    "port": 3000,
    "api_base_url": "http://localhost:8000",
    "map_center": [11.0168, 76.9558],  # Tamil Nadu center
    "map_zoom": 7,
    "theme": {
        "primary": "#3b82f6",
        "secondary": "#64748b",
        "accent": "#f59e0b",
        "success": "#10b981",
        "warning": "#f59e0b",
        "error": "#ef4444"
    }
}

# Data Processing Configuration
DATA_CONFIG = {
    "raw_data_path": "./data/raw/",
    "processed_data_path": "./data/processed/",
    "models_path": "./models/",
    "imagery_path": "./data/imagery/",
    "batch_size": 1000,
    "validation_split": 0.2,
    "test_split": 0.1
}

# Machine Learning Configuration
ML_CONFIG = {
    "models": {
        "random_forest": {
            "n_estimators": 100,
            "max_depth": 10,
            "min_samples_split": 5,
            "min_samples_leaf": 2,
            "random_state": 42
        },
        "lightgbm": {
            "objective": "regression",
            "boosting_type": "gbdt",
            "num_leaves": 31,
            "learning_rate": 0.05,
            "feature_fraction": 0.9,
            "bagging_fraction": 0.8,
            "bagging_freq": 5,
            "verbose": 0,
            "random_state": 42
        },
        "neural_network": {
            "hidden_layers": [64, 32, 16],
            "activation": "relu",
            "learning_rate": 0.001,
            "epochs": 100,
            "batch_size": 32,
            "validation_split": 0.2
        }
    },
    "ensemble_weights": {
        "random_forest": 0.4,
        "lightgbm": 0.4,
        "neural_network": 0.2
    },
    "feature_selection": {
        "method": "mutual_info_regression",
        "k_best": 15
    }
}

# Satellite Imagery Configuration
IMAGERY_CONFIG = {
    "sentinel": {
        "username": "your_copernicus_username",
        "password": "your_copernicus_password",
        "producttype": "S2MSI1C",
        "cloudcoverpercentage": (0, 30),
        "date_range_days": 30
    },
    "processing": {
        "bands": ["B02", "B03", "B04", "B08"],  # Blue, Green, Red, NIR
        "resolution": 10,  # meters
        "buffer_distance": 1000  # meters around mine sites
    }
}

# Environmental Data Configuration
ENVIRONMENTAL_CONFIG = {
    "weather": {
        "api_key": "your_weather_api_key",
        "base_url": "https://api.openweathermap.org/data/2.5",
        "parameters": ["temperature", "humidity", "precipitation", "wind_speed"]
    },
    "elevation": {
        "source": "SRTM",
        "resolution": 30  # meters
    },
    "geology": {
        "default_rock_type": "granite",
        "stability_factors": {
            "granite": 0.8,
            "sandstone": 0.6,
            "limestone": 0.7,
            "shale": 0.4,
            "quartzite": 0.9
        }
    }
}

# Risk Assessment Configuration
RISK_CONFIG = {
    "thresholds": {
        "low": 0.3,
        "medium": 0.6,
        "high": 0.8
    },
    "weights": {
        "geological": 0.3,
        "environmental": 0.25,
        "imagery": 0.25,
        "historical": 0.2
    },
    "alert_levels": {
        "green": {"min": 0.0, "max": 0.3, "action": "routine_monitoring"},
        "yellow": {"min": 0.3, "max": 0.6, "action": "increased_monitoring"},
        "orange": {"min": 0.6, "max": 0.8, "action": "safety_precautions"},
        "red": {"min": 0.8, "max": 1.0, "action": "immediate_evacuation"}
    }
}

# Monitoring Configuration
MONITORING_CONFIG = {
    "update_frequency": "daily",
    "data_retention_days": 365,
    "alert_channels": ["email", "sms", "dashboard"],
    "backup_frequency": "weekly",
    "log_level": "INFO"
}

# Geographic Boundaries (Tamil Nadu)
GEOGRAPHIC_CONFIG = {
    "tamil_nadu_bounds": {
        "north": 13.5,
        "south": 8.0,
        "east": 80.3,
        "west": 76.2
    },
    "major_mining_districts": [
        "Salem",
        "Dharmapuri",
        "Krishnagiri",
        "Tiruvannamalai",
        "Vellore",
        "Cuddalore",
        "Villupuram"
    ]
}

# Security Configuration
SECURITY_CONFIG = {
    "api_key_required": False,  # Set to True in production
    "rate_limiting": {
        "requests_per_minute": 100,
        "requests_per_hour": 1000
    },
    "cors_settings": {
        "allow_origins": ["*"],  # Restrict in production
        "allow_methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["*"]
    }
}

# Export all configurations
__all__ = [
    "DATABASE_CONFIG",
    "API_CONFIG",
    "FRONTEND_CONFIG",
    "DATA_CONFIG",
    "ML_CONFIG",
    "IMAGERY_CONFIG",
    "ENVIRONMENTAL_CONFIG",
    "RISK_CONFIG",
    "MONITORING_CONFIG",
    "GEOGRAPHIC_CONFIG",
    "SECURITY_CONFIG"
]