#!/usr/bin/env python3
"""
LED Matrix bridge for BMO.
Reads 6144-byte RGB frames (64x32x3) from stdin and renders to HUB75 matrix.
Uses hzeller's rpi-rgb-led-matrix library.
"""

import sys
import time

try:
    from rgbmatrix import RGBMatrix, RGBMatrixOptions
except ImportError:
    # Fallback for development: just consume frames silently
    print("[MATRIX] rgbmatrix not available, running in dummy mode", file=sys.stderr, flush=True)
    FRAME_SIZE = 64 * 32 * 3
    while True:
        data = sys.stdin.buffer.read(FRAME_SIZE)
        if not data or len(data) < FRAME_SIZE:
            break
    sys.exit(0)

WIDTH = 64
HEIGHT = 32
FRAME_SIZE = WIDTH * HEIGHT * 3

options = RGBMatrixOptions()
options.rows = HEIGHT
options.cols = WIDTH
options.chain_length = 1
options.parallel = 1
options.hardware_mapping = 'regular'
options.gpio_slowdown = 4  # Pi Zero needs higher slowdown
options.brightness = 60
options.disable_hardware_pulsing = True  # Required when not running as root with RT

matrix = RGBMatrix(options=options)
canvas = matrix.CreateFrameCanvas()

while True:
    data = sys.stdin.buffer.read(FRAME_SIZE)
    if not data or len(data) < FRAME_SIZE:
        break

    for y in range(HEIGHT):
        for x in range(WIDTH):
            offset = (y * WIDTH + x) * 3
            r = data[offset]
            g = data[offset + 1]
            b = data[offset + 2]
            canvas.SetPixel(x, y, r, g, b)

    canvas = matrix.SwapOnVSync(canvas)
