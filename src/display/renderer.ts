import * as matrix from "./matrix";
import { getFrames, type FaceState } from "./faces";

let currentState: FaceState = "warmup";
let frameIndex = 0;
let timer: ReturnType<typeof setInterval> | null = null;

const FPS = 10;

function tick(): void {
  const frames = getFrames(currentState);
  if (frames.length === 0) return;

  frameIndex = frameIndex % frames.length;
  matrix.sendFrame(frames[frameIndex]!);
  frameIndex++;
}

export function start(): void {
  matrix.start();
  timer = setInterval(tick, 1000 / FPS);
}

export function setState(state: FaceState): void {
  if (state !== currentState) {
    currentState = state;
    frameIndex = 0;
  }
}

export function getState(): FaceState {
  return currentState;
}

export function stop(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  matrix.stop();
}
