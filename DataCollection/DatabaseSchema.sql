CREATE TABLE sensor_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    light INT,               -- 0–4095

    temperature FLOAT,
    humidity FLOAT,

    pm1_0 INT,
    pm2_5 INT,
    pm10 INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE disturbance_data (
    id INT AUTO_INCREMENT PRIMARY KEY,

    noise_count INT,
    vibration_count INT,

    sound_peak INT,
    sound_baseline INT,
    sound_last INT,
    sound_delta INT,

    vibration_stuck BOOLEAN,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE weather_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lat FLOAT NOT NULL,
    lon FLOAT NOT NULL,
    temperature FLOAT,
    humidity FLOAT,
    wind_speed FLOAT,
    wind_direction FLOAT,
    ts DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_weather_time (ts),
    INDEX idx_weather_location (lat, lon)
);

CREATE TABLE aqi_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lat FLOAT NOT NULL,
    lon FLOAT NOT NULL,
    aqi INT,
    pm25 FLOAT,
    ts DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_aqi_time (ts),
    INDEX idx_aqi_location (lat, lon)
);

CREATE TABLE sun_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lat FLOAT NOT NULL,
    lon FLOAT NOT NULL,
    sunrise DATETIME,
    sunset DATETIME,
    ts DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_sun_time (ts),
    INDEX idx_sun_location (lat, lon)
);

CREATE TABLE moon_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    lat FLOAT NOT NULL,
    lon FLOAT NOT NULL,
    phase VARCHAR(50),
    illumination FLOAT,
    age FLOAT,
    zodiac VARCHAR(20),
    ts DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_moon_time (ts),
    INDEX idx_moon_location (lat, lon)
);