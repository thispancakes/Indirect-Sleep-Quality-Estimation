import numpy as np
import pandas as pd
from sklearn.neighbors import KNeighborsRegressor
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import LeaveOneOut
import xgboost as xgb
from db_manager import get_db_pool

pool = get_db_pool(max_connections=1)

def get_training_data():
    with pool.connection() as conn:
        # Load logs
        logs = pd.read_sql("SELECT date, bedtime, wake_time, duration, mood_score FROM sleep_logs", conn)
        if logs.empty:
            return pd.DataFrame()

        # Load sensors and disturbances
        sensors = pd.read_sql("SELECT light, temperature, humidity, pm1_0, pm2_5, pm10, created_at FROM sensor_readings", conn)
        disturbances = pd.read_sql("SELECT noise_count, vibration_count, sound_peak, created_at FROM disturbance_data", conn)

        # Feature engineering per night
        features = []
        for _, log in logs.iterrows():
            start, end = log['bedtime'], log['wake_time']

            # Filter sensors for this exact sleep window
            day_sensors = sensors[(sensors['created_at'] >= start) & (sensors['created_at'] <= end)]
            day_dist = disturbances[(disturbances['created_at'] >= start) & (disturbances['created_at'] <= end)]

            if day_sensors.empty and day_dist.empty:
                continue

            feat = {
                'duration':          log['duration'],
                'avg_light':         day_sensors['light'].mean()        if not day_sensors.empty else 0,
                'avg_temp':          day_sensors['temperature'].mean()  if not day_sensors.empty else 0,
                'avg_humidity':      day_sensors['humidity'].mean()     if not day_sensors.empty else 0,
                'avg_pm1':           day_sensors['pm1_0'].mean()        if not day_sensors.empty else 0,
                'avg_pm25':          day_sensors['pm2_5'].mean()        if not day_sensors.empty else 0,
                'avg_pm10':          day_sensors['pm10'].mean()         if not day_sensors.empty else 0,
                'noise_peaks':       day_dist['noise_count'].sum()      if not day_dist.empty else 0,
                'vibration_spikes':  day_dist['vibration_count'].sum()  if not day_dist.empty else 0,
                'sound_peak':        day_dist['sound_peak'].max()       if not day_dist.empty else 0,
                # Target is the real 1-5 mood score — no scaling
                'target':            int(log['mood_score'])
            }
            features.append(feat)

        return pd.DataFrame(features)

def train_and_save():
    df = get_training_data()

    if df.empty or len(df) < 4:
        print("Not enough real data to train models (need ≥4 nights with sensor readings).")
        return

    print(f"Training on {len(df)} real nights. Target range: {df['target'].min()}–{df['target'].max()} (mood 1-5)")

    X = df.drop(columns=['target'])
    y = df['target']

    # Use Leave-One-Out CV — robust for small datasets (15 nights)
    loo = LeaveOneOut()

    models = {
        'KNN':           KNeighborsRegressor(n_neighbors=min(3, len(X) - 1)),
        'Decision Tree': DecisionTreeRegressor(max_depth=3, random_state=42),
        'Random Forest': RandomForestRegressor(n_estimators=100, max_depth=3, random_state=42),
        'XGBoost':       xgb.XGBRegressor(objective='reg:squarederror', n_estimators=50,
                                           max_depth=3, learning_rate=0.1, random_state=42,
                                           verbosity=0),
    }

    results = []
    for model_name, model in models.items():
        y_true, y_pred = [], []
        for train_idx, test_idx in loo.split(X):
            X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
            y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
            model.fit(X_train, y_train)
            y_pred.append(float(model.predict(X_test)[0]))
            y_true.append(float(y_test.iloc[0]))

        mae  = mean_absolute_error(y_true, y_pred)
        rmse = np.sqrt(mean_squared_error(y_true, y_pred))
        results.append((model_name, mae, rmse))
        print(f"  {model_name}: MAE={mae:.4f}  RMSE={rmse:.4f}")

    # Fit XGBoost on all data for feature importance
    xgb_model = models['XGBoost']
    xgb_model.fit(X, y)

    # Save Metrics
    with pool.connection() as conn, conn.cursor() as cs:
        # Clear old entries so a fresh run always reflects the latest
        cs.execute("DELETE FROM model_metrics")
        for name, mae, rmse in results:
            cs.execute("""
                INSERT INTO model_metrics (model_name, mae, rmse)
                VALUES (%s, %s, %s)
            """, (name, float(mae), float(rmse)))

        # Save Feature Importance (XGBoost on full data)
        cs.execute("DELETE FROM feature_importance")
        importance = xgb_model.feature_importances_
        readable_names = {
            'duration':         'Duration',
            'avg_light':        'Avg Light',
            'avg_temp':         'Avg Temp',
            'avg_humidity':     'Avg Humidity',
            'avg_pm1':          'Avg PM1.0',
            'avg_pm25':         'Avg PM2.5',
            'avg_pm10':         'Avg PM10',
            'noise_peaks':      'Noise Peaks',
            'vibration_spikes': 'Vibration Spikes',
            'sound_peak':       'Sound Peak',
        }
        for col, score in zip(X.columns, importance):
            name = readable_names.get(col, col.replace('_', ' ').title())
            cs.execute("""
                INSERT INTO feature_importance (feature_name, importance_score)
                VALUES (%s, %s)
            """, (name, float(score)))

        conn.commit()

    best = min(results, key=lambda r: r[1])
    print(f"\nBest model: {best[0]} (MAE={best[1]:.4f})")
    print("Metrics saved to database.")

if __name__ == "__main__":
    train_and_save()
