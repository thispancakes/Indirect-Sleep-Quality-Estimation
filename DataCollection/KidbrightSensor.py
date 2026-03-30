from machine import Pin, ADC, UART
import dht
import time
import json
import network
import config
from umqtt.simple import MQTTClient

# -------- STATUS LED --------
wifi_led = Pin(2, Pin.OUT)
status_led = Pin(12, Pin.OUT)

# -------- WIFI --------
ssid = config.WIFI_SSID
password = config.WIFI_PASS

wifi = network.WLAN(network.STA_IF)
wifi.active(True)

def connect_wifi():
    if not wifi.isconnected():
        print("Connecting WiFi...")
        wifi_led.value(1)

        wifi.connect(ssid, password)

        while not wifi.isconnected():
            time.sleep(1)

        print("WiFi connected:", wifi.ifconfig())
        wifi_led.value(0)

def ensure_wifi():
    if not wifi.isconnected():
        connect_wifi()

# -------- MQTT --------
mqtt_server = "iot.cpe.ku.ac.th"
mqtt_port = 1883
client_id = "b6710545776"

topic_sensor = b"b6710545776/envi"
topic_disturbance = b"b6710545776/disturbance"

def connect_mqtt():
    client = MQTTClient(
        client_id,
        mqtt_server,
        mqtt_port,
        config.MQTT_USER,
        config.MQTT_PASS,
        keepalive=600
    )
    client.connect()
    print("MQTT connected")
    return client

def ensure_mqtt():
    global mqtt
    try:
        mqtt.publish(b"ping", b"1")
    except:
        print("Reconnecting MQTT...")
        mqtt = connect_mqtt()

# -------- LED HELPERS --------
def blink_status(times=1, delay=0.2):
    for _ in range(times):
        status_led.value(1)
        time.sleep(delay)
        status_led.value(0)
        time.sleep(delay)

def error_blink():
    blink_status(3, 0.1)

# -------- SENSORS --------
uart = UART(2, baudrate=9600, tx=18, rx=19)
dht_sensor = dht.DHT11(Pin(26))

vibration = Pin(32, Pin.IN, Pin.PULL_UP)

light = ADC(Pin(34))
light.atten(ADC.ATTN_11DB)

sound = ADC(Pin(35))
sound.atten(ADC.ATTN_0DB)

# -------- STATE --------
noise_count = 0
vibration_count = 0
noise_hits = 0

baseline = sound.read()
sound_peak = 0

last_sensor_send = time.ticks_ms()
last_disturbance_send = time.ticks_ms()
last_noise_time = 0
last_vibration_time = 0

# vibration stuck detection
vibration_high_duration = 0
vibration_stuck = False

threshold = 15

pm1 = pm25 = pm10 = None

# -------- CONNECT --------
connect_wifi()
mqtt = connect_mqtt()

# -------- LOOP --------
while True:

    # -------- SOUND FAST LOOP --------
    val = (sound.read() + sound.read() + sound.read()) // 3

    if val > sound_peak:
        sound_peak = val

    baseline = 0.95 * baseline + 0.05 * val

    delta = val - baseline

    if delta > threshold:
        noise_hits += 1
    else:
        noise_hits = 0

    if noise_hits >= 3:
        if time.ticks_diff(time.ticks_ms(), last_noise_time) > 500:
            noise_count += 1
            last_noise_time = time.ticks_ms()
            print("NOISE!", val, int(baseline))
        noise_hits = 0

    # -------- VIBRATION --------
    if vibration.value() == 0:
        if time.ticks_diff(time.ticks_ms(), last_vibration_time) > 2000:
            vibration_count += 1
            last_vibration_time = time.ticks_ms()
            print("VIBRATION!")

        vibration_high_duration += 10
    else:
        vibration_high_duration = 0

    # stuck detection (10 sec HIGH)
    if vibration_high_duration > 10000:
        vibration_stuck = True
    else:
        vibration_stuck = False

    # -------- SENSOR SEND (60s) --------
    if time.ticks_diff(time.ticks_ms(), last_sensor_send) > 60000:
        last_sensor_send = time.ticks_ms()

        light_val = light.read()

        try:
            dht_sensor.measure()
            temp = dht_sensor.temperature()
            hum = dht_sensor.humidity()
        except:
            temp = None
            hum = None

        if uart.any():
            data = uart.read()
            if data and data[0:2] == b'BM':
                pm1 = data[4]*256 + data[5]
                pm25 = data[6]*256 + data[7]
                pm10 = data[8]*256 + data[9]

        sensor_payload = {
            "ts": time.time(),
            "light": light_val,
            "temperature": temp,
            "humidity": hum,
            "pm1_0": pm1,
            "pm2_5": pm25,
            "pm10": pm10
        }

        print("\nSENSOR:", sensor_payload)

        try:
            ensure_wifi()
            ensure_mqtt()
            mqtt.publish(topic_sensor, json.dumps(sensor_payload))
            print("Sensor sent")
            blink_status(1)
        except Exception as e:
            print("Sensor send failed:", e)
            error_blink()

    # -------- DISTURBANCE SEND (3 min) --------
    if time.ticks_diff(time.ticks_ms(), last_disturbance_send) > 180000:
        last_disturbance_send = time.ticks_ms()

        disturbance_payload = {
            "ts": time.time(),

            "noise_count": noise_count,
            "vibration_count": vibration_count,

            "sound_peak": sound_peak,
            "sound_baseline": int(baseline),
            "sound_last": val,
            "sound_delta": int(delta),

            "vibration_stuck": vibration_stuck
        }

        print("\nDISTURBANCE:", disturbance_payload)

        try:
            ensure_wifi()
            ensure_mqtt()
            mqtt.publish(topic_disturbance, json.dumps(disturbance_payload))
            print("Disturbance sent")
            blink_status(2)
        except Exception as e:
            print("Disturbance send failed:", e)
            error_blink()

        # reset counters
        noise_count = 0
        vibration_count = 0
        sound_peak = 0

    time.sleep_ms(10)