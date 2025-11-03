"""Geology ingestion helper (non-invasive).

This script assigns geology attributes to mines and stores results in the
`mine_enrichment` table. It supports two modes:
 - GeoJSON polygon file (requires shapely & fiona) — assigns dominant rock type
   for the mine location.
 - CSV mapping (mine_id, rock_type) — simple import.

If GIS libs are not available the script falls back to CSV-only import.
"""
import argparse
import sqlite3
from pathlib import Path
import json

try:
    from shapely.geometry import shape, Point
    import fiona
    HAS_GIS = True
except Exception:
    HAS_GIS = False

DB_PATH = Path(__file__).resolve().parents[1] / "enhanced_rockfall_system.db"

def read_mines_coords():
    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()
    cur.execute("SELECT id, latitude, longitude FROM mines")
    rows = cur.fetchall()
    conn.close()
    return rows

def upsert_geology(mine_id, geology_obj: dict):
    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()
    # existing enrichment
    cur.execute("SELECT dem_summary, geology, sensors FROM mine_enrichment WHERE mine_id = ?", (mine_id,))
    row = cur.fetchone()
    if row:
        dem_json, geology_json, sensors_json = row
        dem_json = dem_json or 'null'
        sensors_json = sensors_json or 'null'
    else:
        dem_json = None
        sensors_json = None

    cur.execute(
        "INSERT OR REPLACE INTO mine_enrichment(mine_id, dem_summary, geology, sensors, updated_at) VALUES (?, ?, ?, ?, datetime('now'))",
        (mine_id, dem_json, json.dumps(geology_obj), sensors_json)
    )
    conn.commit()
    conn.close()

def ingest_geojson(geojson_path: Path):
    if not HAS_GIS:
        print("⚠️ GIS libs (shapely/fiona) not available — cannot ingest GeoJSON.")
        return

    # load polygons
    with fiona.open(str(geojson_path)) as src:
        features = list(src)

    mines = read_mines_coords()
    for mid, lat, lng in mines:
        pt = Point(lng, lat)
        found = None
        for feat in features:
            geom = shape(feat['geometry'])
            props = feat.get('properties', {})
            if geom.contains(pt):
                found = props
                break

        geology_obj = found or {"rock_type": None, "source": str(geojson_path)}
        upsert_geology(mid, geology_obj)

    print("✅ GeoJSON geology ingestion completed")

def ingest_csv(csv_path: Path):
    import csv
    with open(csv_path, newline='', encoding='utf-8') as fh:
        reader = csv.DictReader(fh)
        for r in reader:
            mid = int(r.get('mine_id'))
            rock = r.get('rock_type')
            geology_obj = {"rock_type": rock, "source": str(csv_path)}
            upsert_geology(mid, geology_obj)

    print("✅ CSV geology ingestion completed")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--geojson', help='Path to geology GeoJSON (polygons)')
    parser.add_argument('--csv', help='CSV with mine_id,rock_type')
    args = parser.parse_args()

    if args.geojson:
        ingest_geojson(Path(args.geojson))
    elif args.csv:
        ingest_csv(Path(args.csv))
    else:
        print('Provide --geojson or --csv to import geology data')

if __name__ == '__main__':
    main()
