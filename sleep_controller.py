from db_manager import get_db_pool
from fastapi import FastAPI, HTTPException, BackgroundTasks
from external_services import sync_all_external_data
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from math import log

pool = get_db_pool(max_connections=2)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Sleep Quality Analytics API",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class SleepScore(BaseModel):
    date: str
    duration: float  # hours
    disturbance: float # 0-100
    quality: float    # 0-100

class DisturbanceData(BaseModel):
    time: str
    noise: int
    vibration: int
    light: float
    pm25: float
    pm10: float
    humidity: float

class MoodCorrelation(BaseModel):
    date: str
    sleep_quality: float
    mood_score: int

class WeeklySummary(BaseModel):
    avg_quality: float
    avg_disturbance: float
    avg_mood: float
    dates: List[str]

class ModelMetric(BaseModel):
    model_name: str
    mae: float
    rmse: float

class FeatureImportance(BaseModel):
    feature: str
    importance: float

class ExternalWeather(BaseModel):
    temp: float
    humidity: float
    wind_speed: float
    location: str
    timestamp: str

class ExternalAQI(BaseModel):
    aqi: int
    pm25: float
    timestamp: str

class ExternalSun(BaseModel):
    sunrise: str
    sunset: str
    timestamp: str

class ExternalMoon(BaseModel):
    phase: str
    illumination: float
    zodiac: str
    timestamp: str

class ExternalDataResponse(BaseModel):
    weather: Optional[ExternalWeather]
    aqi: Optional[ExternalAQI]
    sun: Optional[ExternalSun]
    moon: Optional[ExternalMoon]

# Helper functions for real analytics logic
def calculate_sleep_stats(date_str, cursor=None):
    """
    Real analytics logic to aggregate sensor data for a specific date.
    Queries sensor_readings and disturbance_data for the sleep window.
    """
    if not pool:
        return 0.0, 0.0, 0.0

    if cursor:
        return _perform_stats_query(cursor, date_str)
    
    with pool.connection() as conn, conn.cursor() as cs:
        return _perform_stats_query(cs, date_str)

def _perform_stats_query(cs, date_str):
        # 1. Get sleep window from logs
        cs.execute("SELECT bedtime, wake_time, duration FROM sleep_logs WHERE date=%s", [date_str])
        log = cs.fetchone()
        
        if log:
            start_time, end_time, duration = log
        else:
            # Fallback window: 10 PM yesterday to 7 AM today
            dt_today = datetime.strptime(date_str, "%Y-%m-%d")
            start_time = dt_today - timedelta(hours=2) # 10 PM
            end_time = dt_today + timedelta(hours=7)   # 7 AM
            duration = 9.0

        # 2. Query sensor data (Light & PM2.5)
        cs.execute("""
            SELECT AVG(light), AVG(pm2_5) 
            FROM sensor_readings 
            WHERE created_at BETWEEN %s AND %s
        """, [start_time, end_time])
        avg_light, avg_pm25 = cs.fetchone()
        avg_light = avg_light or 0
        avg_pm25 = avg_pm25 or 0

        # 3. Query disturbance data (Noise & Vibration)
        cs.execute("""
            SELECT SUM(noise_count), SUM(vibration_count), MAX(sound_peak)
            FROM disturbance_data
            WHERE created_at BETWEEN %s AND %s
        """, [start_time, end_time])
        noise, vib, peak = cs.fetchone()
        noise = noise or 0
        vib = vib or 0
        peak = peak or 0

        # 4. Compute Scores
        # Baseline Quality Score starts at 100
        # Duration factor: Target 7-9 hours. -10 pts per hour deficit.
        dur_penalty = max(0, (7.0 - duration) * 12) if duration < 7.0 else 0
        
        # light/pm/disturbance penalties
        light_pen = min(25, (float(avg_light) / 1000) * 25)
        pm_pen = min(15, (float(avg_pm25) / 50) * 15)
        dist_pen = min(60, (float(noise) * 0.4) + (float(vib) * 2) + (float(peak) / 500) * 10)

        quality = 100 - dist_pen - light_pen - pm_pen - dur_penalty
        
        return round(duration, 1), round(dist_pen, 1), round(max(0, min(100, quality)), 1)

def adc_analog_to_lux(rows: list, index: int):
    for row in rows:
        light = row[index] # raw analog reading, approximately 1000 times less than voltage reading
        Va = float(light / (1000 * 5)) # 5 is picked approximate number cause sensor is different from kidbright one
        Rldr = Va * (33000 / (3.3 - Va))
        Rr = log((Rldr/1000), 10)
        Ll = ((Rr-3)/(-1-3))*(4-(-1)) + -1
        Lux = 10**Ll
        row[index] = Lux

@app.get("/sleep-score", response_model=List[SleepScore])
def get_sleep_scores():
    if not pool: return []
    with pool.connection() as conn, conn.cursor() as cs:
        cs.execute("SELECT date FROM sleep_logs ORDER BY date ASC")
        days = [r[0].strftime("%Y-%m-%d") for r in cs.fetchall()]
    
        results = []
        for d in days:
            dur, dist, qual = calculate_sleep_stats(d, cs)
            results.append(SleepScore(date=d, duration=dur, disturbance=dist, quality=qual))
        return results

@app.get("/disturbance-timeline/{date}", response_model=List[DisturbanceData])
def get_disturbance_timeline(date: str):
    if not pool: return []

    with pool.connection() as conn, conn.cursor() as cs:
        cs.execute("SELECT bedtime, wake_time FROM sleep_logs WHERE date=%s", [date])
        log = cs.fetchone()
        start, end = log if log else (
            datetime.strptime(date, "%Y-%m-%d") - timedelta(hours=2),
            datetime.strptime(date, "%Y-%m-%d") + timedelta(hours=7)
        )

        # Robust query: Join on a shared time bucket
        # We use a subquery to get all unique buckets within the window
        query = """
            SELECT 
                bucket,
                AVG(noise)    as noise,
                AVG(vib)      as vib,
                AVG(light)    as light,
                AVG(pm25)     as pm25,
                AVG(pm10)     as pm10,
                AVG(humidity) as humidity
            FROM (
                SELECT x.bucket as bucket, noise, vib, light, pm25, pm10, humidity 
                FROM
                (SELECT FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(created_at) / 300) * 300) as bucket,
                       noise_count as noise, vibration_count as vib
                FROM disturbance_data WHERE created_at BETWEEN %s AND %s) x
                JOIN
                (SELECT FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(created_at) / 300) * 300) as bucket,
                       light as light,
                       COALESCE(pm2_5, 0) as pm25,
                       COALESCE(pm10, 0)  as pm10,
                       COALESCE(humidity, 0) as humidity
                FROM sensor_readings WHERE created_at BETWEEN %s AND %s) y
                ON x.bucket = y.bucket
            ) combined
            GROUP BY bucket
            ORDER BY bucket ASC
        """
        cs.execute(query, [start, end, start, end])
        rows = [list(row) for row in cs.fetchall()]
        
    adc_analog_to_lux(rows, 3) # sensor reading to lux

    return [DisturbanceData(
        time=t.strftime("%H:%M") if hasattr(t, 'strftime') else str(t)[11:16],
        noise=int(n or 0),
        vibration=int(v or 0),
        light=int(l or 0),
        pm25=round(float(pm25 or 0), 2),
        pm10=round(float(pm10 or 0), 2),
        humidity=round(float(hum or 0), 1),
    ) for t, n, v, l, pm25, pm10, hum in rows]

@app.get("/mood-correlation", response_model=List[MoodCorrelation])
def get_mood_correlation():
    if not pool:
        return []

    with pool.connection() as conn, conn.cursor() as cs:
        # Join sleep_logs and mood_data (or just use sleep_logs if it has both)
        cs.execute("""
            SELECT date, duration, mood_score 
            FROM sleep_logs 
            ORDER BY date DESC LIMIT 14
        """)
        rows = cs.fetchall()
        
        data = []
        for d, dur, mood in rows:
            # Re-calculate quality for each date
            _, _, qual = calculate_sleep_stats(d.strftime("%Y-%m-%d"), cs)
            data.append(MoodCorrelation(
                date=d.strftime("%Y-%m-%d"), 
                sleep_quality=qual, 
                mood_score=mood or 0
            ))
        return data

@app.get("/weekly-summary", response_model=WeeklySummary)
def get_weekly_summary():
    # Return averages for the last 7 days
    scores = get_sleep_scores()
    moods = get_mood_correlation()[:7]
    
    avg_qual = sum(s.quality for s in scores) / 7
    avg_dist = sum(s.disturbance for s in scores) / 7
    avg_mood = sum(m.mood_score for m in moods) / 7
    
    return WeeklySummary(
        avg_quality=round(avg_qual, 1),
        avg_disturbance=round(avg_dist, 1),
        avg_mood=round(avg_mood, 1),
        dates=[s.date for s in scores]
    )

class EnvironmentImpactData(BaseModel):
    day: str
    aqi: float
    temp: float
    sleep: float

@app.get("/environment-impact", response_model=List[EnvironmentImpactData])
def get_environment_impact():
    if not pool:
        return []
    
    with pool.connection() as conn, conn.cursor() as cs:
        # Get last 7 days of sleep scores and average sensor data
        cs.execute("""
            SELECT l.date, l.duration, m.mood_score
            FROM sleep_logs l
            LEFT JOIN mood_data m ON l.date = m.date
            ORDER BY l.date DESC LIMIT 7
        """)
        logs = cs.fetchall()
        
        data = []
        for d, dur, mood in reversed(logs):
            # Calculate scores for that day (reuse the current connection pool/cursor)
            _, _, qual = calculate_sleep_stats(d.strftime("%Y-%m-%d"), cs)
            
            # Use a fresh cursor but same connection if needed, though cs works fine
            cs.execute("SELECT AVG(pm2_5), AVG(temperature) FROM sensor_readings WHERE DATE(created_at) = %s", [d])
            avg_pm, avg_temp = cs.fetchone()
            
            data.append(EnvironmentImpactData(
                day=d.strftime("%a"),
                aqi=round(float(avg_pm or 0), 1),
                temp=round(float(avg_temp or 0), 1),
                sleep=round(qual, 1)
            ))
    return data
@app.get("/model-comparison", response_model=List[ModelMetric])
def get_model_comparison():
    if not pool:
        return []
    
    with pool.connection() as conn, conn.cursor() as cs:
        cs.execute("SELECT model_name, mae, rmse FROM model_metrics ORDER BY mae ASC")
        rows = cs.fetchall()
        
    if not rows:
        return []

    return [ModelMetric(
        model_name=n, 
        mae=round(m, 2), 
        rmse=round(r, 2)
    ) for n, m, r in rows]

@app.get("/feature-importance", response_model=List[FeatureImportance])
def get_feature_importance():
    if not pool:
        return []
    
    with pool.connection() as conn, conn.cursor() as cs:
        cs.execute("SELECT feature_name, importance_score FROM feature_importance ORDER BY importance_score DESC")
        rows = cs.fetchall()
        
    if not rows:
        return []

    return [FeatureImportance(feature=n, importance=round(s, 4)) for n, s in rows]

@app.get("/api/external-data", response_model=ExternalDataResponse)
def get_external_data():
    if not pool:
        return ExternalDataResponse(weather=None, aqi=None, sun=None, moon=None)

    res = {}
    with pool.connection() as conn, conn.cursor() as cs:
        # 1. Weather
        cs.execute("SELECT temperature, humidity, wind_speed, ts FROM weather_data ORDER BY ts DESC LIMIT 1")
        row = cs.fetchone()
        if row:
            res['weather'] = ExternalWeather(
                temp=row[0], 
                humidity=row[1], 
                wind_speed=row[2], 
                location="Bangkok, Thailand",
                timestamp=str(row[3])
            )
        
        # 2. AQI
        cs.execute("SELECT aqi, pm25, ts FROM aqi_data ORDER BY ts DESC LIMIT 1")
        row = cs.fetchone()
        if row:
            res['aqi'] = ExternalAQI(aqi=row[0], pm25=row[1], timestamp=str(row[2]))

        # 3. Sun
        cs.execute("SELECT sunrise, sunset, ts FROM sun_data ORDER BY ts DESC LIMIT 1")
        row = cs.fetchone()
        if row:
            res['sun'] = ExternalSun(
                sunrise=row[0].strftime("%H:%M") if hasattr(row[0], 'strftime') else str(row[0]),
                sunset=row[1].strftime("%H:%M") if hasattr(row[1], 'strftime') else str(row[1]),
                timestamp=str(row[2])
            )

        # 4. Moon
        cs.execute("SELECT phase, illumination, zodiac, ts FROM moon_data ORDER BY ts DESC LIMIT 1")
        row = cs.fetchone()
        if row:
            res['moon'] = ExternalMoon(phase=row[0], illumination=row[1], zodiac=row[2], timestamp=str(row[3]))

    return ExternalDataResponse(
        weather=res.get('weather'),
        aqi=res.get('aqi'),
        sun=res.get('sun'),
        moon=res.get('moon')
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
