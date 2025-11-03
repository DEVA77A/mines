"""
Rockfall Risk Prediction Model for Tamil Nadu Mines
This script develops and trains ML models for rockfall risk prediction
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, roc_curve
import lightgbm as lgb
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import logging
from pathlib import Path
import json
import warnings
warnings.filterwarnings('ignore')

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RockfallRiskPredictor:
    def __init__(self):
        self.data_dir = Path(__file__).parent.parent / "data"
        self.models_dir = Path(__file__).parent.parent / "models"
        self.models_dir.mkdir(exist_ok=True)
        
        self.processed_dir = self.data_dir / "processed"
        self.viz_dir = self.models_dir / "visualizations"
        self.viz_dir.mkdir(exist_ok=True)
        
        self.models = {}
        self.scaler = StandardScaler()
        self.label_encoders = {}
        
    def load_and_prepare_data(self):
        """Load and prepare the integrated risk dataset"""
        logger.info("Loading integrated risk dataset...")
        
        risk_dataset_path = self.processed_dir / "risk_dataset.csv"
        if not risk_dataset_path.exists():
            raise FileNotFoundError(f"Risk dataset not found at {risk_dataset_path}. Please run environmental_integrator.py first.")
        
        df = pd.read_csv(risk_dataset_path)
        logger.info(f"Loaded dataset with {len(df)} samples and {len(df.columns)} features")
        
        return df
    
    def create_risk_labels(self, df):
        """Create risk labels based on environmental risk score and other factors"""
        logger.info("Creating risk labels...")
        
        # Create risk categories based on multiple factors
        risk_conditions = [
            # High Risk: High environmental score OR steep slopes with geological risk
            (df['environmental_risk_score'] >= 0.7) | 
            ((df['slope_degrees'] >= 30) & (df['geological_risk'] >= 0.5)),
            
            # Medium Risk: Moderate environmental score OR moderate conditions
            ((df['environmental_risk_score'] >= 0.4) & (df['environmental_risk_score'] < 0.7)) |
            ((df['slope_degrees'] >= 15) & (df['slope_degrees'] < 30) & (df['geological_risk'] >= 0.3)),
            
            # Low Risk: Everything else
            True
        ]
        
        risk_labels = ['High', 'Medium', 'Low']
        df['risk_category'] = np.select(risk_conditions, risk_labels)
        
        # Create binary risk labels for some models (High risk vs Others)
        df['high_risk_binary'] = (df['risk_category'] == 'High').astype(int)
        
        # Add some realistic variation and edge cases
        # Some mines might have lower risk due to good management practices
        np.random.seed(42)
        management_factor = np.random.uniform(0.8, 1.0, len(df))
        adjusted_risk = df['environmental_risk_score'] * management_factor
        
        # Update some labels based on adjusted risk
        mask_adjust = (df['risk_category'] == 'High') & (adjusted_risk < 0.6)
        df.loc[mask_adjust, 'risk_category'] = 'Medium'
        df.loc[mask_adjust, 'high_risk_binary'] = 0
        
        risk_distribution = df['risk_category'].value_counts()
        logger.info(f"Risk distribution: {risk_distribution.to_dict()}")
        
        return df
    
    def feature_engineering(self, df):
        """Engineer additional features for the model"""
        logger.info("Engineering additional features...")
        
        # Interaction features
        df['slope_rainfall_interaction'] = df['slope_degrees'] * df['avg_rainfall_mm'] / 1000
        df['temp_elevation_interaction'] = df['extreme_max_temp_c'] * (df['elevation_m'] / 1000)
        df['geological_weather_risk'] = df['geological_risk'] * df['weathering_index']
        
        # Composite indices
        df['stability_index'] = (
            df['rock_stability_index'] * 0.4 +
            (1 - df['fracture_density']) * 0.3 +
            (1 - df['weathering_index']) * 0.3
        )
        
        df['weather_stress_index'] = (
            df['rainfall_intensity'] * 0.4 +
            df['temperature_stress'] * 0.3 +
            (df['rainfall_variability'] / df['avg_rainfall_mm']) * 0.3
        )
        
        # Mine characteristics
        df['mine_age_proxy'] = (df['lease_area_ha'] > df['lease_area_ha'].median()).astype(int)
        
        # Location-based features (latitude/longitude bands)
        df['lat_band'] = pd.cut(df['latitude'], bins=5, labels=['South', 'South-Central', 'Central', 'North-Central', 'North'])
        df['lon_band'] = pd.cut(df['longitude'], bins=5, labels=['West', 'West-Central', 'Central', 'East-Central', 'East'])
        
        logger.info(f"Added engineered features. Total features: {len(df.columns)}")
        return df
    
    def prepare_features(self, df):
        """Prepare features for machine learning"""
        logger.info("Preparing features for ML...")
        
        # Define feature categories
        numerical_features = [
            'lease_area_ha', 'latitude', 'longitude', 'estimated_elevation',
            'avg_rainfall_mm', 'max_rainfall_mm', 'rainfall_variability',
            'avg_temp_c', 'extreme_max_temp_c', 'extreme_min_temp_c',
            'elevation_m', 'slope_degrees', 'aspect_degrees', 'terrain_ruggedness_index',
            'rock_stability_index', 'fracture_density', 'weathering_index',
            'joint_spacing_m', 'ucs_mpa', 'rainfall_intensity', 'temperature_stress',
            'slope_risk_factor', 'geological_risk', 'environmental_risk_score',
            'slope_rainfall_interaction', 'temp_elevation_interaction',
            'geological_weather_risk', 'stability_index', 'weather_stress_index'
        ]
        
        categorical_features = [
            'district', 'mineral_type', 'status', 'size_category',
            'lat_band', 'lon_band', 'mine_age_proxy'
        ]
        
        # Encode categorical features
        for cat_feature in categorical_features:
            if cat_feature in df.columns:
                le = LabelEncoder()
                df[f'{cat_feature}_encoded'] = le.fit_transform(df[cat_feature].fillna('Unknown'))
                self.label_encoders[cat_feature] = le
        
        # Select final features for modeling
        feature_columns = numerical_features + [f'{cat}_encoded' for cat in categorical_features if cat in df.columns]
        feature_columns = [col for col in feature_columns if col in df.columns]
        
        X = df[feature_columns].fillna(df[feature_columns].median())
        y_multiclass = df['risk_category']
        y_binary = df['high_risk_binary']
        
        logger.info(f"Prepared {len(feature_columns)} features for modeling")
        
        return X, y_multiclass, y_binary, feature_columns
    
    def train_models(self, X, y_multiclass, y_binary, feature_columns):
        """Train multiple ML models"""
        logger.info("Training ML models...")
        
        # Split data
        X_train, X_test, y_multi_train, y_multi_test, y_bin_train, y_bin_test = train_test_split(
            X, y_multiclass, y_binary, test_size=0.2, random_state=42, stratify=y_multiclass
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Define models
        models_config = {
            'random_forest': {
                'model': RandomForestClassifier(n_estimators=100, random_state=42),
                'multiclass': True,
                'binary': True
            },
            'gradient_boosting': {
                'model': GradientBoostingClassifier(n_estimators=100, random_state=42),
                'multiclass': True,
                'binary': True
            },
            'lightgbm': {
                'model': lgb.LGBMClassifier(n_estimators=100, random_state=42, verbose=-1),
                'multiclass': True,
                'binary': True
            }
        }
        
        results = {
            'multiclass': {},
            'binary': {},
            'feature_importance': {},
            'training_date': datetime.now().isoformat()
        }
        
        for model_name, config in models_config.items():
            logger.info(f"Training {model_name}...")
            
            # Multiclass classification
            if config['multiclass']:
                model_multi = config['model']
                model_multi.fit(X_train, y_multi_train)
                
                # Predictions
                y_pred_multi = model_multi.predict(X_test)
                
                # Evaluation
                accuracy_multi = model_multi.score(X_test, y_multi_test)
                cv_scores_multi = cross_val_score(model_multi, X_train, y_multi_train, cv=5)
                
                results['multiclass'][model_name] = {
                    'accuracy': float(accuracy_multi),
                    'cv_mean': float(cv_scores_multi.mean()),
                    'cv_std': float(cv_scores_multi.std()),
                    'classification_report': classification_report(y_multi_test, y_pred_multi, output_dict=True)
                }
                
                # Save model
                model_path = self.models_dir / f"{model_name}_multiclass.pkl"
                joblib.dump(model_multi, model_path)
                
                # Feature importance (for tree-based models)
                if hasattr(model_multi, 'feature_importances_'):
                    importance_df = pd.DataFrame({
                        'feature': feature_columns,
                        'importance': model_multi.feature_importances_
                    }).sort_values('importance', ascending=False)
                    
                    results['feature_importance'][f'{model_name}_multiclass'] = importance_df.head(10).to_dict('records')
            
            # Binary classification
            if config['binary']:
                model_bin = config['model'].__class__(**config['model'].get_params())
                model_bin.fit(X_train, y_bin_train)
                
                # Predictions
                y_pred_bin = model_bin.predict(X_test)
                y_pred_proba_bin = model_bin.predict_proba(X_test)[:, 1]
                
                # Evaluation
                accuracy_bin = model_bin.score(X_test, y_bin_test)
                auc_score = roc_auc_score(y_bin_test, y_pred_proba_bin)
                cv_scores_bin = cross_val_score(model_bin, X_train, y_bin_train, cv=5)
                
                results['binary'][model_name] = {
                    'accuracy': float(accuracy_bin),
                    'auc': float(auc_score),
                    'cv_mean': float(cv_scores_bin.mean()),
                    'cv_std': float(cv_scores_bin.std()),
                    'classification_report': classification_report(y_bin_test, y_pred_bin, output_dict=True)
                }
                
                # Save model
                model_path = self.models_dir / f"{model_name}_binary.pkl"
                joblib.dump(model_bin, model_path)
        
        # Save scaler and label encoders
        joblib.dump(self.scaler, self.models_dir / "scaler.pkl")
        joblib.dump(self.label_encoders, self.models_dir / "label_encoders.pkl")
        
        # Save feature columns
        with open(self.models_dir / "feature_columns.json", 'w') as f:
            json.dump(feature_columns, f)
        
        # Save results
        with open(self.models_dir / "model_results.json", 'w') as f:
            json.dump(results, f, indent=2)
        
        logger.info("Model training completed")
        return results, X_test, y_multi_test, y_bin_test
    
    def create_final_model(self, df, feature_columns):
        """Create and save the final production model"""
        logger.info("Creating final production model...")
        
        # Prepare data
        X, y_multiclass, y_binary, _ = self.prepare_features(df)
        X = X[feature_columns].fillna(X[feature_columns].median())
        
        # Use best performing model (typically Random Forest or LightGBM)
        final_model = lgb.LGBMClassifier(
            n_estimators=200,
            max_depth=8,
            learning_rate=0.1,
            random_state=42,
            verbose=-1
        )
        
        # Train on full dataset
        final_model.fit(X, y_multiclass)
        
        # Save final model
        joblib.dump(final_model, self.models_dir / "rockfall_model.pkl")
        
        logger.info("Final model saved as rockfall_model.pkl")
        return final_model

def main():
    """Main execution function"""
    predictor = RockfallRiskPredictor()
    
    try:
        # Load and prepare data
        df = predictor.load_and_prepare_data()
        
        # Create risk labels
        df = predictor.create_risk_labels(df)
        
        # Feature engineering
        df = predictor.feature_engineering(df)
        
        # Prepare features
        X, y_multiclass, y_binary, feature_columns = predictor.prepare_features(df)
        
        # Train models
        results, X_test, y_multi_test, y_bin_test = predictor.train_models(
            X, y_multiclass, y_binary, feature_columns
        )
        
        # Create final production model
        final_model = predictor.create_final_model(df, feature_columns)
        
        # Print results summary
        print("\n=== Model Training Results ===")
        print("\nMulticlass Classification:")
        for model_name, scores in results['multiclass'].items():
            print(f"{model_name}: {scores['accuracy']:.3f} (±{scores['cv_std']:.3f})")
        
        print("\nBinary Classification (High Risk Detection):")
        for model_name, scores in results['binary'].items():
            print(f"{model_name}: Accuracy={scores['accuracy']:.3f}, AUC={scores['auc']:.3f}")
        
        print(f"\nModels saved to: {predictor.models_dir}")
        
    except Exception as e:
        logger.error(f"Error in model training: {e}")
        raise

if __name__ == "__main__":
    main()