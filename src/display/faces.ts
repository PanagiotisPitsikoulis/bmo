import { WIDTH, HEIGHT, FRAME_SIZE } from "./matrix";
import type { Emotion } from "../config";

// Show-accurate BMO color palette
const BG = [0, 200, 160] as const;           // teal green face
const DOT = [20, 20, 20] as const;           // eyes + mouth line (near black)
const MOUTH_FILL = [0, 110, 88] as const;    // dark teal interior when mouth is open
const TEETH = [255, 255, 255] as const;       // white teeth
const TONGUE = [240, 120, 140] as const;      // pink tongue
const HEART = [220, 50, 80] as const;         // red hearts
const BLUSH = [255, 130, 160] as const;       // pink blush
const Z_COL = [200, 200, 200] as const;       // light gray Zs
const ERROR_BG = [180, 40, 40] as const;
const BAR_COL = [255, 255, 255] as const;

type Color = readonly [number, number, number];

// Eye anchor positions (top-left of 4x4 bounding box)
const LE = { x: 18, y: 10 }; // left eye
const RE = { x: 42, y: 10 }; // right eye
const MOUTH_Y = 23;

function createFrame(bg: Color = BG): Uint8Array {
  const frame = new Uint8Array(FRAME_SIZE);
  for (let i = 0; i < WIDTH * HEIGHT; i++) {
    frame[i * 3] = bg[0];
    frame[i * 3 + 1] = bg[1];
    frame[i * 3 + 2] = bg[2];
  }
  return frame;
}

function sp(frame: Uint8Array, x: number, y: number, c: Color): void {
  if (x < 0 || x >= WIDTH || y < 0 || y >= HEIGHT) return;
  const i = (y * WIDTH + x) * 3;
  frame[i] = c[0]; frame[i + 1] = c[1]; frame[i + 2] = c[2];
}

function fr(frame: Uint8Array, x: number, y: number, w: number, h: number, c: Color): void {
  for (let dy = 0; dy < h; dy++)
    for (let dx = 0; dx < w; dx++)
      sp(frame, x + dx, y + dy, c);
}

// ═══════════════════════════════════════════
// EYE TYPES (matching the reference image)
// ═══════════════════════════════════════════

// Dot eye: 4x4 rounded circle (normal, sad, hungry, neutral)
//  XX
// XXXX
// XXXX
//  XX
function dotEye(frame: Uint8Array, x: number, y: number): void {
  sp(frame, x + 1, y, DOT); sp(frame, x + 2, y, DOT);
  fr(frame, x, y + 1, 4, 2, DOT);
  sp(frame, x + 1, y + 3, DOT); sp(frame, x + 2, y + 3, DOT);
}

function dotEyes(frame: Uint8Array, ox: number = 0): void {
  dotEye(frame, LE.x + ox, LE.y);
  dotEye(frame, RE.x + ox, RE.y);
}

// Blink: thin horizontal line (eyes squeezed shut)
function blinkEyes(frame: Uint8Array, ox: number = 0): void {
  fr(frame, LE.x + ox, LE.y + 1, 4, 2, DOT);
  fr(frame, RE.x + ox, RE.y + 1, 4, 2, DOT);
}

// Crescent eye: happy closed ∪ shape (6x3)
// X    X
//  X  X
//   XX
function crescentEye(frame: Uint8Array, x: number, y: number): void {
  sp(frame, x, y, DOT); sp(frame, x + 5, y, DOT);
  sp(frame, x + 1, y + 1, DOT); sp(frame, x + 4, y + 1, DOT);
  sp(frame, x + 2, y + 2, DOT); sp(frame, x + 3, y + 2, DOT);
}

function crescentEyes(frame: Uint8Array): void {
  crescentEye(frame, LE.x - 1, LE.y + 1);
  crescentEye(frame, RE.x - 1, RE.y + 1);
}

// Half-closed/sleepy eyes: flat horizontal lines
function sleepyEyeLines(frame: Uint8Array): void {
  fr(frame, LE.x, LE.y + 2, 5, 1, DOT);
  fr(frame, RE.x, RE.y + 2, 5, 1, DOT);
}

// Oval/scared eyes: 4x7 tall ovals (for error)
function ovalEye(frame: Uint8Array, x: number, y: number, c: Color = DOT): void {
  sp(frame, x + 1, y, c); sp(frame, x + 2, y, c);
  fr(frame, x, y + 1, 4, 5, c);
  sp(frame, x + 1, y + 6, c); sp(frame, x + 2, y + 6, c);
}

function ovalEyes(frame: Uint8Array, c: Color = DOT): void {
  ovalEye(frame, LE.x, LE.y - 2, c);
  ovalEye(frame, RE.x, RE.y - 2, c);
}

// ═══════════════════════════════════════════
// MOUTH TYPES (matching the reference image)
// ═══════════════════════════════════════════

// Flat line mouth (neutral/bored - bottom-right of reference)
function lineMouth(frame: Uint8Array, w: number = 14): void {
  fr(frame, 32 - Math.floor(w / 2), MOUTH_Y, w, 1, DOT);
}

// Smile curve (gentle happy - middle-left of reference)
function smileMouth(frame: Uint8Array, w: number = 14): void {
  const cx = 32, half = Math.floor(w / 2);
  for (let dx = -half; dx <= half; dx++) {
    const a = Math.abs(dx);
    let dy = 0;
    if (a >= half) dy = -2;
    else if (a >= Math.floor(w * 0.4)) dy = -1;
    sp(frame, cx + dx, MOUTH_Y + dy, DOT);
  }
}

// Frown curve (sad)
function frownMouth(frame: Uint8Array, w: number = 14): void {
  const cx = 32, half = Math.floor(w / 2);
  for (let dx = -half; dx <= half; dx++) {
    const a = Math.abs(dx);
    let dy = 0;
    if (a >= half) dy = 2;
    else if (a >= Math.floor(w * 0.4)) dy = 1;
    sp(frame, cx + dx, MOUTH_Y + dy, DOT);
  }
}

// Open mouth: dark green D-shape with dark outline (speaking - middle-center of reference)
function openMouth(frame: Uint8Array, w: number = 12, h: number = 5): void {
  const x = 32 - Math.floor(w / 2);
  const y = MOUTH_Y - 1;
  // Dark outline
  fr(frame, x, y, w, h, DOT);
  // Green interior (1px inset)
  if (w > 2 && h > 2) {
    fr(frame, x + 1, y + 1, w - 2, h - 2, MOUTH_FILL);
  }
}

// Big open mouth with teeth + tongue (hungry/eating - middle-right of reference)
function teethMouth(frame: Uint8Array): void {
  const w = 16, h = 7;
  const x = 32 - Math.floor(w / 2);
  const y = 20;
  // Outline
  fr(frame, x, y, w, h, DOT);
  // Green interior
  fr(frame, x + 1, y + 1, w - 2, h - 2, MOUTH_FILL);
  // Top teeth: 3 white blocks
  for (let i = 0; i < 3; i++) {
    fr(frame, x + 2 + i * 4, y + 1, 3, 2, TEETH);
  }
  // Tongue at bottom center
  fr(frame, x + 4, y + h - 3, w - 8, 2, TONGUE);
}

// Wavy/scared mouth (error - bottom-middle of reference)
function wavyMouth(frame: Uint8Array): void {
  for (let dx = -6; dx <= 6; dx++) {
    const dy = Math.round(Math.sin(dx * 1.2) * 1.5);
    sp(frame, 32 + dx, MOUTH_Y + dy, DOT);
  }
}

// ═══════════════════════════════════════════
// EXTRAS
// ═══════════════════════════════════════════

function drawHeart(frame: Uint8Array, x: number, y: number, c: Color): void {
  const p = [
    [0,1,1,0,1,1,0],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [0,1,1,1,1,1,0],
    [0,0,1,1,1,0,0],
    [0,0,0,1,0,0,0],
  ];
  for (let dy = 0; dy < p.length; dy++)
    for (let dx = 0; dx < p[0]!.length; dx++)
      if (p[dy]![dx]) sp(frame, x + dx, y + dy, c);
}

function drawSmallHeart(frame: Uint8Array, x: number, y: number, c: Color): void {
  const p = [[0,1,0,1,0],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]];
  for (let dy = 0; dy < p.length; dy++)
    for (let dx = 0; dx < p[0]!.length; dx++)
      if (p[dy]![dx]) sp(frame, x + dx, y + dy, c);
}

function drawBlush(frame: Uint8Array): void {
  fr(frame, LE.x - 4, LE.y + 6, 3, 2, BLUSH);
  fr(frame, RE.x + 5, RE.y + 6, 3, 2, BLUSH);
}

function drawZ(frame: Uint8Array, x: number, y: number, size: number): void {
  for (let dx = 0; dx < size; dx++) sp(frame, x + dx, y, Z_COL);
  for (let d = 0; d < size; d++) sp(frame, x + size - 1 - d, y + d, Z_COL);
  for (let dx = 0; dx < size; dx++) sp(frame, x + dx, y + size - 1, Z_COL);
}

function drawZs(frame: Uint8Array, phase: number): void {
  const zs = [{ x: 50, y: 20, s: 4 }, { x: 54, y: 15, s: 3 }, { x: 57, y: 11, s: 2 }];
  for (const z of zs) {
    const yy = z.y - (phase % 16);
    if (yy >= 0 && yy + z.s < HEIGHT) drawZ(frame, z.x, yy, z.s);
  }
}

// Stress marks for scared face (bottom-middle of reference)
function drawStressMarks(frame: Uint8Array): void {
  // Small lightning-bolt marks near the eyes
  sp(frame, LE.x - 3, LE.y, DOT); sp(frame, LE.x - 2, LE.y + 1, DOT); sp(frame, LE.x - 3, LE.y + 2, DOT);
  sp(frame, RE.x + 6, RE.y, DOT); sp(frame, RE.x + 7, RE.y + 1, DOT); sp(frame, RE.x + 6, RE.y + 2, DOT);
}

// ═══════════════════════════════════════════
// FRAME GENERATORS
// ═══════════════════════════════════════════

function generateFrames(state: FaceState, emotion: Emotion): Uint8Array[] {
  if (state === "error") return errorFrames();
  if (state === "warmup") return warmupFrames();
  switch (emotion) {
    case "happy": return happyFrames(state);
    case "sad": return sadFrames(state);
    case "hungry": return hungryFrames(state);
    case "in_love": return inLoveFrames(state);
    case "sleepy": return sleepyFrames(state);
    default: return normalFrames(state);
  }
}

// --- NORMAL: dot eyes, flat line mouth ---
function normalFrames(state: FaceState): Uint8Array[] {
  const frames: Uint8Array[] = [];
  switch (state) {
    case "idle":
      for (let i = 0; i < 22; i++) {
        const f = createFrame();
        if (i >= 20) blinkEyes(f); else dotEyes(f);
        lineMouth(f);
        frames.push(f);
      }
      break;
    case "listening":
      for (let i = 0; i < 8; i++) {
        const f = createFrame();
        dotEyes(f);
        lineMouth(f);
        const b = Math.floor(128 + 127 * Math.sin((i / 8) * Math.PI * 2));
        fr(f, 31, 28, 2, 2, [b, b, b]);
        frames.push(f);
      }
      break;
    case "thinking": {
      const offsets = [-3, -2, -1, 0, 1, 2, 3, 2, 1, 0, -1, -2];
      for (const ox of offsets) {
        const f = createFrame();
        dotEyes(f, ox);
        lineMouth(f);
        frames.push(f);
      }
      break;
    }
    case "speaking":
      for (let i = 0; i < 4; i++) {
        const f = createFrame();
        dotEyes(f);
        if (i % 2 === 0) openMouth(f); else lineMouth(f);
        frames.push(f);
      }
      break;
    default: {
      const f = createFrame();
      dotEyes(f);
      lineMouth(f);
      frames.push(f);
    }
  }
  return frames;
}

// --- HAPPY: crescent eyes, smile mouth ---
function happyFrames(state: FaceState): Uint8Array[] {
  const frames: Uint8Array[] = [];
  switch (state) {
    case "idle":
      for (let i = 0; i < 16; i++) {
        const f = createFrame();
        crescentEyes(f);
        smileMouth(f);
        frames.push(f);
      }
      break;
    case "listening":
      for (let i = 0; i < 8; i++) {
        const f = createFrame();
        crescentEyes(f);
        smileMouth(f);
        const b = Math.floor(128 + 127 * Math.sin((i / 8) * Math.PI * 2));
        fr(f, 31, 28, 2, 2, [b, b, b]);
        frames.push(f);
      }
      break;
    case "thinking": {
      const offsets = [-3, -2, -1, 0, 1, 2, 3, 2, 1, 0, -1, -2];
      for (const ox of offsets) {
        const f = createFrame();
        dotEyes(f, ox);
        smileMouth(f);
        frames.push(f);
      }
      break;
    }
    case "speaking":
      for (let i = 0; i < 4; i++) {
        const f = createFrame();
        crescentEyes(f);
        if (i % 2 === 0) openMouth(f); else smileMouth(f);
        frames.push(f);
      }
      break;
    default: {
      const f = createFrame();
      crescentEyes(f);
      smileMouth(f);
      frames.push(f);
    }
  }
  return frames;
}

// --- SAD: dot eyes, frown mouth ---
function sadFrames(state: FaceState): Uint8Array[] {
  const frames: Uint8Array[] = [];
  switch (state) {
    case "idle":
      for (let i = 0; i < 30; i++) {
        const f = createFrame();
        if (i >= 28) blinkEyes(f); else dotEyes(f);
        frownMouth(f);
        frames.push(f);
      }
      break;
    case "listening":
      for (let i = 0; i < 8; i++) {
        const f = createFrame();
        dotEyes(f);
        frownMouth(f);
        const b = Math.floor(128 + 127 * Math.sin((i / 8) * Math.PI * 2));
        fr(f, 31, 28, 2, 2, [b, b, b]);
        frames.push(f);
      }
      break;
    case "thinking": {
      const offsets = [-3, -2, -1, 0, 1, 2, 3, 2, 1, 0, -1, -2];
      for (const ox of offsets) {
        const f = createFrame();
        dotEyes(f, ox);
        frownMouth(f);
        frames.push(f);
      }
      break;
    }
    case "speaking":
      for (let i = 0; i < 4; i++) {
        const f = createFrame();
        dotEyes(f);
        if (i % 2 === 0) openMouth(f); else frownMouth(f);
        frames.push(f);
      }
      break;
    default: {
      const f = createFrame();
      dotEyes(f);
      frownMouth(f);
      frames.push(f);
    }
  }
  return frames;
}

// --- HUNGRY: dot eyes, teeth mouth with chewing ---
function hungryFrames(state: FaceState): Uint8Array[] {
  const frames: Uint8Array[] = [];
  switch (state) {
    case "idle":
      for (let i = 0; i < 12; i++) {
        const f = createFrame();
        dotEyes(f);
        if (Math.floor(i / 3) % 2 === 0) teethMouth(f); else lineMouth(f, 16);
        frames.push(f);
      }
      break;
    case "listening":
      for (let i = 0; i < 8; i++) {
        const f = createFrame();
        dotEyes(f);
        teethMouth(f);
        const b = Math.floor(128 + 127 * Math.sin((i / 8) * Math.PI * 2));
        fr(f, 31, 28, 2, 2, [b, b, b]);
        frames.push(f);
      }
      break;
    case "thinking": {
      const offsets = [-3, -2, -1, 0, 1, 2, 3, 2, 1, 0, -1, -2];
      for (const ox of offsets) {
        const f = createFrame();
        dotEyes(f, ox);
        teethMouth(f);
        frames.push(f);
      }
      break;
    }
    case "speaking":
      for (let i = 0; i < 4; i++) {
        const f = createFrame();
        dotEyes(f);
        if (i % 2 === 0) teethMouth(f); else lineMouth(f, 16);
        frames.push(f);
      }
      break;
    default: {
      const f = createFrame();
      dotEyes(f);
      teethMouth(f);
      frames.push(f);
    }
  }
  return frames;
}

// --- IN LOVE: crescent eyes, smile, blush, pulsing hearts ---
function inLoveFrames(state: FaceState): Uint8Array[] {
  const frames: Uint8Array[] = [];
  switch (state) {
    case "idle":
      for (let i = 0; i < 8; i++) {
        const f = createFrame();
        crescentEyes(f);
        drawBlush(f);
        smileMouth(f, 10);
        // Floating hearts that pulse
        if (i % 4 < 2) {
          drawSmallHeart(f, 8, 4, HEART);
          drawSmallHeart(f, 52, 4, HEART);
        } else {
          drawHeart(f, 7, 3, HEART);
          drawHeart(f, 51, 3, HEART);
        }
        frames.push(f);
      }
      break;
    case "listening":
      for (let i = 0; i < 8; i++) {
        const f = createFrame();
        crescentEyes(f);
        drawBlush(f);
        smileMouth(f, 10);
        const b = Math.floor(128 + 127 * Math.sin((i / 8) * Math.PI * 2));
        fr(f, 31, 28, 2, 2, [b, b, b]);
        frames.push(f);
      }
      break;
    case "thinking":
      for (let i = 0; i < 8; i++) {
        const f = createFrame();
        crescentEyes(f);
        drawBlush(f);
        smileMouth(f, 10);
        frames.push(f);
      }
      break;
    case "speaking":
      for (let i = 0; i < 4; i++) {
        const f = createFrame();
        crescentEyes(f);
        drawBlush(f);
        if (i % 2 === 0) openMouth(f, 10, 4); else smileMouth(f, 10);
        frames.push(f);
      }
      break;
    default: {
      const f = createFrame();
      crescentEyes(f);
      drawBlush(f);
      smileMouth(f, 10);
      frames.push(f);
    }
  }
  return frames;
}

// --- SLEEPY: half-closed line eyes, flat mouth, floating Zs ---
function sleepyFrames(state: FaceState): Uint8Array[] {
  const frames: Uint8Array[] = [];
  switch (state) {
    case "idle":
      for (let i = 0; i < 16; i++) {
        const f = createFrame();
        sleepyEyeLines(f);
        lineMouth(f, 8);
        drawZs(f, i);
        frames.push(f);
      }
      break;
    case "listening":
      for (let i = 0; i < 8; i++) {
        const f = createFrame();
        sleepyEyeLines(f);
        lineMouth(f, 8);
        drawZs(f, i);
        const b = Math.floor(128 + 127 * Math.sin((i / 8) * Math.PI * 2));
        fr(f, 31, 28, 2, 2, [b, b, b]);
        frames.push(f);
      }
      break;
    case "thinking":
      for (let i = 0; i < 8; i++) {
        const f = createFrame();
        sleepyEyeLines(f);
        lineMouth(f, 8);
        drawZs(f, i);
        frames.push(f);
      }
      break;
    case "speaking":
      for (let i = 0; i < 4; i++) {
        const f = createFrame();
        sleepyEyeLines(f);
        if (i % 2 === 0) openMouth(f, 8, 4); else lineMouth(f, 8);
        drawZs(f, i);
        frames.push(f);
      }
      break;
    default: {
      const f = createFrame();
      sleepyEyeLines(f);
      lineMouth(f, 8);
      drawZs(f, 0);
      frames.push(f);
    }
  }
  return frames;
}

// --- ERROR: oval eyes, wavy mouth, stress marks on red bg ---
function errorFrames(): Uint8Array[] {
  const f = createFrame(ERROR_BG);
  ovalEyes(f, [255, 255, 255]);
  wavyMouth(f);
  drawStressMarks(f);
  return [f];
}

// --- WARMUP: loading bar ---
function warmupFrames(): Uint8Array[] {
  const frames: Uint8Array[] = [];
  for (let i = 0; i <= 16; i++) {
    const f = createFrame();
    dotEyes(f);
    lineMouth(f);
    const barW = Math.floor((i / 16) * 48);
    fr(f, 8, 28, barW, 2, BAR_COL);
    fr(f, 8, 27, 48, 1, [100, 100, 100]);
    fr(f, 8, 30, 48, 1, [100, 100, 100]);
    frames.push(f);
  }
  return frames;
}

export type FaceState = "idle" | "listening" | "thinking" | "speaking" | "error" | "warmup";

const frameCache = new Map<string, Uint8Array[]>();

export function getFrames(state: FaceState, emotion: Emotion = "normal"): Uint8Array[] {
  const key = `${state}-${emotion}`;
  if (!frameCache.has(key)) {
    frameCache.set(key, generateFrames(state, emotion));
  }
  return frameCache.get(key)!;
}
