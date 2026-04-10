# 🌙 Somnus: Indirect Sleep Quality Estimation

A professional data analytics web application developed for estimating sleep quality using environmental disturbance sensors (Noise, Vibration, Light, PM2.5). This system integrates real-world feedback from Google Forms with high-frequency sensor data to provide actionable insights into your rest.

## 🚀 Features
- **Real-time Analytics**: Nightly sleep score calculation based on real sensor readings.
- **Google Forms Integration**: Automated ingestion of Bedtime, Wake Time, and Mood logs via CSV.
- **Disturbance Tracking**: 5-minute interval breakdown of noise spikes and light levels.
- **Mood Correlation**: Interactive scatter plots showing how sleep quality directly impacts your 1-5 mood score.
- **ML Model Benchmarking**: Real-world performance metrics (MAE/RMSE) for KNN, Decision Tree, and XGBoost.
- **Feature Importance**: XGBoost analysis on which sensors (e.g. Noise) most significantly impact your specific sleep results.
- **Premium UI**: Modern, glassmorphism-based "Night Theme" using Next.js and Tailwind CSS.

---

## 🛠️ Tech Stack
- **Backend**: FastAPI (Python), PyMySQL, PooledDB.
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Framer Motion, Recharts.
- **Database**: MySQL (hosted on `iot.cpe.ku.ac.th`).
- **ML Engine**: XGBoost, Scikit-learn, Pandas.

---

## 📁 Project Structure
```text
.
├── frontend/                # Next.js Application (Port 3000)
├── sleep_controller.py      # FastAPI Backend API (Port 8001)
├── init_db.py               # Database Schema Initialization
├── ingest_logs.py           # Google Form CSV Ingestor (Mood, Bedtime, Wake Time)
├── calculate_metrics.py     # Real ML Model Training & Analytics Script
├── generate_sample_sensors.py # (Optional) Synthetic Data Generator for Testing
├── config.py                # Database Credentials
└── mood_responses.csv       # Your Google Form Export (Source of truth)
```

---

## 🚦 Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL Access (Credentials in `config.py`)

### 2. Backend & Data Setup
First, install the required Python packages:
```bash
pip install -r requirements.txt
```

Initialize your database tables:
```bash
python3 init_db.py
```

Ingest your Google Form data (Ensure your `mood_responses.csv` is in the root folder):
```bash
python3 ingest_logs.py
```

(Optional) For first-time setup or demo mode, generate correlated sensor data:
```bash
python3 generate_sample_sensors.py
```

Calculate your real ML metrics and feature importance:
```bash
python3 calculate_metrics.py
```

Run the FastAPI server:
```bash
python3 sleep_controller.py
```

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd frontend
npm install
npm run dev
```

The dashboard will be available at [http://localhost:3000](http://localhost:3000).

---

## 🧪 Machine Learning Pipeline
Unlike traditional mock dashboards, Somnus calculates **real** metrics:
1.  It joins your `sensor_readings` with your `sleep_logs` based on the exact bedtime/waketime window.
2.  It trains three regressors (KNN, Decision Tree, XGBoost) to predict your `Mood Score`.
3.  The **Model Comparison** page shows the actual Error (MAE/RMSE) of these models on your data.
4.  The **Feature Importance** chart identifies exactly which environmental factor is the strongest predictor of your morning mood.

---

## ⚖️ License
This project was developed for the DAQ Course: "Indirect Sleep Quality Estimation Using Environmental Disturbance Sensors."