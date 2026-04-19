# 🌙 Indirect Sleep Quality Estimation

**Project Title**: Indirect Sleep Quality Estimation Using Environmental Disturbance Sensors
**Affiliation**: Department of Computer Engineering, Faculty of Engineering, Kasetsart University


A data analytics web application estimating sleep quality using environmental disturbance sensors (Noise, Vibration, Light, PM2.5). The system integrates real-world mood feedback from Google Forms with high-frequency sensor data and applies machine learning to identify behavioural patterns.

---

## Team Members
- **Member 1**: Tat Tanprasert 6710545636
- **Member 2**: Peraya Leangsongchai 6710545776
- **Affiliation**: Department of Computer Engineering, Faculty of Engineering, Kasetsart University
<br>[Team Photo](./team_member_photo/)
---

## 📽️ Presentation
**Slides**: [Project_slide.pdf](./Project_slide.pdf)

---

## Features

- **Sleep Quality Scoring**: Nightly score (0–100) computed from actual sensor readings during your exact bedtime–wake window.
- **Google Forms Integration**: Automated ingestion of Bedtime, Wake Time, and 1–5 Mood Score logs via CSV export.
- **Disturbance Tracking**: 5-minute interval breakdown of noise peaks, vibration spikes, and ambient light.
- **Mood Correlation**: Scatter plot of sleep quality vs. morning mood score (1–5 scale).
- **ML Model Benchmarking**: 3 models evaluated with **Leave-One-Out CV** on real data — KNN, Decision Tree, XGBoost.
- **Feature Importance**: XGBoost analysis showing which sensor (light, noise, PM2.5, etc.) most impacts your specific sleep results.
- **External Data**: Hourly weather, AQI, sunrise/sunset, and moon phase via external APIs.
- **Premium UI**: Glassmorphism dark-theme dashboard in Next.js with Recharts and Framer Motion.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Backend API** | FastAPI (Python 3.9+), Uvicorn |
| **Frontend** | Next.js 16 (App Router), Tailwind CSS v4, Framer Motion, Recharts |
| **Database** | MySQL 8.0+ (Remote host `iot.cpe.ku.ac.th`) |
| **ML Engine** | scikit-learn (KNN, Decision Tree), XGBoost, Pandas, NumPy |
| **External APIs** | OpenWeatherMap, IQAir, Sunrise-Sunset.org, MET Norway (moon) |
| **Testing** | Playwright (E2E, runs against live dev server) |

---

## Project Structure

```text
.
├── frontend/                    # Next.js App (Port 3000)
│   ├── src/app/
│   │   ├── dashboard/page.tsx   # Sleep overview + quality trend (all dates)
│   │   ├── analysis/page.tsx    # Night-level sensor breakdown
│   │   ├── mood/page.tsx        # Mood vs sleep correlation scatter
│   │   ├── environment/page.tsx # PM2.5 & temperature vs sleep
│   │   ├── models/page.tsx      # ML model benchmarks
│   │   └── external/page.tsx   # Live weather / AQI / moon data
│   └── tests/                   # Playwright E2E tests
├── sleep_controller.py          # FastAPI backend (Port 8001)
├── calculate_metrics.py         # ML training + feature importance (runs offline)
├── ingest_logs.py               # CSV → MySQL ingestor (mood_responses.csv)
├── init_db.py                   # Creates all DB tables
├── external_services.py         # Async fetchers for weather/AQI/sun/moon
├── generate_sample_sensors.py   # (Dev only) fills sensor data gaps from sleep_logs
├── db_manager.py                # Shared PooledDB connection factory
├── config.py                    # DB credentials (not committed)
├── config_example.py            # Template for config.py
├── requirements.txt             # All Python dependencies
└── mood_responses.csv           # Google Form CSV export (source of truth)
```

---

## Getting Started

### 1. Prerequisites
- Python 3.9+
- Node.js 18+
- MySQL credentials (copy `config_example.py` → `config.py`)

### 2. Python Setup

```bash
pip install -r requirements.txt
```

### 3. Data Pipeline (run once, in order)

```bash
# 1. Create all DB tables
python3 init_db.py

# 2. Ingest your Google Form CSV export
python3 ingest_logs.py

# 3. Train ML models and save metrics (requires ≥4 nights with sensor data)
python3 calculate_metrics.py
```

### 4. Run the Backend API

```bash
python3 sleep_controller.py
# → API available at http://localhost:8001
# → Docs at http://localhost:8001/docs
```

### 5. Run the Frontend

```bash
cd frontend
npm install
npm run dev
# → Dashboard at http://localhost:3000/dashboard
```

---

## Sleep Quality Score Formula

The score (0–100) is computed per night from actual sensor readings within your bedtime–wake window:

```
Quality = 100 − duration_penalty − light_penalty − pm25_penalty − disturbance_penalty
```

| Component | Source | Cap |
|---|---|---|
| Duration penalty | `(7.0 − duration) × 12` if < 7 hrs | — |
| Light penalty | `(avg_lux / 1000) × 25` | 25 pts |
| PM2.5 penalty | `(avg_pm2.5 / 50) × 15` | 15 pts |
| Disturbance penalty | `noise×0.4 + vib×2 + (peak/500)×10` | 60 pts |

---

## Machine Learning Pipeline

Models are evaluated using **Leave-One-Out cross-validation** (appropriate for the small 15-night dataset). The target variable is your real **1–5 morning mood score** from Google Forms.

| Model | MAE | RMSE |
|---|---|---|
| XGBoost | 0.34 | 0.55 |
| Decision Tree | 0.63 | 0.94 |
| KNN | 0.67 | 0.80 |

Re-run `calculate_metrics.py` any time new log entries are added to update metrics.

---

## Running Tests

```bash
cd frontend
npx playwright install   # first time only
npm run test:e2e
```

Tests cover: page headings, metric card visibility, Recharts rendering, and navigation between all 5 routes.

---

## License

Developed for the DAQ module: *"Indirect Sleep Quality Estimation Using Environmental Disturbance Sensors."*