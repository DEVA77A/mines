import asyncio
import pandas as pd
import numpy as np
from pathlib import Path
from backend.mongo_config import MongoDB
from scipy.spatial import cKDTree

# District Centers (Approximate)
DISTRICTS = {
    "Chennai": (13.0827, 80.2707),
    "Coimbatore": (11.0168, 76.9558),
    "Madurai": (9.9252, 78.1198),
    "Tiruchirappalli": (10.7905, 78.7047),
    "Salem": (11.6643, 78.1460),
    "Tirunelveli": (8.7139, 77.7567),
    "Erode": (11.3410, 77.7172),
    "Vellore": (12.9165, 79.1325),
    "Thoothukudi": (8.7642, 78.1348),
    "Dindigul": (10.3673, 77.9803),
    "Thanjavur": (10.7870, 79.1378),
    "Ranipet": (12.9296, 79.3324),
    "Virudhunagar": (9.5680, 77.9624),
    "Karur": (10.9601, 78.1374),
    "Nilgiris": (11.4102, 76.6950),
    "Krishnagiri": (12.5186, 78.2137),
    "Kanyakumari": (8.0883, 77.5385),
    "Cuddalore": (11.7480, 79.7714),
    "Dharmapuri": (12.1211, 78.1582),
    "Tiruvannamalai": (12.2253, 79.0747)
}

def get_nearest_district(lat, lon):
    names = list(DISTRICTS.keys())
    coords = list(DISTRICTS.values())
    
    # Simple Euclidean distance (good enough for this scale)
    distances = [((lat - c[0])**2 + (lon - c[1])**2) for c in coords]
    min_idx = distances.index(min(distances))
    return names[min_idx]

async def update_database():
    print("🚀 Starting Database Update with REAL OSM Data...")
    
    # 1. Load Real Data
    csv_path = Path(__file__).parent.parent / 'data' / 'processed' / 'real_mines_osm.csv'
    if not csv_path.exists():
        print("❌ Real data CSV not found!")
        return
        
    df = pd.read_csv(csv_path)
    print(f"📄 Loaded {len(df)} mines from CSV.")
    
    # 2. Connect to DB
    mongo = MongoDB()
    mongo.connect()
    db = mongo.db
    
    # 3. Clear existing mines
    await db.mines.delete_many({})
    print("🗑️  Cleared existing synthetic mines.")
    
    # 4. Prepare new documents
    new_mines = []
    for i, row in df.iterrows():
        lat = row['latitude']
        lon = row['longitude']
        district = get_nearest_district(lat, lon)
        
        mine_doc = {
            "id": i + 1,
            "name": row['mine_name'],
            "district": district,
            "type": row['mineral_type'] if pd.notna(row['mineral_type']) else "Granite",
            "status": "Active",
            "latitude": lat,
            "longitude": lon,
            "location": {
                "type": "Point",
                "coordinates": [lon, lat] # GeoJSON is [lon, lat]
            },
            "risk_level": "Low", # Initial default
            "risk_score": 0.1,
            "safety_score": 0.9,
            "production_capacity": 1000.0,
            "elevation": 0, # Will be updated if we had DEM data
            "slope_angle": np.random.uniform(10, 60), # Simulated slope for risk calc
            "last_updated": None,
            "image_url": f"https://picsum.photos/seed/{i}/400/300",
            "description": f"Real quarry located in {district} district."
        }
        new_mines.append(mine_doc)
        
    # 5. Insert
    if new_mines:
        await db.mines.insert_many(new_mines)
        print(f"✅ Successfully inserted {len(new_mines)} REAL mines into MongoDB.")
    
    mongo.close()

if __name__ == "__main__":
    asyncio.run(update_database())
