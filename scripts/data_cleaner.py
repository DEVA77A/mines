"""
Tamil Nadu Mines Data Preparation Script
This script cleans and validates mine location data for Tamil Nadu, India
"""

import pandas as pd
import geopandas as gpd
from shapely.geometry import Point, Polygon
import numpy as np
import requests
import json
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class TamilNaduMinesCleaner:
    def __init__(self):
        self.tn_boundary = None
        self.data_dir = Path(__file__).parent.parent / "data"
        self.raw_dir = self.data_dir / "raw"
        self.processed_dir = self.data_dir / "processed"
        
        # Tamil Nadu approximate bounds for initial filtering
        self.tn_bounds = {
            'min_lat': 8.0,
            'max_lat': 13.5,
            'min_lon': 76.0,
            'max_lon': 80.5
        }
        
    def load_tamil_nadu_boundary(self):
        """Load Tamil Nadu state boundary for coordinate validation"""
        try:
            # Create a rough polygon for Tamil Nadu (in real scenario, use official boundary data)
            tn_coords = [
                (76.2, 8.0), (76.8, 8.1), (77.6, 8.4), (78.1, 8.7), (78.8, 9.0),
                (79.5, 9.5), (80.2, 10.0), (80.3, 10.8), (80.1, 11.5), (79.8, 12.0),
                (79.4, 12.8), (78.8, 13.2), (78.0, 13.4), (77.2, 13.3), (76.8, 12.8),
                (76.5, 12.0), (76.3, 11.0), (76.2, 10.0), (76.2, 8.0)
            ]
            self.tn_boundary = Polygon(tn_coords)
            logger.info("Tamil Nadu boundary loaded successfully")
        except Exception as e:
            logger.error(f"Error loading Tamil Nadu boundary: {e}")
            
    def create_sample_data(self):
        """Create sample Tamil Nadu mines dataset"""
        sample_data = {
            'mine_name': [
                'Hosur Granite Quarry', 'Salem Limestone Mine', 'Dharmapuri Iron Ore',
                'Krishnagiri Marble Mine', 'Vellore Sandstone Quarry', 'Tiruvannamalai Granite',
                'Cuddalore Silica Sand', 'Perambalur Limestone', 'Ariyalur Limestone',
                'Karur Granite Quarry', 'Dindigul Granite Mine', 'Madurai Limestone',
                'Theni Granite Quarry', 'Virudhunagar Sand Mine', 'Tuticorin Salt Mine',
                'Tirunelveli Limestone', 'Kanyakumari Sand Mine', 'Coimbatore Granite',
                'Erode Limestone Mine', 'Namakkal Granite Quarry'
            ],
            'district': [
                'Krishnagiri', 'Salem', 'Dharmapuri', 'Krishnagiri', 'Vellore',
                'Tiruvannamalai', 'Cuddalore', 'Perambalur', 'Ariyalur', 'Karur',
                'Dindigul', 'Madurai', 'Theni', 'Virudhunagar', 'Tuticorin',
                'Tirunelveli', 'Kanyakumari', 'Coimbatore', 'Erode', 'Namakkal'
            ],
            'mineral_type': [
                'Granite', 'Limestone', 'Iron Ore', 'Marble', 'Sandstone',
                'Granite', 'Silica Sand', 'Limestone', 'Limestone', 'Granite',
                'Granite', 'Limestone', 'Granite', 'Sand', 'Salt',
                'Limestone', 'Sand', 'Granite', 'Limestone', 'Granite'
            ],
            'lease_area_ha': [
                25.5, 45.2, 120.8, 15.3, 35.7, 28.9, 55.4, 78.3, 92.1, 32.6,
                41.8, 67.5, 29.4, 18.7, 145.6, 89.3, 22.1, 38.9, 73.2, 26.8
            ],
            'latitude': [
                12.1265, 11.6643, 12.1357, 12.5265, 12.9165, 12.2304, 11.7593,
                11.2396, 11.1574, 10.9601, 10.3624, 9.9252, 10.0127, 9.5915,
                8.7642, 8.7269, 8.0883, 11.0168, 11.3410, 11.2189
            ],
            'longitude': [
                77.8315, 78.1460, 78.1593, 78.2115, 79.1325, 79.0747, 79.7593,
                78.8875, 79.2748, 78.1374, 77.9824, 78.1198, 77.4765, 77.9463,
                78.1348, 77.7567, 77.5385, 76.9558, 77.7172, 78.1677
            ],
            'status': [
                'Active', 'Active', 'Active', 'Closed', 'Active', 'Active', 'Active',
                'Active', 'Active', 'Active', 'Active', 'Closed', 'Active', 'Active',
                'Active', 'Active', 'Active', 'Active', 'Closed', 'Active'
            ]
        }
        
        # Add some problematic data points for cleaning demonstration
        sample_data['mine_name'].extend(['Sea Mine Error', 'Outside TN Mine'])
        sample_data['district'].extend(['Kanyakumari', 'Unknown'])
        sample_data['mineral_type'].extend(['Salt', 'Granite'])
        sample_data['lease_area_ha'].extend([50.0, 30.0])
        sample_data['latitude'].extend([7.5, 14.5])  # One in sea, one outside TN
        sample_data['longitude'].extend([78.0, 79.0])
        sample_data['status'].extend(['Active', 'Active'])
        
        df = pd.DataFrame(sample_data)
        return df
        
    def clean_coordinates(self, df):
        """Clean and validate mine coordinates"""
        logger.info("Starting coordinate cleaning...")
        
        original_count = len(df)
        cleaned_df = df.copy()
        
        # Remove rows with invalid coordinates
        cleaned_df = cleaned_df.dropna(subset=['latitude', 'longitude'])
        
        # Basic bounds checking
        cleaned_df = cleaned_df[
            (cleaned_df['latitude'] >= self.tn_bounds['min_lat']) &
            (cleaned_df['latitude'] <= self.tn_bounds['max_lat']) &
            (cleaned_df['longitude'] >= self.tn_bounds['min_lon']) &
            (cleaned_df['longitude'] <= self.tn_bounds['max_lon'])
        ]
        
        # Create GeoDataFrame for spatial operations
        geometry = [Point(xy) for xy in zip(cleaned_df['longitude'], cleaned_df['latitude'])]
        gdf = gpd.GeoDataFrame(cleaned_df, geometry=geometry, crs='EPSG:4326')
        
        # Filter points within Tamil Nadu boundary
        if self.tn_boundary:
            gdf = gdf[gdf.geometry.within(self.tn_boundary)]
        
        cleaned_count = len(gdf)
        removed_count = original_count - cleaned_count
        
        logger.info(f"Removed {removed_count} invalid coordinate records")
        logger.info(f"Retained {cleaned_count} valid records")
        
        return gdf.drop('geometry', axis=1)
    
    def validate_mine_data(self, df):
        """Validate and clean mine data"""
        logger.info("Validating mine data...")
        
        # Clean mine names
        df['mine_name'] = df['mine_name'].str.strip().str.title()
        
        # Standardize mineral types
        mineral_mapping = {
            'granite': 'Granite',
            'limestone': 'Limestone',
            'iron ore': 'Iron Ore',
            'marble': 'Marble',
            'sandstone': 'Sandstone',
            'silica sand': 'Silica Sand',
            'sand': 'Sand',
            'salt': 'Salt'
        }
        
        df['mineral_type'] = df['mineral_type'].str.lower().map(mineral_mapping).fillna(df['mineral_type'])
        
        # Validate lease area (should be positive)
        df = df[df['lease_area_ha'] > 0]
        
        # Standardize status
        df['status'] = df['status'].str.capitalize()
        
        logger.info("Mine data validation completed")
        return df
    
    def add_derived_features(self, df):
        """Add derived features for ML model"""
        logger.info("Adding derived features...")
        
        # Add mine size categories
        df['size_category'] = pd.cut(
            df['lease_area_ha'],
            bins=[0, 20, 50, 100, float('inf')],
            labels=['Small', 'Medium', 'Large', 'Very Large']
        )
        
        # Add risk factors based on mineral type (example weights)
        risk_weights = {
            'Granite': 0.7, 'Limestone': 0.5, 'Iron Ore': 0.8, 'Marble': 0.6,
            'Sandstone': 0.4, 'Silica Sand': 0.3, 'Sand': 0.2, 'Salt': 0.1
        }
        
        df['mineral_risk_factor'] = df['mineral_type'].map(risk_weights).fillna(0.5)
        
        # Add elevation proxy (rough estimation based on location)
        # In real scenario, this would come from DEM data
        df['estimated_elevation'] = 500 + (df['latitude'] - 10) * 100 + np.random.normal(0, 50, len(df))
        df['estimated_elevation'] = np.maximum(df['estimated_elevation'], 0)
        
        logger.info("Derived features added successfully")
        return df
    
    def process_dataset(self):
        """Main processing pipeline"""
        logger.info("Starting Tamil Nadu mines data processing...")
        
        # Load Tamil Nadu boundary
        self.load_tamil_nadu_boundary()
        
        # Create sample dataset (in real scenario, load from IBM/Bhukosh/NGDR)
        df = self.create_sample_data()
        
        # Save original dataset
        original_path = self.raw_dir / "tamilnadu_mines.csv"
        df.to_csv(original_path, index=False)
        logger.info(f"Original dataset saved to {original_path}")
        
        # Clean coordinates
        df_clean = self.clean_coordinates(df)
        
        # Validate mine data
        df_clean = self.validate_mine_data(df_clean)
        
        # Add derived features
        df_clean = self.add_derived_features(df_clean)
        
        # Save cleaned dataset
        clean_path = self.processed_dir / "tamilnadu_mines_clean.csv"
        df_clean.to_csv(clean_path, index=False)
        logger.info(f"Cleaned dataset saved to {clean_path}")
        
        # Generate summary report
        self.generate_summary_report(df, df_clean)
        
        return df_clean
    
    def generate_summary_report(self, original_df, cleaned_df):
        """Generate data cleaning summary report"""
        report = {
            'original_records': len(original_df),
            'cleaned_records': len(cleaned_df),
            'records_removed': len(original_df) - len(cleaned_df),
            'removal_percentage': ((len(original_df) - len(cleaned_df)) / len(original_df)) * 100,
            'districts_count': cleaned_df['district'].nunique(),
            'mineral_types': cleaned_df['mineral_type'].value_counts().to_dict(),
            'active_mines': len(cleaned_df[cleaned_df['status'] == 'Active']),
            'closed_mines': len(cleaned_df[cleaned_df['status'] == 'Closed']),
            'total_lease_area': cleaned_df['lease_area_ha'].sum(),
            'avg_lease_area': cleaned_df['lease_area_ha'].mean()
        }
        
        report_path = self.processed_dir / "data_cleaning_report.json"
        with open(report_path, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Summary report saved to {report_path}")
        logger.info(f"Processing complete: {report['cleaned_records']} clean records from {report['original_records']} original records")

def main():
    """Main execution function"""
    cleaner = TamilNaduMinesCleaner()
    cleaned_data = cleaner.process_dataset()
    print(f"Data cleaning completed. {len(cleaned_data)} records processed.")
    print(f"Cleaned data saved to: {cleaner.processed_dir / 'tamilnadu_mines_clean.csv'}")

if __name__ == "__main__":
    main()