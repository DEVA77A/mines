#!/usr/bin/env python3
"""
Tamil Nadu Rockfall Risk Prediction System - Simple Database Setup
"""

import sys
import os
import random
from datetime import datetime, timedelta
from pathlib import Path

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

try:
    from backend.database import SessionLocal, engine, Base, Mine
    print("✅ Database imports successful")
except ImportError as e:
    print(f"❌ Database import failed: {e}")
    sys.exit(1)

def create_sample_mines():
    """Create sample mine data"""
    districts = ['Salem', 'Dharmapuri', 'Krishnagiri', 'Tiruvannamalai', 'Vellore']
    mine_types = ['Granite', 'Limestone', 'Sandstone', 'Iron Ore', 'Marble']

    mines_data = []

    for i in range(1, 21):  # Create 20 sample mines
        district = random.choice(districts)
        mine_type = random.choice(mine_types)

        # Generate coordinates within Tamil Nadu
        lat = 8.0 + random.random() * 5.0
        lon = 76.0 + random.random() * 6.0

        # Generate basic data
        elevation = 200 + random.random() * 1000
        rainfall = 400 + random.random() * 1200
        temperature = 22 + random.random() * 12
        humidity = 50 + random.random() * 40
        wind_speed = 3 + random.random() * 12
        geological_stability = 0.1 + random.random() * 0.9

        # Calculate risk score
        risk_score = (
            min(elevation / 1000, 1.0) * 0.15 +
            min(rainfall / 2000, 1.0) * 0.20 +
            min(abs(temperature - 25) / 15, 1.0) * 0.10 +
            (humidity / 100) * 0.10 +
            min(wind_speed / 20, 1.0) * 0.10 +
            geological_stability * 0.25
        )

        # Determine risk level
        if risk_score < 0.3:
            risk_level = 'Low'
        elif risk_score < 0.6:
            risk_level = 'Medium'
        elif risk_score < 0.8:
            risk_level = 'High'
        else:
            risk_level = 'Critical'

        status = random.choice(['Active', 'Suspended', 'Closed'])

        mine = {
            'mine_id': f'mine_{i:03d}',
            'mine_name': f'{mine_type} Quarry {i}',
            'district': district,
            'mine_type': mine_type,
            'latitude': lat,
            'longitude': lon,
            'elevation': elevation,
            'status': status,
            'geological_data': {
                'rock_type': mine_type,
                'slope_angle_deg': 15 + random.random() * 45,
                'soil_depth_m': 0.5 + random.random() * 4.5,
                'water_table_depth_m': 2 + random.random() * 18,
                'fault_lines_nearby': random.choice([True, False]),
                'historical_slides': random.randint(0, 5)
            },
            'environmental_factors': {
                'rainfall_mm': rainfall,
                'temperature_avg_c': temperature,
                'humidity_percent': humidity,
                'wind_speed_kmh': wind_speed,
                'geological_stability': geological_stability
            },
            'sensor_data': {
                'displacement_mm': random.random() * 10,
                'strain_rate': random.random() * 5,
                'pore_pressure': 100 + random.random() * 200,
                'temperature_c': temperature,
                'humidity': humidity,
                'vibration_frequency': random.random() * 50,
                'crack_width_mm': random.random() * 5,
                'x_tilt': (random.random() - 0.5) * 10,
                'y_tilt': (random.random() - 0.5) * 10
            },
            'dem_data': {
                'resolution_m': 1.0,
                'last_updated': datetime.now().isoformat()
            },
            'drone_imagery': {
                'last_flight': (datetime.now() - timedelta(days=random.randint(1, 30))).isoformat(),
                'coverage_percent': 80 + random.random() * 20
            },
            'operational_data': {
                'daily_production_tonnes': 50 + random.random() * 950,
                'active_workers': random.randint(10, 200),
                'machinery_count': random.randint(2, 15),
                'safety_incidents_last_year': random.randint(0, 8)
            },
            'risk_assessment': {
                'risk_score': risk_score,
                'risk_level': risk_level,
                'last_assessment': datetime.now().isoformat(),
                'next_assessment': (datetime.now() + timedelta(days=30)).isoformat()
            }
        }

        mines_data.append(mine)

    return mines_data

def main():
    """Main setup function"""
    print("🚀 Setting up Tamil Nadu Rockfall Risk Prediction Database...")
    print("=" * 60)

    try:
        # Create tables
        print("📋 Creating database tables...")
        Base.metadata.create_all(bind=engine)
        print("✅ Tables created successfully")

        # Create session
        db = SessionLocal()

        try:
            # Create sample mines
            print("🏭 Creating sample mines...")
            mines_data = create_sample_mines()
            for mine_data in mines_data:
                mine = Mine(**mine_data)
                db.add(mine)
            print(f"✅ Created {len(mines_data)} sample mines")

            # Commit changes
            print("💾 Committing changes to database...")
            db.commit()
            print("✅ All data committed successfully")

        except Exception as e:
            print(f"❌ Error during data creation: {e}")
            db.rollback()
            raise
        finally:
            db.close()

        print("\n🎉 Database setup complete!")
        print("=" * 60)
        print("📊 Database Summary:")
        print(f"   • Mines: {len(mines_data)}")
        print("\n🚀 Ready to start the application!")

    except Exception as e:
        print(f"❌ Database setup failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()