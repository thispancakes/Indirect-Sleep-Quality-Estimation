import pymysql
import random
from datetime import datetime, timedelta
from dbutils.pooled_db import PooledDB
try:
    from config import DB_HOST, DB_USER, DB_PASSWD, DB_NAME
    pool = PooledDB(creator=pymysql,
                   host=DB_HOST,
                   user=DB_USER,
                   password=DB_PASSWD,
                   database=DB_NAME,
                   maxconnections=1,
                   blocking=True)
except ImportError:
    print("Error: config.py not found.")
    exit(1)

def generate_sample_sensors():
    """
    Generates realistic sensor data that correlates with the sleep_logs 
    so that ML models have something to learn from.
    """
    with pool.connection() as conn, conn.cursor() as cs:
        # Get all log dates
        cs.execute("SELECT date, bedtime, wake_time, mood_score FROM sleep_logs")
        logs = cs.fetchall()
        
        if not logs:
            print("No sleep logs found. Please run ingest_logs.py first.")
            return

        print(f"Generating sensor data for {len(logs)} nights...")
        
        for date, bedtime, waketime, mood in logs:
            # Generate readings every 10 minutes during the sleep window
            current = bedtime
            while current <= waketime:
                # Correlate sensor values with mood (higher mood = better environment)
                # Light: 0-1000 (Lower is better for sleep/mood)
                light = max(0, random.gauss(50 - (mood*2), 10)) 
                temp = random.gauss(24 - (mood/10), 0.5)
                pm25 = max(5, random.gauss(30 - (mood*2), 5))
                
                cs.execute("""
                    INSERT INTO sensor_readings (light, temperature, pm2_5, created_at)
                    VALUES (%s, %s, %s, %s)
                """, (light, temp, pm25, current))
                
                # Disturbance Data
                # Noise count: Higher mood = fewer noise peaks
                noise = int(max(0, random.gauss(20 - mood, 5)))
                vib = int(max(0, random.random() - 0.7)) if mood < 5 else 0
                peak = random.gauss(400 - (mood*30), 50)
                
                cs.execute("""
                    INSERT INTO disturbance_data (noise_count, vibration_count, sound_peak, created_at)
                    VALUES (%s, %s, %s, %s)
                """, (noise, vib, peak, current))
                
                current += timedelta(minutes=10)
        
        conn.commit()
    print("Successfully generated correlated sensor data for ML training.")

if __name__ == "__main__":
    generate_sample_sensors()
