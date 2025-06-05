import time
import board
import busio
import usb_hid
import usb_cdc
from adafruit_lsm6ds.lsm6dsox import LSM6DSOX
from adafruit_hid.mouse import Mouse

# ————————————————
# Set up I²C and IMU
# ————————————————
i2c = busio.I2C(board.SCL, board.SDA)
imu = LSM6DSOX(i2c)

# ————————————————
# Set up HID Mouse and USB‐CDC “data” serial
# ————————————————
mouse = Mouse(usb_hid.devices)
serial = usb_cdc.data

# ————————————————
# “How much tilt (m/s²) before we move the mouse?”
threshold = 2.0

# “How many pixels (units) to move per loop when tilted”
MOUSE_STEP = 5

while True:
    # Read raw acceleration values
    accel_x, accel_y, _ = imu.acceleration

    # Compute relative movement for this cycle
    dx = 0
    dy = 0

    # If tilted “left” or “right,” move mouse on X‐axis
    if accel_x < -threshold:
        dx = -MOUSE_STEP
    elif accel_x > threshold:
        dx = MOUSE_STEP

    # If tilted “forward” or “back,” move mouse on Y‐axis
    # Note: negative accel_y means “nose down” → move up (negative Y)
    if accel_y < -threshold:
        dy = MOUSE_STEP
    elif accel_y > threshold:
        dy = -MOUSE_STEP

    # Perform the HID mouse movement (only when dx or dy is non‐zero)
    if dx != 0 or dy != 0:
        mouse.move(x=dx, y=dy)

    # —————————————————————
    # Always send JSON over USB‐CDC “data”
    # (so your existing serial_to_mqtt.py can pick it up)
    # —————————————————————
    if serial:  # and getattr(serial, "connected", False):
        # Build a direction string just for debugging/payload clarity
        directions = []
        if accel_y < -threshold:
            directions.append("UP")
        elif accel_y > threshold:
            directions.append("DOWN")

        if accel_x < -threshold:
            directions.append("LEFT")
        elif accel_x > threshold:
            directions.append("RIGHT")

        # Even if directions is empty, we still send x/y
        payload = '{{"direction":"{}", "x":{:.2f}, "y":{:.2f}}}\n'.format(
            "+".join(directions), accel_x, accel_y
        )
        serial.write(payload)
        print(payload)

    # Small delay to avoid over‐flooding USB HID and serial
    time.sleep(0.1)


