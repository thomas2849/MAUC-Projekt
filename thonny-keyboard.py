import time
import board
import busio
import usb_hid
from adafruit_lsm6ds.lsm6dsox import LSM6DSOX
from adafruit_hid.keyboard import Keyboard
from adafruit_hid.keycode import Keycode

# Set up I2C and IMU
i2c = busio.I2C(board.SCL, board.SDA)
imu = LSM6DSOX(i2c)

# Set up HID keyboard
keyboard = Keyboard(usb_hid.devices)

# Threshold for triggering key press (tune to your liking)
threshold = 2.0

# Keep track of pressed keys
last_keys = set()

while True:
    accel_x, accel_y, _ = imu.acceleration
    keys = set()

    # Check tilt direction and set corresponding key
    if accel_y < -threshold:
        keys.add(Keycode.UP_ARROW)
    elif accel_y > threshold:
        keys.add(Keycode.DOWN_ARROW)

    if accel_x < -threshold:
        keys.add(Keycode.LEFT_ARROW)
    elif accel_x > threshold:
        keys.add(Keycode.RIGHT_ARROW)

    # Release keys that are no longer pressed
    for k in last_keys - keys:
        keyboard.release(k)

    # Press new keys
    for k in keys - last_keys:
        keyboard.press(k)

    last_keys = keys
    time.sleep(0.1)

