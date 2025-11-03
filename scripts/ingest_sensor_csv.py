"""Ingest sensor CSV into enrichment sensor_readings_enriched table.

CSV expected columns: mine_id,timestamp_iso,payload_json

This is a simple ingest script that writes raw sensor payloads into the
`sensor_readings_enriched` table created by `create_enrichment_tables.py`.
"""
import argparse
import sqlite3
from pathlib import Path
import json

DB_PATH = Path(__file__).resolve().parents[1] / "enhanced_rockfall_system.db"

def ingest_csv(csv_path: Path):
    import csv
    conn = sqlite3.connect(str(DB_PATH))
    cur = conn.cursor()
    with open(csv_path, newline='', encoding='utf-8') as fh:
        reader = csv.DictReader(fh)
        for r in reader:
            mine_id = int(r.get('mine_id'))
            timestamp = r.get('timestamp_iso') or None
            payload = r.get('payload_json') or '{}'
            # validate payload is json
            try:
                js = json.loads(payload)
            except Exception:
                js = {"raw": payload}

            cur.execute(
                "INSERT INTO sensor_readings_enriched(mine_id, timestamp, payload) VALUES (?, ?, ?)",
                (mine_id, timestamp, json.dumps(js))
            )

    conn.commit()
    conn.close()
    print(f"✅ Ingested sensor CSV into {DB_PATH}")

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('csv', help='CSV file to ingest')
    args = parser.parse_args()
    ingest_csv(Path(args.csv))

if __name__ == '__main__':
    main()
