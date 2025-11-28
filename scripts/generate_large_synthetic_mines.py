"""
Generate a large synthetic `tamilnadu_mines_clean.csv` suitable for demonstration/training.
This script expands the existing sample patterns to create N synthetic mines within Tamil Nadu bounds.
"""
import pandas as pd
import numpy as np
from pathlib import Path

def generate_large_mines(n=10000, out_path=None):
    np.random.seed(42)
    districts = ['Krishnagiri','Salem','Dharmapuri','Vellore','Tiruvannamalai','Cuddalore','Perambalur',
                 'Ariyalur','Karur','Dindigul','Madurai','Theni','Virudhunagar','Tuticorin','Tirunelveli',
                 'Kanyakumari','Coimbatore','Erode','Namakkal','Tiruppur']
    minerals = ['Granite','Limestone','Iron Ore','Marble','Sandstone','Silica Sand','Sand','Salt']
    statuses = ['Active','Closed']

    # Tamil Nadu bounds
    min_lat, max_lat = 8.0, 13.5
    min_lon, max_lon = 76.0, 80.5

    rows = []
    for i in range(n):
        district = np.random.choice(districts)
        mineral = np.random.choice(minerals)
        status = np.random.choice(statuses, p=[0.9, 0.1])
        lease_area = max(1.0, np.random.exponential(scale=40.0))
        lat = np.random.uniform(min_lat, max_lat)
        lon = np.random.uniform(min_lon, max_lon)
        mine_name = f"Mine_{i+1:05d}"

        rows.append({
            'mine_name': mine_name,
            'district': district,
            'mineral_type': mineral,
            'lease_area_ha': round(lease_area, 2),
            'latitude': round(lat, 6),
            'longitude': round(lon, 6),
            'status': status
        })

    df = pd.DataFrame(rows)
    if out_path:
        out_path = Path(out_path)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(out_path, index=False)
        print(f"Saved {len(df)} synthetic mines to: {out_path}")
    return df

if __name__ == '__main__':
    out = Path(__file__).parent.parent / 'data' / 'processed' / 'tamilnadu_mines_clean.csv'
    generate_large_mines(n=10000, out_path=out)
