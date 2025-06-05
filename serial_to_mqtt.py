import time
import json
import paho.mqtt.client as mqtt
import serial

# ───────────────────────────────────────────
# 1) Adjust this COM port to the one your Nano shows in Device Manager:
#    • Open Windows Device Manager → Ports (COM & LPT) → find “CircuitPython CDC Data”
#    • Note its COM number, e.g. "COM5" or "COM6"
# ───────────────────────────────────────────
SERIAL_PORT = "COM5"
BAUDRATE = 115200

# ───────────────────────────────────────────
# 2) Open the serial port
# ───────────────────────────────────────────
try:
    ser = serial.Serial(SERIAL_PORT, BAUDRATE, timeout=1)
    print(f"✅ Opened serial port {SERIAL_PORT} at {BAUDRATE} baud")
except serial.SerialException as e:
    print(f"❌ Failed to open serial port {SERIAL_PORT}: {e}")
    exit(1)

# ───────────────────────────────────────────
# 3) Connect to local Mosquitto (localhost:1883)
# ───────────────────────────────────────────
mqtt_client = mqtt.Client()
try:
    mqtt_client.connect("localhost", 1883, 60)
    print("✅ Connected to MQTT broker at localhost:1883")
except Exception as e:
    print(f"❌ Could not connect to MQTT broker: {e}")
    exit(1)

print("▶️  Listening for JSON on serial, then publishing to topic 'arduino/position'…\n")

while True:
    try:
        # Read one full line (up to '\n')
        raw_bytes = ser.readline()
        if not raw_bytes:
            continue  # no data this iteration

        line = raw_bytes
        print("RAW LINE FROM ARDUINO:", line)

        # Attempt to parse JSON
        try:
            payload_obj = json.loads(line)
        except json.JSONDecodeError:
            print("❌ JSON parse error for:", repr(line))
            continue

        # Publish the same JSON string under "arduino/position"
        mqtt_client.publish("arduino/position", json.dumps(payload_obj))
        print("→ Published to MQTT:", payload_obj)

    except serial.SerialException as e:
        print("⚠️ SerialException:", e)
        break
    except Exception as e:
        print("⚠️ Unexpected error:", e)
        break

    time.sleep(1)
