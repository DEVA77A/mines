"""Create non-invasive enrichment tables in the enhanced SQLite DB.

This script is safe to run while the backend is running. It only creates
two helper tables if they don't already exist:

- mine_enrichment(mine_id INTEGER PRIMARY KEY, dem_summary JSON, geology JSON, sensors JSON)
- sensor_readings(id INTEGER PRIMARY KEY AUTOINCREMENT, mine_id INTEGER, timestamp TEXT, payload JSON)

These tables are separate from the existing backend schema so they won't
break or change current API behavior. They store enrichment outputs that
can later be consumed by the backend or analytics pipelines.
"""
import sqlite3
import json
from pathlib import Path

DB_PATH = Path(__file__).resolve().parents[1] / "enhanced_rockfall_system.db"

def create_tables(db_path: Path):
    conn = sqlite3.connect(str(db_path))
    cur = conn.cursor()

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS mine_enrichment (
            mine_id INTEGER PRIMARY KEY,
            dem_summary TEXT,
            geology TEXT,
            sensors TEXT,
            updated_at TEXT DEFAULT (datetime('now'))
        )
        """
    )

    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS sensor_readings_enriched (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            mine_id INTEGER,
            timestamp TEXT,
            payload TEXT
        )
        """
    )

    conn.commit()
    conn.close()
    print(f"✅ Enrichment tables ensured in {db_path}")

if __name__ == "__main__":
    create_tables(DB_PATH)
