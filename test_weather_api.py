import asyncio
import httpx

async def test_weather():
    lat = 11.6643
    lon = 78.1460
    print(f"Testing Open-Meteo API for Salem ({lat}, {lon})...")
    
    try:
        async with httpx.AsyncClient() as client:
            url = "https://api.open-meteo.com/v1/forecast"
            params = {
                "latitude": lat,
                "longitude": lon,
                "current": "temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,precipitation,weather_code",
                "timezone": "auto"
            }
            response = await client.get(url, params=params, timeout=10.0)
            print(f"Status Code: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print("Data received:")
                print(data['current'])
            else:
                print("Error response:", response.text)
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_weather())
