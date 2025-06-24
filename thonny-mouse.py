import time
import board
import busio
import usb_hid
import usb_cdc
import digitalio
from adafruit_lsm6ds.lsm6dsox import LSM6DSOX
from adafruit_hid.mouse import Mouse
from adafruit_hid.keyboard import Keyboard
from adafruit_hid.keycode import Keycode

# ————————————————
# Set up I²C and IMU
# ————————————————
i2c = busio.I2C(board.SCL, board.SDA)
imu = LSM6DSOX(i2c)

# ————————————————
# Set up HID devices and USB-CDC serial
# ————————————————
mouse = Mouse(usb_hid.devices)
keyboard = Keyboard(usb_hid.devices)
serial = usb_cdc.data

# ————————————————
# Set up button on D2 (wired to GND), with pull-up
# ————————————————
button = digitalio.DigitalInOut(board.D10)
button.direction = digitalio.Direction.INPUT
button.pull = digitalio.Pull.UP
last_button_state = button.value  # initialize from the real pin

# ————————————————
# Settings
# ————————————————
threshold = 2.0  # m/s² tilt threshold
MOUSE_STEP = 5  # pixels per loop when tilted

while True:
    # Read IMU acceleration
    accel_x, accel_y, _ = imu.acceleration

    # ————————————————
    # Mouse movement based on tilt
    # ————————————————
    dx = 0
    dy = 0
    if accel_x < -threshold:
        dx = -MOUSE_STEP
    elif accel_x > threshold:
        dx = MOUSE_STEP
    if accel_y < -threshold:
        dy = MOUSE_STEP
    elif accel_y > threshold:
        dy = -MOUSE_STEP

    if dx or dy:
        mouse.move(x=dx, y=dy)

    # ————————————————
    # Button press detection (falling edge) with debounce
    # ————————————————
    current_button = button.value  # False when pressed
    if last_button_state and not current_button:
        # press then release
        keyboard.press(Keycode.R)
        keyboard.release(Keycode.R)
        # wait until button is released to avoid retrigger
        while not button.value:
            time.sleep(0.01)
    last_button_state = button.value

    # ————————————————
    # Send JSON over serial if connected
    # ————————————————
    if serial and getattr(serial, "connected", False):
        dirs = []
        if accel_y < -threshold:
            dirs.append("UP")
        elif accel_y > threshold:
            dirs.append("DOWN")
        if accel_x < -threshold:
            dirs.append("LEFT")
        elif accel_x > threshold:
            dirs.append("RIGHT")
        payload = '{{"direction":"{}", "x":{:.2f}, "y":{:.2f}}}\n'.format(
            "+".join(dirs), accel_x, accel_y
        )
        serial.write(payload.encode('utf-8'))

    # Loop delay
    time.sleep(0.1)

