import { join } from "path";

const BRIDGE_PATH = join(import.meta.dir, "matrix-bridge.py");
const WIDTH = 64;
const HEIGHT = 32;
const FRAME_SIZE = WIDTH * HEIGHT * 3;

export { WIDTH, HEIGHT, FRAME_SIZE };

let process: ReturnType<typeof Bun.spawn> | null = null;

export function start(): void {
  if (process) return;
  process = Bun.spawn(["sudo", "python3", BRIDGE_PATH], {
    stdin: "pipe",
    stdout: "ignore",
    stderr: "inherit",
  });
}

export function sendFrame(pixels: Uint8Array): void {
  if (!process) return;
  if (pixels.length !== FRAME_SIZE) {
    console.error(`[MATRIX] Bad frame size: ${pixels.length}, expected ${FRAME_SIZE}`);
    return;
  }
  const stdin = process.stdin;
  if (stdin && typeof stdin !== "number") {
    (stdin as import("bun").FileSink).write(pixels);
  }
}

export function stop(): void {
  if (process) {
    process.kill();
    process = null;
  }
}
