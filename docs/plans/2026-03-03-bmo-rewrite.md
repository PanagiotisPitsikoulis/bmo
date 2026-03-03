# BMO Rewrite — Bun + TypeScript for Raspberry Pi Zero

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite the Python BMO agent as a Bun + TypeScript CLI application for Raspberry Pi Zero with USB mic, speaker, and Waveshare 64x32 HUB75 RGB LED matrix. Replace Ollama with Claude API, Piper TTS with Fish Audio API. Keep Whisper.cpp for local STT and OpenWakeWord for wake detection.

**Hardware:** Raspberry Pi Zero (512MB RAM, single-core ARM), USB mic, speaker, Waveshare P3 64x32 RGB LED matrix (HUB75)

**Stack:** Bun runtime, TypeScript, Anthropic SDK, Fish Audio REST API, Whisper.cpp (subprocess), OpenWakeWord (subprocess via Python), rpi-rgb-led-matrix (C helper reading from stdin)

**Key constraint:** Pi Zero is very resource-constrained. No GUI frameworks. All audio I/O via `arecord`/`aplay` shell commands. LED matrix driven by a small C helper process. Keep memory footprint minimal.

---

### Task 1: Project setup and dependencies

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.json`
- Create: `src/config.ts`

**What to do:**

Install dependencies:
```bash
bun add @anthropic-ai/sdk
```

No other npm dependencies needed — Bun has built-in file I/O, subprocess, and fetch.

`src/config.ts` — Load config from env vars (ANTHROPIC_API_KEY, FISH_AUDIO_API_KEY, BMO_VOICE_ID) and a `config.json` file for hardware settings (silence_threshold, silence_duration, max_record_time, wake_word_threshold, whisper_model_path, wake_word_model_path). Export typed config object.

**Step 1:** Install @anthropic-ai/sdk
**Step 2:** Create src/config.ts
**Step 3:** Verify `bun run src/config.ts` loads env and prints config
**Step 4:** Commit: "feat: project setup with config loader"

---

### Task 2: Audio recorder (mic input via arecord)

**Files:**
- Create: `src/audio/recorder.ts`

**What to do:**

Record audio from USB mic using `arecord` subprocess. Two modes:

`recordAdaptive()` — Records until silence detected. Spawns `arecord -D default -f S16_LE -r 16000 -c 1 -t wav <filename>`. Monitors audio level from a parallel read of the raw stream. Stops after `silence_duration` seconds of silence. Returns WAV file path or null.

`recordPTT()` — Records until explicitly stopped. Same arecord command, terminated by signal.

Both write to a temp WAV file (`/tmp/bmo_input.wav`).

Implementation approach: Use `Bun.spawn()` for arecord. For silence detection in adaptive mode, spawn arecord writing raw PCM to stdout, read chunks, compute RMS, and when silence threshold exceeded for the configured duration, kill the process and write accumulated buffer as WAV.

**Step 1:** Implement recordAdaptive() with silence detection
**Step 2:** Implement recordPTT()
**Step 3:** Test on dev machine (mock arecord if needed): `bun run src/audio/recorder.ts`
**Step 4:** Commit: "feat: audio recorder with silence detection"

---

### Task 3: Audio player (speaker output via aplay)

**Files:**
- Create: `src/audio/player.ts`

**What to do:**

`playWav(filePath: string): Promise<void>` — Plays a WAV file via `aplay`. Spawns `aplay <filepath>` and awaits completion.

`playPCM(data: Buffer, sampleRate: number): Promise<void>` — Plays raw PCM data. Writes buffer to temp file, plays via `aplay -f S16_LE -r <rate> -c 1 <tmpfile>`.

`playRandomSound(directory: string): Promise<void>` — Picks a random .wav from a directory and plays it. Used for greeting, thinking, ack, error sounds.

`stopPlayback(): void` — Kills current aplay process if running.

Keep a reference to the current subprocess so it can be interrupted.

**Step 1:** Implement all playback functions using Bun.spawn
**Step 2:** Test with a sample WAV file
**Step 3:** Commit: "feat: audio player via aplay"

---

### Task 4: Whisper.cpp STT wrapper

**Files:**
- Create: `src/stt/whisper.ts`

**What to do:**

`transcribe(wavPath: string): Promise<string>` — Runs whisper.cpp CLI as subprocess. Command: `./whisper.cpp/build/bin/whisper-cli -m ./whisper.cpp/models/ggml-base.en.bin -l en -t 4 -f <wavPath>`. Parses stdout to extract transcription text (last line, after `]` bracket). Returns trimmed string or empty string on failure.

Same approach as the original Python — direct subprocess call, parse output.

**Step 1:** Implement transcribe function
**Step 2:** Commit: "feat: whisper.cpp STT wrapper"

---

### Task 5: OpenWakeWord detection

**Files:**
- Create: `src/audio/wake-word.ts`
- Create: `src/audio/wake-word-bridge.py`

**What to do:**

OpenWakeWord is Python-only. Bridge approach: a small Python script that listens to the mic, runs wake word detection, and prints "WAKE" to stdout when triggered.

`wake-word-bridge.py` — Minimal Python script:
- Loads openwakeword model from `./wakeword.onnx`
- Opens mic stream via sounddevice at 16kHz
- On detection (score > threshold), prints "WAKE\n" to stdout and flushes
- Continues listening

`src/audio/wake-word.ts` — TypeScript wrapper:
- `waitForWakeWord(): Promise<void>` — Spawns the Python bridge, reads stdout line by line, resolves when "WAKE" received
- Keeps the Python process alive between calls (start once, reuse)
- `stop(): void` — Kills the Python process

**Step 1:** Create wake-word-bridge.py
**Step 2:** Create TypeScript wrapper
**Step 3:** Commit: "feat: wake word detection via Python bridge"

---

### Task 6: Claude API integration

**Files:**
- Create: `src/llm/claude.ts`

**What to do:**

`chat(messages: Message[], onChunk?: (text: string) => void): Promise<string>` — Sends conversation to Claude API via Anthropic SDK. Streams response, calling onChunk for each text delta. Returns full response text.

System prompt (adapted from original):
```
You are BMO, a helpful robot assistant running on a Raspberry Pi.
Personality: Cute, helpful, enthusiastic robot.
Style: Short sentences. Enthusiastic.

If the user asks for a physical action, output JSON:
- Time: {"action": "get_time"}
- Web search: {"action": "search_web", "query": "..."}
Otherwise reply with normal text. Keep responses short.
```

Use `claude-haiku-4-5-20251001` model to keep costs low and responses fast (Pi Zero has limited bandwidth too).

Message type: `{ role: "user" | "assistant", content: string }`

Memory: Accept messages array from caller (the main loop manages memory).

Also: `summarize(result: string, question: string): Promise<string>` — Asks Claude to summarize a tool result in one short sentence (same as original's tool result summarization).

**Step 1:** Implement chat() with streaming
**Step 2:** Implement summarize()
**Step 3:** Commit: "feat: Claude API integration with streaming"

---

### Task 7: Fish Audio TTS

**Files:**
- Create: `src/tts/fish-audio.ts`

**What to do:**

`textToSpeech(text: string): Promise<Buffer>` — Calls `POST https://api.fish.audio/v1/tts` with:
```json
{
  "text": "<text>",
  "reference_id": "<BMO_VOICE_ID>",
  "format": "wav",
  "latency": "balanced"
}
```
Headers: `Authorization: Bearer <FISH_AUDIO_API_KEY>`, `Content-Type: application/json`.

Returns the response body as a Buffer (WAV audio).

`speak(text: string): Promise<void>` — Calls textToSpeech, writes buffer to temp file, plays via player.playWav(). Cleans text first (strip non-speech chars like the original).

**Step 1:** Implement textToSpeech API call
**Step 2:** Implement speak() convenience function
**Step 3:** Commit: "feat: Fish Audio TTS integration"

---

### Task 8: LED matrix display driver

**Files:**
- Create: `src/display/matrix.ts`
- Create: `src/display/renderer.ts`
- Create: `src/display/faces.ts`

**What to do:**

**matrix.ts** — Interface to the HUB75 LED matrix via hzeller's rpi-rgb-led-matrix library.

Approach: Create a small wrapper that spawns the `led-image-viewer` utility or a custom Python script using the `rgbmatrix` Python bindings to display raw pixel data. Simplest path: write frames as raw RGB binary to a named pipe or temp file, and have a helper process render them.

Concrete implementation:
- `MatrixDriver` class
- `start()` — Spawns helper process (Python script using rgbmatrix library)
- `sendFrame(pixels: Buffer)` — Writes 64×32×3 = 6144 bytes RGB buffer to helper's stdin
- `stop()` — Kills helper process
- Helper Python script: `src/display/matrix-bridge.py` — Reads 6144-byte frames from stdin, renders to matrix using `rgbmatrix` library

**renderer.ts** — Animation loop:
- Holds current state (idle, listening, thinking, speaking, error, warmup)
- Runs `setInterval` at ~10 FPS
- Each tick: gets current frame from faces.ts, sends to matrix driver
- `setState(state)` — Changes animation state, resets frame counter

**faces.ts** — Frame generators for 64x32 pixel art:
- Each face is a function that returns frames as `Uint8Array[]` (array of 6144-byte RGB buffers)
- `idle`: Two rectangular eyes (white on dark bg), blink animation every ~3 seconds (eyes squish to 1px height for 2 frames)
- `listening`: Eyes wider, small pulsing dot below
- `thinking`: Eyes shift left-right
- `speaking`: Eyes normal + rectangular mouth that opens/closes (alternating frames)
- `error`: X-shaped eyes, reddish tint
- `warmup`: Loading bar animation across bottom

Colors: BMO-themed teal/green background (#00C8A0), white eyes, dark pupils

**Step 1:** Create matrix-bridge.py helper
**Step 2:** Create matrix.ts driver
**Step 3:** Create faces.ts with pixel art face definitions
**Step 4:** Create renderer.ts animation loop
**Step 5:** Commit: "feat: LED matrix display with pixel art faces"

---

### Task 9: Tools (time + web search)

**Files:**
- Create: `src/tools/time.ts`
- Create: `src/tools/web-search.ts`
- Create: `src/tools/router.ts`

**What to do:**

`time.ts` — `getTime(): string` — Returns formatted current time.

`web-search.ts` — `searchWeb(query: string): Promise<string>` — Uses DuckDuckGo HTML search via fetch (no library needed). Fetches `https://html.duckduckgo.com/html/?q=<query>`, parses first result title + snippet from HTML. Returns formatted result or error string.

`router.ts` — `executeAction(actionJson: { action: string, query?: string, value?: string }): Promise<string>` — Routes to the right tool. Same alias system as original (google→search_web, check_time→get_time). Returns result string or error codes (INVALID_ACTION, SEARCH_EMPTY, SEARCH_ERROR).

**Step 1:** Implement time and web search tools
**Step 2:** Implement router
**Step 3:** Commit: "feat: tool system with time and web search"

---

### Task 10: Chat memory persistence

**Files:**
- Create: `src/memory.ts`

**What to do:**

`loadHistory(): Message[]` — Reads `memory.json`, returns array of messages. Returns empty array with system prompt if file doesn't exist.

`saveHistory(messages: Message[]): void` — Writes messages to `memory.json`. Keeps last 10 exchanges (20 messages) plus system prompt.

`resetMemory(): Message[]` — Clears memory file, returns fresh array with just system prompt.

Uses `Bun.file()` and `Bun.write()` for file I/O.

**Step 1:** Implement memory functions
**Step 2:** Commit: "feat: chat memory persistence"

---

### Task 11: Main loop (state machine + orchestration)

**Files:**
- Create: `src/index.ts`
- Modify: `index.ts` (entry point, imports and runs src/index.ts)

**What to do:**

Main state machine matching the original agent.py flow:

```
States: WARMUP → IDLE → LISTENING → THINKING → SPEAKING → IDLE
```

Main loop:
1. **WARMUP**: Start matrix display, play greeting sound, log ready
2. **IDLE**: Wait for wake word (wake-word.ts) — display idle face
3. **LISTENING**: Record audio (adaptive mode) — display listening face, play ack sound
4. **THINKING**: Transcribe (whisper.ts), send to Claude (claude.ts) — display thinking face, play thinking sounds in background
5. **Process response**:
   - If JSON action detected → execute tool → summarize result → speak summary
   - If normal text → speak response
6. **SPEAKING**: Fish Audio TTS + aplay — display speaking face
7. Back to IDLE

Handle interrupts: if user triggers wake word during speaking, stop playback and go to listening.

Memory management: maintain message array, append user/assistant messages, pass to claude.chat(). Check for "forget everything"/"reset memory" commands.

Error handling: catch errors in each phase, display error face, play error sound, return to idle.

Graceful shutdown: handle SIGINT/SIGTERM, save memory, stop all processes.

**Step 1:** Implement state machine and main loop
**Step 2:** Wire up all components
**Step 3:** Update root index.ts to import and run
**Step 4:** Commit: "feat: main loop with state machine"

---

### Task 12: Setup script for Pi Zero

**Files:**
- Create: `setup.sh`

**What to do:**

Adapted from original setup.sh for the new stack:

1. Install system deps: `libasound2-dev libportaudio2 cmake build-essential git python3-venv python3-dev`
2. Install Bun (if not present): `curl -fsSL https://bun.sh/install | bash`
3. Create directories: `sounds/greeting_sounds`, `sounds/thinking_sounds`, `sounds/ack_sounds`, `sounds/error_sounds`
4. Build whisper.cpp (clone, cmake, build — targeting ARM)
5. Download whisper model: `ggml-base.en.bin`
6. Download wake word model: `wakeword.onnx`
7. Install Python deps for bridges: `pip3 install openwakeword sounddevice numpy rgbmatrix` (in a venv)
8. Install rpi-rgb-led-matrix library (clone + build)
9. `bun install`
10. Print instructions for .env setup

**Step 1:** Create setup.sh with all steps
**Step 2:** Create .env.example
**Step 3:** Commit: "feat: Pi Zero setup script"
