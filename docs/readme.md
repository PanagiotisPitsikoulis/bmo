# BMO Talking Robot

![BMO](src/web/assets/cover.webp)

## What is this

A budget friendly, real-life BMO from Adventure Time. It's a small physical robot you can talk to, powered by a Raspberry Pi and an LED matrix screen for the face. You speak to it, it listens, thinks using AI, and talks back with a real voice. It can also search the web, tell you the time, and see things through a camera. Is very lightweight and is build using the Typescript language and Bun runtime, to be able to execute on very budget friendly hardware.

## Features

- Animated pixel face on a 64x32 RGB LED matrix (different expressions for idle, listening, thinking, speaking, and errors)
- Wake word detection — say a keyword and BMO wakes up
- Push-to-talk as an alternative to the wake word
- Speech-to-text using Whisper (runs locally, offline)
- AI conversation powered by Claude
- Text-to-speech using Fish Audio (BMO talks back out loud)
- Web search — ask BMO to look things up
- Camera vision — ask "what do you see?" and BMO takes a photo and describes it
- Tells the time
- Persistent chat memory across sessions
- Memory reset ("forget everything")
- Interrupt BMO mid-sentence by pressing space
- Interactive dev mode — try it in your browser before buying any hardware
