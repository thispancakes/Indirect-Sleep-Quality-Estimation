import pymysql
from dbutils.pooled_db import PooledDB
from config import DB_HOST, DB_USER, DB_PASSWD, DB_NAME
from datetime import datetime, timedelta
import random

pool = PooledDB(creator=pymysql,
               host=DB_HOST,
               user=DB_USER,
               password=DB_PASSWD,
               database=DB_NAME,
               maxconnections=1,
               blocking=True)

def init_db():
    with pool.connection() as conn, conn.cursor() as cs:
        # 1. Create mood_data table
        cs.execute("""
            CREATE TABLE IF NOT EXISTS mood_data (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date DATE UNIQUE,
                mood_score INT, -- 1-10
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 2. Create model_metrics table
        cs.execute("""
            CREATE TABLE IF NOT EXISTS model_metrics (
                id INT AUTO_INCREMENT PRIMARY KEY,
                model_name VARCHAR(50) UNIQUE,
                mae FLOAT,
                rmse FLOAT
            )
        """)

        # 3. Create feature_importance table
        cs.execute("""
            CREATE TABLE IF NOT EXISTS feature_importance (
                id INT AUTO_INCREMENT PRIMARY KEY,
                feature_name VARCHAR(50) UNIQUE,
                importance_score FLOAT
            )
        """)

        # 4. Create sleep_logs table (for Google Form Bedtime/Wake Time)
        cs.execute("""
            CREATE TABLE IF NOT EXISTS sleep_logs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date DATE UNIQUE,
                bedtime DATETIME,
                wake_time DATETIME,
                duration FLOAT, -- hours
                mood_score INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 5. Create sensor_readings table (from DatabaseSchema.sql)
        cs.execute("""
            CREATE TABLE IF NOT EXISTS sensor_readings (
                id INT AUTO_INCREMENT PRIMARY KEY,
                light FLOAT,
                temperature FLOAT,
                humidity FLOAT,
                pm1_0 FLOAT,
                pm2_5 FLOAT,
                pm10 FLOAT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # 6. Create disturbance_data table (from DatabaseSchema.sql)
        cs.execute("""
            CREATE TABLE IF NOT EXISTS disturbance_data (
                id INT AUTO_INCREMENT PRIMARY KEY,
                noise_count INT,
                vibration_count INT,
                sound_peak FLOAT,
                sound_baseline FLOAT,
                sound_last FLOAT,
                sound_delta FLOAT,
                vibration_stuck INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        conn.commit()
    print("Database schema initialized successfully. Ready for sensor data and logs.")

if __name__ == "__main__":
    init_db()
