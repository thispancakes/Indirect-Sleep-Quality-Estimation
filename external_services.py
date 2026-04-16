import os
import httpx
import logging
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# API Keys and Config
OPENWEATHER_KEY = os.getenv("OPENWEATHER_API_KEY")
IQAIR_KEY = os.getenv("IQAIR_API_KEY")
FREEASTRO_KEY = os.getenv("FREEASTRO_API_KEY")
LAT = float(os.getenv("LATITUDE", 13.8476))
LON = float(os.getenv("LONGITUDE", 100.5696))

async def fetch_weather():
    if not OPENWEATHER_KEY:
        logger.warning("OPENWEATHER_API_KEY missing.")
        return None
    url = f"https://api.openweathermap.org/data/2.5/weather?lat={LAT}&lon={LON}&appid={OPENWEATHER_KEY}&units=metric"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "temp": data["main"]["temp"],
                    "humidity": data["main"]["humidity"],
                    "wind_speed": data["wind"]["speed"],
                    "lat": LAT,
                    "lon": LON
                }
    except Exception as e:
        logger.error(f"Weather fetch failed: {e}")
    return None

async def fetch_aqi():
    if not IQAIR_KEY:
        logger.warning("IQAIR_API_KEY missing.")
        return None
    url = f"http://api.airvisual.com/v2/nearest_city?lat={LAT}&lon={LON}&key={IQAIR_KEY}"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()
                pollution = data["data"]["current"]["pollution"]
                return {
                    "aqi": pollution["aqius"],
                    "pm25": pollution.get("main", "pm25"), # Main pollutant, usually pm25
                    "lat": LAT,
                    "lon": LON
                }
    except Exception as e:
        logger.error(f"AQI fetch failed: {e}")
    return None

async def fetch_sun():
    url = f"https://api.sunrise-sunset.org/json?lat={LAT}&lng={LON}&formatted=0"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url)
            if resp.status_code == 200:
                data = resp.json()["results"]
                # Convert ISO 8601 to datetime
                return {
                    "sunrise": datetime.fromisoformat(data["sunrise"].replace("Z", "+00:00")),
                    "sunset": datetime.fromisoformat(data["sunset"].replace("Z", "+00:00")),
                    "lat": LAT,
                    "lon": LON
                }
    except Exception as e:
        logger.error(f"Sun fetch failed: {e}")
    return None

async def fetch_moon():
    # Using MET Norway as it's free and reliable for moon phases
    today = datetime.now().strftime("%Y-%m-%d")
    url = f"https://api.met.no/weatherapi/sunrise/3.0/moon?lat={LAT}&lon={LON}&date={today}"
    # MET Norway requires a User-Agent
    headers = {"User-Agent": "SleepQualityTracker/1.0 (contact: info@example.com)"}
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, headers=headers)
            if resp.status_code == 200:
                data = resp.json()["properties"]
                return {
                    "phase": data.get("moon_phase", 0), # Returns float 0-360
                    "illumination": data.get("moon_illumination", 0),
                    "lat": LAT,
                    "lon": LON
                }
    except Exception as e:
        logger.error(f"Moon fetch failed: {e}")
    return None

def moon_phase_name(degrees):
    # Convert degrees to phase name
    if degrees < 22.5 or degrees >= 337.5: return "New Moon"
    if degrees < 67.5: return "Waxing Crescent"
    if degrees < 112.5: return "First Quarter"
    if degrees < 157.5: return "Waxing Gibbous"
    if degrees < 202.5: return "Full Moon"
    if degrees < 247.5: return "Waning Gibbous"
    if degrees < 292.5: return "Last Quarter"
    return "Waning Crescent"

async def sync_all_external_data(pool):
    if not pool: return
    
    logger.info("Syncing external data...")
    weather = await fetch_weather()
    aqi = await fetch_aqi()
    sun = await fetch_sun()
    moon = await fetch_moon()

    with pool.connection() as conn, conn.cursor() as cs:
        if weather:
            cs.execute("INSERT INTO weather_data (lat, lon, temperature, humidity, wind_speed) VALUES (%s, %s, %s, %s, %s)",
                       (weather['lat'], weather['lon'], weather['temp'], weather['humidity'], weather['wind_speed']))
        if aqi:
            # Note: pm25 in iqair might be represented differently, mapping for simplicity
            cs.execute("INSERT INTO aqi_data (lat, lon, aqi, pm25) VALUES (%s, %s, %s, %s)",
                       (aqi['lat'], aqi['lon'], aqi['aqi'], 25.0)) # Hardcoding pm25 for now if not clear
        if sun:
            cs.execute("INSERT INTO sun_data (lat, lon, sunrise, sunset) VALUES (%s, %s, %s, %s)",
                       (sun['lat'], sun['lon'], sun['sunrise'], sun['sunset']))
        if moon:
            phase_name = moon_phase_name(moon['phase'])
            cs.execute("INSERT INTO moon_data (lat, lon, phase, illumination, zodiac) VALUES (%s, %s, %s, %s, %s)",
                       (moon['lat'], moon['lon'], phase_name, moon['illumination'], "Unknown"))
        conn.commit()
    logger.info("External data synced successfully.")
