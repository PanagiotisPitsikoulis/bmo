import { WIDTH, HEIGHT, FRAME_SIZE } from "./matrix";

// BMO color palette
const BG = [0, 200, 160] as const;      // teal green
const EYE_WHITE = [255, 255, 255] as const;
const PUPIL = [20, 20, 20] as const;
const MOUTH = [20, 20, 20] as const;
const ERROR_BG = [180, 40, 40] as const;
const BAR_COLOR = [255, 255, 255] as const;

function createFrame(bg: readonly [number, number, number] = BG): Uint8Array {
  const frame = new Uint8Array(FRAME_SIZE);
  for (let i = 0; i < WIDTH * HEIGHT; i++) {
    frame[i * 3] = bg[0];
    frame[i * 3 + 1] = bg[1];
    frame[i * 3 + 2] = bg[2];
  }
  return frame;
}

function setPixel(frame: Uint8Array, x: number, y: number, r: number, g: number, b: number): void {
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  const i = (y * WIDTH + x) * 3;
  frame[i] = r;
  frame[i + 1] = g;
  frame[i + 2] = b;
}

function fillRect(frame: Uint8Array, x: number, y: number, w: number, h: number, color: readonly [number, number, number]): void {
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      setPixel(frame, x + dx, y + dy, color[0], color[1], color[2]);
    }
  }
}

// --- IDLE: Two eyes with occasional blink ---

function drawEyes(frame: Uint8Array, eyeHeight: number = 6, offsetX: number = 0): void {
  // Left eye white (at ~x:16, y:10, size 10x eyeHeight)
  fillRect(frame, 16 + offsetX, 10, 10, eyeHeight, EYE_WHITE);
  // Right eye white
  fillRect(frame, 38 + offsetX, 10, 10, eyeHeight, EYE_WHITE);
  // Pupils (only if eyes are tall enough)
  if (eyeHeight >= 4) {
    fillRect(frame, 20 + offsetX, 12, 3, 3, PUPIL);
    fillRect(frame, 42 + offsetX, 12, 3, 3, PUPIL);
  }
}

function drawMouth(frame: Uint8Array, open: boolean = false): void {
  if (open) {
    // Open mouth - rectangle
    fillRect(frame, 26, 22, 12, 4, MOUTH);
  } else {
    // Closed mouth - line
    fillRect(frame, 26, 23, 12, 1, MOUTH);
  }
}

export function idleFrames(): Uint8Array[] {
  const frames: Uint8Array[] = [];
  // 20 frames of normal eyes, then 2 frames of blink
  for (let i = 0; i < 20; i++) {
    const f = createFrame();
    drawEyes(f, 6);
    drawMouth(f, false);
    frames.push(f);
  }
  // Blink frames
  for (let i = 0; i < 2; i++) {
    const f = createFrame();
    drawEyes(f, 1); // squished eyes
    drawMouth(f, false);
    frames.push(f);
  }
  return frames;
}

// --- LISTENING: Wider eyes, pulsing dot ---

export function listeningFrames(): Uint8Array[] {
  const frames: Uint8Array[] = [];
  for (let i = 0; i < 8; i++) {
    const f = createFrame();
    drawEyes(f, 8); // bigger eyes
    // Pulsing dot below
    const brightness = Math.floor(128 + 127 * Math.sin((i / 8) * Math.PI * 2));
    fillRect(f, 31, 27, 2, 2, [brightness, brightness, brightness]);
    frames.push(f);
  }
  return frames;
}

// --- THINKING: Eyes shift left-right ---

export function thinkingFrames(): Uint8Array[] {
  const frames: Uint8Array[] = [];
  const offsets = [-3, -2, -1, 0, 1, 2, 3, 2, 1, 0, -1, -2];
  for (const ox of offsets) {
    const f = createFrame();
    drawEyes(f, 6, ox);
    drawMouth(f, false);
    frames.push(f);
  }
  return frames;
}

// --- SPEAKING: Mouth opens and closes ---

export function speakingFrames(): Uint8Array[] {
  const frames: Uint8Array[] = [];
  for (let i = 0; i < 4; i++) {
    const f = createFrame();
    drawEyes(f, 6);
    drawMouth(f, i % 2 === 0); // alternate open/close
    frames.push(f);
  }
  return frames;
}

// --- ERROR: X eyes on red background ---

export function errorFrames(): Uint8Array[] {
  const f = createFrame(ERROR_BG);
  // Left X eye
  for (let d = 0; d < 6; d++) {
    setPixel(f, 17 + d, 10 + d, 255, 255, 255);
    setPixel(f, 22 - d, 10 + d, 255, 255, 255);
  }
  // Right X eye
  for (let d = 0; d < 6; d++) {
    setPixel(f, 39 + d, 10 + d, 255, 255, 255);
    setPixel(f, 44 - d, 10 + d, 255, 255, 255);
  }
  drawMouth(f, false);
  return [f];
}

// --- WARMUP: Loading bar ---

export function warmupFrames(): Uint8Array[] {
  const frames: Uint8Array[] = [];
  for (let i = 0; i <= 16; i++) {
    const f = createFrame();
    // Eyes
    drawEyes(f, 6);
    // Loading bar at bottom
    const barWidth = Math.floor((i / 16) * 48);
    fillRect(f, 8, 28, barWidth, 2, BAR_COLOR);
    // Bar outline
    fillRect(f, 8, 27, 48, 1, [100, 100, 100]);
    fillRect(f, 8, 30, 48, 1, [100, 100, 100]);
    frames.push(f);
  }
  return frames;
}

export type FaceState = "idle" | "listening" | "thinking" | "speaking" | "error" | "warmup";

const faceGenerators: Record<FaceState, () => Uint8Array[]> = {
  idle: idleFrames,
  listening: listeningFrames,
  thinking: thinkingFrames,
  speaking: speakingFrames,
  error: errorFrames,
  warmup: warmupFrames,
};

// Cache generated frames
const frameCache = new Map<FaceState, Uint8Array[]>();

export function getFrames(state: FaceState): Uint8Array[] {
  if (!frameCache.has(state)) {
    frameCache.set(state, faceGenerators[state]());
  }
  return frameCache.get(state)!;
}
