import paho.mqtt.client as mqtt
import json

client = mqtt.Client()
client.connect("localhost", 1883, 60)

test_payload = json.dumps({"direction": "TEST", "x": 1, "y": 2})
client.publish("arduino/position", test_payload)
print("Sent test MQTT message")
