#!/bin/bash

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}BMO Setup Script for Raspberry Pi Zero${NC}"

# 1. System dependencies
echo -e "${YELLOW}[1/8] Installing system dependencies...${NC}"
sudo apt update
sudo apt install -y libasound2-dev libportaudio2 cmake build-essential git python3-venv python3-dev alsa-utils

# 2. Install Bun
echo -e "${YELLOW}[2/8] Installing Bun...${NC}"
if ! command -v bun &> /dev/null; then
    curl -fsSL https://bun.sh/install | bash
    export PATH="$HOME/.bun/bin:$PATH"
else
    echo "Bun already installed."
fi

# 3. Create directories
echo -e "${YELLOW}[3/8] Creating directories...${NC}"
mkdir -p sounds/greeting_sounds sounds/thinking_sounds sounds/ack_sounds sounds/error_sounds

# 4. Build whisper.cpp
echo -e "${YELLOW}[4/8] Building whisper.cpp...${NC}"
if [ ! -d "whisper.cpp" ]; then
    git clone https://github.com/ggerganov/whisper.cpp.git
    cd whisper.cpp
    cmake -B build
    cmake --build build --config Release -j2
    cd ..
fi

# 5. Download whisper model
echo -e "${YELLOW}[5/8] Downloading whisper model...${NC}"
mkdir -p whisper.cpp/models
if [ ! -f "whisper.cpp/models/ggml-base.en.bin" ]; then
    curl -L -o whisper.cpp/models/ggml-base.en.bin \
        https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin
fi

# 6. Download wake word model
echo -e "${YELLOW}[6/8] Downloading wake word model...${NC}"
if [ ! -f "wakeword.onnx" ]; then
    curl -L -o wakeword.onnx \
        https://github.com/dscripka/openWakeWord/raw/main/openwakeword/resources/models/hey_jarvis_v0.1.onnx
fi

# 7. Python dependencies (for wake word + matrix bridges)
echo -e "${YELLOW}[7/8] Installing Python dependencies...${NC}"
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install openwakeword sounddevice numpy scipy onnxruntime

# rpi-rgb-led-matrix Python bindings
if [ ! -d "rpi-rgb-led-matrix" ]; then
    git clone https://github.com/hzeller/rpi-rgb-led-matrix.git
    cd rpi-rgb-led-matrix
    make build-python PYTHON=$(which python3)
    sudo make install-python PYTHON=$(which python3)
    cd ..
fi

# 8. Install Node dependencies
echo -e "${YELLOW}[8/8] Installing Bun dependencies...${NC}"
bun install

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo -e "${RED}Please edit .env with your API keys!${NC}"
fi

echo -e "${GREEN}Setup complete! Run: bun run index.ts${NC}"
