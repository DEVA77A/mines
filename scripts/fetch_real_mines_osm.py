import requests
import pandas as pd
import json
from pathlib import Path
import time

def fetch_osm_mines():
    print("🌍 Fetching real mine/quarry locations from OpenStreetMap (Overpass API)...")
    
    # Overpass QL query for quarries in Tamil Nadu
    # We look for landuse=quarry or man_made=mineshaft
    overpass_url = "http://overpass-api.de/api/interpreter"
    overpass_query = """
    [out:json][timeout:60];
    area["name"="Tamil Nadu"]->.searchArea;
    (
      node["landuse"="quarry"](area.searchArea);
      way["landuse"="quarry"](area.searchArea);
      relation["landuse"="quarry"](area.searchArea);
      node["man_made"="mineshaft"](area.searchArea);
    );
    out center;
    """
    
    try:
        response = requests.get(overpass_url, params={'data': overpass_query})
        response.raise_for_status()
        data = response.json()
        
        elements = data.get('elements', [])
        print(f"✅ Found {len(elements)} potential mine locations.")
        
        mines = []
        for i, el in enumerate(elements):
            lat = el.get('lat')
            lon = el.get('lon')
            
            # For ways/relations, 'center' provides lat/lon
            if not lat or not lon:
                center = el.get('center', {})
                lat = center.get('lat')
                lon = center.get('lon')
            
            if not lat or not lon:
                continue
                
            tags = el.get('tags', {})
            name = tags.get('name', f"Unknown Quarry {i+1}")
            mineral = tags.get('resource', 'Granite') # Default to Granite if unknown
            
            # Clean up name
            if "Quarry" not in name and "Mine" not in name:
                name = f"{name} Quarry"
            
            mines.append({
                "mine_name": name,
                "district": "Tamil Nadu", # We'd need a geocoder for exact district, will default for now
                "mineral_type": mineral,
                "lease_area_ha": 10.0, # Placeholder
                "latitude": lat,
                "longitude": lon,
                "status": "Active"
            })
            
        if not mines:
            print("⚠️ No mines found via API.")
            return None
            
        df = pd.DataFrame(mines)
        
        # Save
        out_path = Path(__file__).parent.parent / 'data' / 'processed' / 'real_mines_osm.csv'
        out_path.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(out_path, index=False)
        print(f"💾 Saved {len(df)} real mine locations to {out_path}")
        return df
        
    except Exception as e:
        print(f"❌ Error fetching OSM data: {e}")
        return None

if __name__ == "__main__":
    fetch_osm_mines()
