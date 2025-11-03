"""
Environmental Data Integration for Tamil Nadu Mines
This script fetches and integrates environmental data (rainfall, temperature, DEM)
from various sources for rockfall risk assessment
"""

import pandas as pd
import numpy as np
import requests
from datetime import datetime, timedelta
import logging
from pathlib import Path
import json

# Optional imports - only import if available
try:
    import xarray as xr
    HAS_XARRAY = True
except ImportError:
    HAS_XARRAY = False
    print("Warning: xarray not available. Some geospatial features may be limited.")

try:
    import rasterio
    from rasterio.warp import reproject, Resampling
    from rasterio.transform import from_bounds
    HAS_RASTERIO = True
except ImportError:
    HAS_RASTERIO = False
    print("Warning: rasterio not available. DEM processing may be limited.")

try:
    from scipy.interpolate import griddata
    HAS_SCIPY = True
except ImportError:
    HAS_SCIPY = False
    print("Warning: scipy not available. Interpolation features may be limited.")

try:
    import matplotlib.pyplot as plt
    HAS_MATPLOTLIB = True
except ImportError:
    HAS_MATPLOTLIB = False
    print("Warning: matplotlib not available. Plotting features disabled.")

try:
    from tqdm import tqdm
    HAS_TQDM = True
except ImportError:
    HAS_TQDM = False
    # Fallback for tqdm
    def tqdm(iterable, *args, **kwargs):
        return iterable

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class EnvironmentalDataIntegrator:
    def __init__(self):
        self.data_dir = Path(__file__).parent.parent / "data"
        self.raw_dir = self.data_dir / "raw"
        self.processed_dir = self.data_dir / "processed"
        self.env_data_dir = self.data_dir / "environmental"
        self.env_data_dir.mkdir(exist_ok=True)
        
        # Tamil Nadu bounds
        self.tn_bounds = {
            'min_lat': 8.0, 'max_lat': 13.5,
            'min_lon': 76.0, 'max_lon': 80.5
        }
    
    def generate_synthetic_rainfall_data(self, mines_df):
        """Generate synthetic rainfall data for Tamil Nadu mines"""
        logger.info("Generating synthetic rainfall data...")
        
        rainfall_data = []
        
        for idx, mine in mines_df.iterrows():
            lat, lon = mine['latitude'], mine['longitude']
            mine_name = mine['mine_name']
            
            # Generate monthly rainfall data for the last 12 months
            months = pd.date_range(
                start=datetime.now() - timedelta(days=365),
                end=datetime.now(),
                freq='M'
            )
            
            # Base rainfall varies by location (north vs south Tamil Nadu)
            base_rainfall = 50 + (lat - 8.0) * 20  # More rain in southern TN
            
            for month in months:
                # Seasonal variation (monsoon months have more rain)
                if month.month in [6, 7, 8, 9, 10, 11]:  # Monsoon months
                    seasonal_factor = 2.5
                elif month.month in [12, 1]:  # Winter rainfall
                    seasonal_factor = 1.5
                else:
                    seasonal_factor = 0.3
                
                # Add some randomness
                monthly_rainfall = base_rainfall * seasonal_factor * np.random.uniform(0.5, 1.5)
                
                rainfall_data.append({
                    'mine_id': idx + 1,
                    'mine_name': mine_name,
                    'latitude': lat,
                    'longitude': lon,
                    'date': month.strftime('%Y-%m'),
                    'rainfall_mm': round(monthly_rainfall, 2),
                    'data_source': 'synthetic_imd'
                })
        
        rainfall_df = pd.DataFrame(rainfall_data)
        
        # Save monthly rainfall data
        rainfall_path = self.env_data_dir / "monthly_rainfall.csv"
        rainfall_df.to_csv(rainfall_path, index=False)
        logger.info(f"Rainfall data saved to {rainfall_path}")
        
        return rainfall_df
    
    def generate_synthetic_temperature_data(self, mines_df):
        """Generate synthetic temperature data for Tamil Nadu mines"""
        logger.info("Generating synthetic temperature data...")
        
        temperature_data = []
        
        for idx, mine in mines_df.iterrows():
            lat, lon = mine['latitude'], mine['longitude']
            mine_name = mine['mine_name']
            
            # Generate monthly temperature data for the last 12 months
            months = pd.date_range(
                start=datetime.now() - timedelta(days=365),
                end=datetime.now(),
                freq='M'
            )
            
            # Base temperature varies by location and elevation
            base_temp = 28 - (lat - 8.0) * 0.5  # Cooler in northern TN
            elevation_effect = mine.get('estimated_elevation', 500) * -0.006  # Lapse rate
            base_temp += elevation_effect
            
            for month in months:
                # Seasonal variation
                if month.month in [3, 4, 5]:  # Summer
                    seasonal_temp = base_temp + 8
                elif month.month in [12, 1, 2]:  # Winter
                    seasonal_temp = base_temp - 5
                else:  # Monsoon and post-monsoon
                    seasonal_temp = base_temp + 2
                
                # Add daily variation
                max_temp = seasonal_temp + np.random.uniform(2, 8)
                min_temp = seasonal_temp - np.random.uniform(5, 10)
                avg_temp = (max_temp + min_temp) / 2
                
                temperature_data.append({
                    'mine_id': idx + 1,
                    'mine_name': mine_name,
                    'latitude': lat,
                    'longitude': lon,
                    'date': month.strftime('%Y-%m'),
                    'avg_temp_c': round(avg_temp, 2),
                    'max_temp_c': round(max_temp, 2),
                    'min_temp_c': round(min_temp, 2),
                    'data_source': 'synthetic_era5'
                })
        
        temperature_df = pd.DataFrame(temperature_data)
        
        # Save temperature data
        temp_path = self.env_data_dir / "monthly_temperature.csv"
        temperature_df.to_csv(temp_path, index=False)
        logger.info(f"Temperature data saved to {temp_path}")
        
        return temperature_df
    
    def generate_synthetic_dem_data(self, mines_df):
        """Generate synthetic DEM (elevation, slope, aspect) data"""
        logger.info("Generating synthetic DEM data...")
        
        dem_data = []
        
        for idx, mine in mines_df.iterrows():
            lat, lon = mine['latitude'], mine['longitude']
            mine_name = mine['mine_name']
            
            # Generate elevation data based on location
            # Tamil Nadu elevation varies from sea level to ~2600m (Nilgiris)
            base_elevation = 200  # Base elevation
            
            # Higher elevations in Western Ghats (western border) and Nilgiris
            if lon < 77.0:  # Western Tamil Nadu
                elevation = base_elevation + np.random.uniform(300, 1500)
            elif lat > 11.0 and lon < 78.0:  # Nilgiris region
                elevation = base_elevation + np.random.uniform(800, 2200)
            else:  # Plains and coastal areas
                elevation = base_elevation + np.random.uniform(0, 800)
            
            # Calculate slope (steeper slopes in hilly areas)
            if elevation > 1000:
                slope = np.random.uniform(15, 45)  # Steep slopes in hills
            elif elevation > 500:
                slope = np.random.uniform(5, 25)   # Moderate slopes
            else:
                slope = np.random.uniform(0, 15)   # Gentle slopes in plains
            
            # Calculate aspect (random direction)
            aspect = np.random.uniform(0, 360)
            
            # Calculate terrain ruggedness index (TRI)
            tri = slope * 0.3 + np.random.uniform(0, 5)
            
            dem_data.append({
                'mine_id': idx + 1,
                'mine_name': mine_name,
                'latitude': lat,
                'longitude': lon,
                'elevation_m': round(elevation, 2),
                'slope_degrees': round(slope, 2),
                'aspect_degrees': round(aspect, 2),
                'terrain_ruggedness_index': round(tri, 2),
                'data_source': 'synthetic_srtm'
            })
        
        dem_df = pd.DataFrame(dem_data)
        
        # Save DEM data
        dem_path = self.env_data_dir / "dem_data.csv"
        dem_df.to_csv(dem_path, index=False)
        logger.info(f"DEM data saved to {dem_path}")
        
        return dem_df
    
    def generate_synthetic_geological_data(self, mines_df):
        """Generate synthetic geological stability data"""
        logger.info("Generating synthetic geological data...")
        
        geological_data = []
        
        # Geological stability factors by mineral type
        stability_factors = {
            'Granite': {'stability': 0.8, 'fracture_density': 0.3},
            'Limestone': {'stability': 0.6, 'fracture_density': 0.5},
            'Iron Ore': {'stability': 0.7, 'fracture_density': 0.4},
            'Marble': {'stability': 0.75, 'fracture_density': 0.35},
            'Sandstone': {'stability': 0.5, 'fracture_density': 0.6},
            'Silica Sand': {'stability': 0.4, 'fracture_density': 0.7},
            'Sand': {'stability': 0.3, 'fracture_density': 0.8},
            'Salt': {'stability': 0.9, 'fracture_density': 0.2}
        }
        
        for idx, mine in mines_df.iterrows():
            mineral_type = mine['mineral_type']
            base_stability = stability_factors.get(mineral_type, {'stability': 0.6, 'fracture_density': 0.5})
            
            # Add location-based variation
            location_factor = np.random.uniform(0.8, 1.2)
            
            geological_data.append({
                'mine_id': idx + 1,
                'mine_name': mine['mine_name'],
                'mineral_type': mineral_type,
                'rock_stability_index': round(base_stability['stability'] * location_factor, 3),
                'fracture_density': round(base_stability['fracture_density'] * location_factor, 3),
                'weathering_index': round(np.random.uniform(0.2, 0.8), 3),
                'joint_spacing_m': round(np.random.uniform(0.5, 5.0), 2),
                'ucs_mpa': round(np.random.uniform(20, 200), 2),  # Unconfined compressive strength
                'data_source': 'synthetic_geological_survey'
            })
        
        geological_df = pd.DataFrame(geological_data)
        
        # Save geological data
        geo_path = self.env_data_dir / "geological_data.csv"
        geological_df.to_csv(geo_path, index=False)
        logger.info(f"Geological data saved to {geo_path}")
        
        return geological_df
    
    def create_integrated_risk_dataset(self, mines_df):
        """Create integrated dataset with all environmental features for ML"""
        logger.info("Creating integrated risk dataset...")
        
        # Generate all environmental data
        rainfall_df = self.generate_synthetic_rainfall_data(mines_df)
        temperature_df = self.generate_synthetic_temperature_data(mines_df)
        dem_df = self.generate_synthetic_dem_data(mines_df)
        geological_df = self.generate_synthetic_geological_data(mines_df)
        
        # Aggregate recent rainfall and temperature data
        recent_rainfall = rainfall_df.groupby('mine_id').agg({
            'rainfall_mm': ['mean', 'max', 'std']
        }).round(2)
        recent_rainfall.columns = ['avg_rainfall_mm', 'max_rainfall_mm', 'rainfall_variability']
        
        recent_temp = temperature_df.groupby('mine_id').agg({
            'avg_temp_c': ['mean', 'max', 'min'],
            'max_temp_c': 'max',
            'min_temp_c': 'min'
        }).round(2)
        recent_temp.columns = ['avg_temp_c', 'max_avg_temp_c', 'min_avg_temp_c', 'extreme_max_temp_c', 'extreme_min_temp_c']
        
        # Merge all datasets
        integrated_df = mines_df.copy()
        integrated_df['mine_id'] = range(1, len(integrated_df) + 1)
        integrated_df = integrated_df.set_index('mine_id')
        
        # Merge environmental data
        integrated_df = integrated_df.join(recent_rainfall)
        integrated_df = integrated_df.join(recent_temp)
        integrated_df = integrated_df.join(dem_df.set_index('mine_id')[['elevation_m', 'slope_degrees', 'aspect_degrees', 'terrain_ruggedness_index']])
        integrated_df = integrated_df.join(geological_df.set_index('mine_id')[['rock_stability_index', 'fracture_density', 'weathering_index', 'joint_spacing_m', 'ucs_mpa']])
        
        # Calculate additional risk features
        integrated_df['rainfall_intensity'] = integrated_df['max_rainfall_mm'] / integrated_df['avg_rainfall_mm']
        integrated_df['temperature_stress'] = (integrated_df['extreme_max_temp_c'] - integrated_df['extreme_min_temp_c']) / 10
        integrated_df['slope_risk_factor'] = np.minimum(integrated_df['slope_degrees'] / 45, 1.0)  # Normalize to 0-1
        integrated_df['geological_risk'] = (1 - integrated_df['rock_stability_index']) * integrated_df['fracture_density']
        
        # Calculate composite environmental risk score (0-1)
        integrated_df['environmental_risk_score'] = (
            integrated_df['slope_risk_factor'] * 0.3 +
            integrated_df['geological_risk'] * 0.3 +
            integrated_df['rainfall_intensity'] * 0.2 +
            integrated_df['temperature_stress'] * 0.1 +
            integrated_df['weathering_index'] * 0.1
        ).round(3)
        
        integrated_df = integrated_df.reset_index()
        
        # Save integrated dataset
        risk_dataset_path = self.processed_dir / "risk_dataset.csv"
        integrated_df.to_csv(risk_dataset_path, index=False)
        logger.info(f"Integrated risk dataset saved to {risk_dataset_path}")
        
        # Generate feature summary
        feature_summary = {
            'total_mines': len(integrated_df),
            'features': list(integrated_df.columns),
            'numerical_features': list(integrated_df.select_dtypes(include=[np.number]).columns),
            'categorical_features': list(integrated_df.select_dtypes(include=['object']).columns),
            'risk_score_stats': {
                'mean': float(integrated_df['environmental_risk_score'].mean()),
                'std': float(integrated_df['environmental_risk_score'].std()),
                'min': float(integrated_df['environmental_risk_score'].min()),
                'max': float(integrated_df['environmental_risk_score'].max())
            },
            'data_sources': {
                'rainfall': 'synthetic_imd',
                'temperature': 'synthetic_era5',
                'elevation': 'synthetic_srtm',
                'geological': 'synthetic_geological_survey'
            },
            'processing_date': datetime.now().isoformat()
        }
        
        summary_path = self.env_data_dir / "feature_summary.json"
        with open(summary_path, 'w') as f:
            json.dump(feature_summary, f, indent=2)
        
        logger.info(f"Feature summary saved to {summary_path}")
        logger.info(f"Created integrated dataset with {len(integrated_df)} mines and {len(integrated_df.columns)} features")
        
        return integrated_df
    
    def visualize_data_distribution(self, integrated_df):
        """Create visualizations of the environmental data distribution"""
        logger.info("Creating data distribution visualizations...")
        
        # Create visualization directory
        viz_dir = self.env_data_dir / "visualizations"
        viz_dir.mkdir(exist_ok=True)
        
        # Plot 1: Risk score distribution
        plt.figure(figsize=(10, 6))
        plt.hist(integrated_df['environmental_risk_score'], bins=20, alpha=0.7, edgecolor='black')
        plt.xlabel('Environmental Risk Score')
        plt.ylabel('Number of Mines')
        plt.title('Distribution of Environmental Risk Scores')
        plt.grid(True, alpha=0.3)
        plt.savefig(viz_dir / "risk_score_distribution.png", dpi=300, bbox_inches='tight')
        plt.close()
        
        # Plot 2: Risk by mineral type
        plt.figure(figsize=(12, 6))
        risk_by_mineral = integrated_df.groupby('mineral_type')['environmental_risk_score'].mean().sort_values(ascending=True)
        risk_by_mineral.plot(kind='barh', color='skyblue', edgecolor='black')
        plt.xlabel('Average Environmental Risk Score')
        plt.title('Average Risk Score by Mineral Type')
        plt.grid(True, alpha=0.3)
        plt.tight_layout()
        plt.savefig(viz_dir / "risk_by_mineral_type.png", dpi=300, bbox_inches='tight')
        plt.close()
        
        # Plot 3: Correlation heatmap of risk factors
        risk_factors = ['slope_degrees', 'rainfall_intensity', 'temperature_stress', 
                       'geological_risk', 'weathering_index', 'environmental_risk_score']
        correlation_matrix = integrated_df[risk_factors].corr()
        
        plt.figure(figsize=(10, 8))
        plt.imshow(correlation_matrix, cmap='coolwarm', aspect='auto', vmin=-1, vmax=1)
        plt.colorbar(label='Correlation Coefficient')
        plt.xticks(range(len(risk_factors)), risk_factors, rotation=45, ha='right')
        plt.yticks(range(len(risk_factors)), risk_factors)
        plt.title('Correlation Matrix of Risk Factors')
        
        # Add correlation values
        for i in range(len(risk_factors)):
            for j in range(len(risk_factors)):
                plt.text(j, i, f'{correlation_matrix.iloc[i, j]:.2f}', 
                        ha='center', va='center', fontsize=8)
        
        plt.tight_layout()
        plt.savefig(viz_dir / "risk_factors_correlation.png", dpi=300, bbox_inches='tight')
        plt.close()
        
        logger.info(f"Visualizations saved to {viz_dir}")

def main():
    """Main execution function"""
    integrator = EnvironmentalDataIntegrator()
    
    # Load cleaned mines data
    mines_csv = integrator.processed_dir / "tamilnadu_mines_clean.csv"
    
    if not mines_csv.exists():
        logger.error(f"Mines data not found at {mines_csv}. Please run data_cleaner.py first.")
        return
    
    mines_df = pd.read_csv(mines_csv)
    logger.info(f"Loaded {len(mines_df)} mines for environmental data integration")
    
    # Create integrated risk dataset
    integrated_df = integrator.create_integrated_risk_dataset(mines_df)
    
    # Create visualizations
    integrator.visualize_data_distribution(integrated_df)
    
    print(f"Environmental data integration completed for {len(integrated_df)} mines.")
    print(f"Integrated dataset saved to: {integrator.processed_dir / 'risk_dataset.csv'}")
    print(f"Environmental data directory: {integrator.env_data_dir}")

if __name__ == "__main__":
    main()