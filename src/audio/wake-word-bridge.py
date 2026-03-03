#!/usr/bin/env python3
"""Minimal wake word bridge for BMO. Prints 'WAKE' to stdout on detection."""

import sys
import numpy as np
import sounddevice as sd
from openwakeword.model import Model

def main():
    model_path = sys.argv[1] if len(sys.argv) > 1 else "./wakeword.onnx"
    threshold = float(sys.argv[2]) if len(sys.argv) > 2 else 0.5

    model = Model(wakeword_model_paths=[model_path])

    CHUNK_SIZE = 1280
    SAMPLE_RATE = 16000

    # Detect native mic rate and resample if needed
    try:
        device_info = sd.query_devices(kind='input')
        native_rate = int(device_info['default_samplerate'])
    except:
        native_rate = 48000

    use_resampling = native_rate != SAMPLE_RATE
    input_rate = native_rate if use_resampling else SAMPLE_RATE
    input_chunk = int(CHUNK_SIZE * (input_rate / SAMPLE_RATE)) if use_resampling else CHUNK_SIZE

    with sd.InputStream(samplerate=input_rate, channels=1, dtype='int16', blocksize=input_chunk) as stream:
        while True:
            data, _ = stream.read(input_chunk)
            audio = np.frombuffer(data, dtype=np.int16)

            if use_resampling:
                from scipy.signal import resample
                audio = resample(audio, CHUNK_SIZE).astype(np.int16)

            model.predict(audio)
            for mdl in model.prediction_buffer.keys():
                if list(model.prediction_buffer[mdl])[-1] > threshold:
                    model.reset()
                    print("WAKE", flush=True)

if __name__ == "__main__":
    main()
