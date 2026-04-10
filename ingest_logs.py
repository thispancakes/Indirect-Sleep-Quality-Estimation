import csv
import pymysql
from dbutils.pooled_db import PooledDB
from datetime import datetime, timedelta
import os

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

def parse_time(date_str, time_str):
    """
    Combines Date and Time string into a datetime object.
    Handles various time formats like '11:30 PM', '12:00:00 AM', or '23:30'.
    """
    try:
        # Normalize date format (remove leading zeros for strptime)
        dt_str = f"{date_str.strip()} {time_str.strip()}"
        
        formats = [
            "%m/%d/%Y %I:%M:%S %p",
            "%m/%d/%Y %I:%M %p",
            "%d/%m/%Y %I:%M:%S %p",
            "%d/%m/%Y %I:%M %p",
            "%Y-%m-%d %I:%M:%S %p",
            "%Y-%m-%d %I:%M %p",
            "%m/%d/%Y %H:%M",
            "%Y-%m-%d %H:%M"
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(dt_str, fmt)
            except ValueError:
                continue
        return None
    except Exception as e:
        print(f"Error parsing time '{date_str} {time_str}': {e}")
        return None

def ingest_csv(file_path):
    if not os.path.exists(file_path):
        print(f"File {file_path} not found.")
        return

    with open(file_path, mode='r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        with pool.connection() as conn, conn.cursor() as cs:
            rows_processed = 0
            for row in reader:
                # Find columns by partial match
                date_val = next((v for k, v in row.items() if 'Date' in k), None)
                mood_val = next((v for k, v in row.items() if 'Mood' in k), None)
                bed_val = next((v for k, v in row.items() if 'Bedtime' in k), None)
                wake_val = next((v for k, v in row.items() if 'Wake' in k), None)

                if not all([date_val, mood_val, bed_val, wake_val]):
                    continue

                bedtime = parse_time(date_val, bed_val)
                waketime = parse_time(date_val, wake_val)
                
                if bedtime and waketime:
                    if bedtime > waketime:
                        bedtime = bedtime - timedelta(days=1)
                    
                    duration = (waketime - bedtime).total_seconds() / 3600.0
                    
                    query = """
                        INSERT INTO sleep_logs (date, bedtime, wake_time, duration, mood_score)
                        VALUES (STR_TO_DATE(%s, '%%m/%%d/%%Y'), %s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE 
                            bedtime=VALUES(bedtime), 
                            wake_time=VALUES(wake_time), 
                            duration=VALUES(duration), 
                            mood_score=VALUES(mood_score)
                    """
                    try:
                        cs.execute(query, (date_val, bedtime, waketime, duration, mood_val))
                        rows_processed += 1
                        # Update mood_data table
                        db_date = bedtime.date() if bedtime.hour < 12 else (bedtime + timedelta(days=1)).date()
                        cs.execute("""
                            INSERT INTO mood_data (date, mood_score) VALUES (%s, %s)
                            ON DUPLICATE KEY UPDATE mood_score=VALUES(mood_score)
                        """, (db_date, int(mood_val) * 2))
                    except Exception as e:
                        print(f"Failed to insert row for {date_val}: {e}")

            conn.commit()
    print(f"Successfully processed {rows_processed} entries from {file_path}.")

if __name__ == "__main__":
    # Create a dummy CSV for testing if it doesn't exist
    test_csv = "mood_responses.csv"
    if not os.path.exists(test_csv):
        with open(test_csv, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(["Timestamp", "Date", "Mood", "Bedtime", "Wake Time"])
            writer.writerow(["4/6/2024 08:00:00", "4/6/2024", "4", "11:30 PM", "7:30 AM"])
            writer.writerow(["4/7/2024 08:15:00", "4/7/2024", "5", "10:00 PM", "6:00 AM"])
        print(f"Created sample {test_csv}")

    ingest_csv(test_csv)
