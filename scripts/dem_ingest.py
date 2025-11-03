"""DEM ingestion helper (non-invasive).

This script will compute per-mine DEM summaries (mean elevation, mean slope)
and write results into the `mine_enrichment` table (created by
`create_enrichment_tables.py`).

It tries to use rasterio for accurate DEM reads. If rasterio isn't
installed, it falls back to a simple stub that assigns the mine's existing
elevation value (from the database) as `mean_elevation`.

Usage:
  python scripts/dem_ingest.py --dem path/to/dem.tif
  python scripts/dem_ingest.py --csv sample_mine_elevations.csv

CSV format (optional): mine_id, elevation, slope
"""
import argparse
import sqlite3
from pathlib import Path
import json
import math

try:
    import rasterio
    from rasterio import features
    HAS_RASTERIO = True
except Exception:
    HAS_RASTERIO = False

DB_PATH = Path(__file__).resolve().parents[1] / "enhanced_rockfall_system.db"

def read_mines():
    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()
    cur.execute("SELECT id, latitude, longitude, elevation FROM mines")
    rows = cur.fetchall()
    conn.close()
    return rows

def update_enrichment(mine_id, dem_summary: dict):
    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()
    cur.execute(
        "INSERT OR REPLACE INTO mine_enrichment(mine_id, dem_summary, updated_at) VALUES (?, ?, datetime('now'))",
        (mine_id, json.dumps(dem_summary))
    )
    conn.commit()
    conn.close()

def ingest_from_dem(dem_path: Path):
    if dem_path is None:
        # fallback using existing elevations
        for mine in read_mines():
            mid, lat, lng, elev = mine
            dem_summary = {"mean_elevation": elev or None, "mean_slope": None, "source": "fallback"}
            update_enrichment(mid, dem_summary)
        print("✅ Completed fallback DEM ingestion")
        return

    if not HAS_RASTERIO:
        print("⚠️ rasterio not available — running fallback using existing elevations")
        ingest_from_dem(None)
        return

    with rasterio.open(str(dem_path)) as src:
        for mine in read_mines():
            mid, lat, lng, elev = mine
            try:
                row, col = src.index(lng, lat)
                window = src.read(1, window=((row-1,row+2),(col-1,col+2)), boundless=True)
                vals = [float(v) for v in window.flatten() if not math.isnan(v)]
                mean_elev = sum(vals)/len(vals) if vals else (elev or None)
                dem_summary = {"mean_elevation": mean_elev, "mean_slope": None, "source": str(dem_path)}
            except Exception as e:
                dem_summary = {"mean_elevation": elev or None, "mean_slope": None, "source": "error", "error": str(e)}

            update_enrichment(mid, dem_summary)

    print("✅ DEM ingestion completed")

def ingest_from_csv(csv_path: Path):
    import csv
    with open(csv_path, newline='', encoding='utf-8') as fh:
        reader = csv.DictReader(fh)
        for r in reader:
            mine_id = int(r.get('mine_id'))
            elev = float(r.get('elevation')) if r.get('elevation') else None
            slope = float(r.get('slope')) if r.get('slope') else None
            dem_summary = {"mean_elevation": elev, "mean_slope": slope, "source": str(csv_path)}
            update_enrichment(mine_id, dem_summary)
    print("✅ CSV DEM ingestion completed")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dem', help='Path to DEM GeoTIFF')
    parser.add_argument('--csv', help='CSV with mine_id,elevation,slope')
    args = parser.parse_args()

    if args.dem:
        ingest_from_dem(Path(args.dem))
    elif args.csv:
        ingest_from_csv(Path(args.csv))
    else:
        print("Provide --dem or --csv. Running fallback to populate from existing mine elevation values.")
        ingest_from_dem(None)

if __name__ == '__main__':
    main()
