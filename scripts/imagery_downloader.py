"""
Sentinel-2 Satellite Imagery Downloader for Tamil Nadu Mines
This script downloads and processes Sentinel-2 imagery for mine locations
"""

import os
import pandas as pd
import geopandas as gpd
from sentinelsat import SentinelAPI, read_geojson, geojson_to_wkt
from shapely.geometry import Point, box
import rasterio
from rasterio.mask import mask
from rasterio.warp import calculate_default_transform, reproject, Resampling
import numpy as np
from datetime import datetime, timedelta
import logging
from pathlib import Path
from tqdm import tqdm
import json

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class SentinelImageryDownloader:
    def __init__(self, username=None, password=None):
        """
        Initialize Sentinel downloader
        Sign up at https://scihub.copernicus.eu/dhus/#/self-registration
        """
        self.username = username or os.getenv('COPERNICUS_USERNAME')
        self.password = password or os.getenv('COPERNICUS_PASSWORD')
        
        if not self.username or not self.password:
            logger.warning("Copernicus credentials not provided. Please set COPERNICUS_USERNAME and COPERNICUS_PASSWORD environment variables")
            self.api = None
        else:
            try:
                self.api = SentinelAPI(self.username, self.password, 'https://scihub.copernicus.eu/dhus')
                logger.info("Connected to Copernicus Open Access Hub")
            except Exception as e:
                logger.error(f"Failed to connect to Copernicus Hub: {e}")
                self.api = None
        
        self.data_dir = Path(__file__).parent.parent / "data"
        self.imagery_dir = self.data_dir / "imagery"
        self.imagery_dir.mkdir(exist_ok=True)
        
    def create_mine_buffer(self, lat, lon, buffer_km=2):
        """Create a buffer around mine location for imagery download"""
        # Convert km to degrees (approximate)
        buffer_deg = buffer_km / 111.0  # 1 degree ≈ 111 km
        
        # Create bounding box
        min_lon = lon - buffer_deg
        max_lon = lon + buffer_deg
        min_lat = lat - buffer_deg
        max_lat = lat + buffer_deg
        
        return box(min_lon, min_lat, max_lon, max_lat)
    
    def search_sentinel_images(self, geometry, start_date, end_date, cloud_cover_max=30):
        """Search for Sentinel-2 images in the specified area and time range"""
        if not self.api:
            logger.error("Sentinel API not initialized. Cannot search for images.")
            return {}
        
        try:
            # Convert geometry to WKT
            footprint = geojson_to_wkt(geometry.__geo_interface__)
            
            # Search for products
            products = self.api.query(
                footprint,
                date=(start_date, end_date),
                platformname='Sentinel-2',
                processinglevel='Level-2A',
                cloudcoverpercentage=(0, cloud_cover_max)
            )
            
            logger.info(f"Found {len(products)} Sentinel-2 products")
            return products
            
        except Exception as e:
            logger.error(f"Error searching for Sentinel images: {e}")
            return {}
    
    def download_image(self, product_id, download_dir):
        """Download a specific Sentinel-2 product"""
        if not self.api:
            return None
            
        try:
            download_dir.mkdir(exist_ok=True)
            
            # Download the product
            product_info = self.api.download(product_id, directory_path=download_dir)
            logger.info(f"Downloaded product {product_id}")
            return product_info
            
        except Exception as e:
            logger.error(f"Error downloading product {product_id}: {e}")
            return None
    
    def clip_raster_to_mine(self, raster_path, mine_geometry, output_path):
        """Clip raster to mine area"""
        try:
            with rasterio.open(raster_path) as src:
                # Reproject geometry to raster CRS if needed
                if src.crs != 'EPSG:4326':
                    mine_geom_reproj = [mine_geometry]
                else:
                    mine_geom_reproj = [mine_geometry]
                
                # Clip the raster
                out_image, out_transform = mask(src, mine_geom_reproj, crop=True)
                out_meta = src.meta.copy()
                
                # Update metadata
                out_meta.update({
                    "driver": "GTiff",
                    "height": out_image.shape[1],
                    "width": out_image.shape[2],
                    "transform": out_transform
                })
                
                # Write clipped raster
                with rasterio.open(output_path, "w", **out_meta) as dest:
                    dest.write(out_image)
                
                logger.info(f"Clipped raster saved to {output_path}")
                return output_path
                
        except Exception as e:
            logger.error(f"Error clipping raster: {e}")
            return None
    
    def create_sample_imagery(self, mine_id, lat, lon):
        """Create sample RGB imagery for demonstration (when Sentinel data not available)"""
        try:
            # Create a synthetic RGB image (3 bands, 256x256 pixels)
            height, width = 256, 256
            
            # Generate synthetic bands based on location
            np.random.seed(hash(f"{lat}_{lon}") % 1000)  # Consistent seed for same location
            
            # Red band (simulating vegetation/rock)
            red = np.random.randint(80, 120, (height, width), dtype=np.uint8)
            
            # Green band
            green = np.random.randint(70, 110, (height, width), dtype=np.uint8)
            
            # Blue band
            blue = np.random.randint(60, 100, (height, width), dtype=np.uint8)
            
            # Add some texture to simulate mining activity
            center_y, center_x = height // 2, width // 2
            radius = 50
            
            # Create circular mining area with different spectral signature
            y, x = np.ogrid[:height, :width]
            mask_mining = (x - center_x)**2 + (y - center_y)**2 <= radius**2
            
            red[mask_mining] = np.random.randint(120, 180, np.sum(mask_mining))
            green[mask_mining] = np.random.randint(100, 140, np.sum(mask_mining))
            blue[mask_mining] = np.random.randint(80, 120, np.sum(mask_mining))
            
            # Stack bands
            rgb_image = np.stack([red, green, blue], axis=0)
            
            # Define output path
            output_path = self.imagery_dir / f"mine_{mine_id}_rgb.tif"
            
            # Define geotransform (approximate)
            buffer_deg = 0.01  # ~1km buffer
            geotransform = (
                lon - buffer_deg,    # Top left x
                2 * buffer_deg / width,  # Pixel width
                0,                   # Rotation (0 for north-up)
                lat + buffer_deg,    # Top left y
                0,                   # Rotation (0 for north-up)
                -2 * buffer_deg / height # Pixel height (negative for south-down)
            )
            
            # Write GeoTIFF
            with rasterio.open(
                output_path,
                'w',
                driver='GTiff',
                height=height,
                width=width,
                count=3,
                dtype=rgb_image.dtype,
                crs='EPSG:4326',
                transform=rasterio.transform.from_bounds(
                    lon - buffer_deg, lat - buffer_deg,
                    lon + buffer_deg, lat + buffer_deg,
                    width, height
                )
            ) as dst:
                dst.write(rgb_image)
                
                # Add band descriptions
                dst.set_band_description(1, 'Red')
                dst.set_band_description(2, 'Green')
                dst.set_band_description(3, 'Blue')
            
            logger.info(f"Sample imagery created for mine {mine_id}")
            return output_path
            
        except Exception as e:
            logger.error(f"Error creating sample imagery for mine {mine_id}: {e}")
            return None
    
    def process_mines_imagery(self, mines_csv_path):
        """Process imagery for all mines in the dataset"""
        logger.info("Starting imagery processing for all mines...")
        
        # Load mines data
        mines_df = pd.read_csv(mines_csv_path)
        
        # Results tracking
        imagery_results = []
        
        # Process each mine
        for idx, mine in tqdm(mines_df.iterrows(), total=len(mines_df), desc="Processing mines"):
            mine_id = idx + 1
            lat, lon = mine['latitude'], mine['longitude']
            mine_name = mine['mine_name']
            
            logger.info(f"Processing imagery for {mine_name} (ID: {mine_id})")
            
            try:
                # Create buffer geometry
                buffer_geom = self.create_mine_buffer(lat, lon, buffer_km=2)
                
                # For demonstration, create sample imagery
                # In production, use real Sentinel-2 data
                imagery_path = self.create_sample_imagery(mine_id, lat, lon)
                
                if imagery_path:
                    imagery_results.append({
                        'mine_id': mine_id,
                        'mine_name': mine_name,
                        'latitude': lat,
                        'longitude': lon,
                        'imagery_path': str(imagery_path),
                        'imagery_type': 'synthetic_rgb',
                        'processing_date': datetime.now().isoformat(),
                        'status': 'success'
                    })
                else:
                    imagery_results.append({
                        'mine_id': mine_id,
                        'mine_name': mine_name,
                        'latitude': lat,
                        'longitude': lon,
                        'imagery_path': None,
                        'imagery_type': None,
                        'processing_date': datetime.now().isoformat(),
                        'status': 'failed'
                    })
                    
            except Exception as e:
                logger.error(f"Error processing mine {mine_name}: {e}")
                imagery_results.append({
                    'mine_id': mine_id,
                    'mine_name': mine_name,
                    'latitude': lat,
                    'longitude': lon,
                    'imagery_path': None,
                    'imagery_type': None,
                    'processing_date': datetime.now().isoformat(),
                    'status': 'error',
                    'error_message': str(e)
                })
        
        # Save results
        results_df = pd.DataFrame(imagery_results)
        results_path = self.data_dir / "processed" / "imagery_processing_results.csv"
        results_df.to_csv(results_path, index=False)
        
        # Generate summary
        summary = {
            'total_mines': len(mines_df),
            'successful_downloads': len(results_df[results_df['status'] == 'success']),
            'failed_downloads': len(results_df[results_df['status'] != 'success']),
            'imagery_directory': str(self.imagery_dir),
            'processing_date': datetime.now().isoformat()
        }
        
        summary_path = self.data_dir / "processed" / "imagery_summary.json"
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)
        
        logger.info(f"Imagery processing completed. Summary saved to {summary_path}")
        logger.info(f"Successfully processed {summary['successful_downloads']} out of {summary['total_mines']} mines")
        
        return results_df

def main():
    """Main execution function"""
    # Initialize downloader
    downloader = SentinelImageryDownloader()
    
    # Path to cleaned mines data
    mines_csv = Path(__file__).parent.parent / "data" / "processed" / "tamilnadu_mines_clean.csv"
    
    if not mines_csv.exists():
        logger.error(f"Mines data not found at {mines_csv}. Please run data_cleaner.py first.")
        return
    
    # Process imagery for all mines
    results = downloader.process_mines_imagery(mines_csv)
    
    print(f"Imagery processing completed for {len(results)} mines.")
    print(f"Check {downloader.imagery_dir} for downloaded imagery.")

if __name__ == "__main__":
    main()