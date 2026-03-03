import { join } from "path";
import { config } from "../config";

const BRIDGE_SCRIPT = join(import.meta.dir, "..", "display", "..", "audio", "wake-word-bridge.py");

let bridgeProcess: ReturnType<typeof Bun.spawn> | null = null;

export function startBridge(): void {
  if (bridgeProcess) return;

  const scriptPath = join(import.meta.dir, "wake-word-bridge.py");
  bridgeProcess = Bun.spawn(
    ["python3", scriptPath, config.wakeWordModelPath, String(config.wakeWordThreshold)],
    { stdout: "pipe", stderr: "ignore" }
  );
}

export async function waitForWakeWord(): Promise<void> {
  if (!bridgeProcess) startBridge();
  if (!bridgeProcess) throw new Error("Failed to start wake word bridge");

  const stdout = bridgeProcess.stdout;
  if (!stdout || typeof stdout === "number") throw new Error("No stdout from bridge");
  const reader = (stdout as ReadableStream<Uint8Array>).getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) throw new Error("Wake word bridge exited");

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop()!;

    for (const line of lines) {
      if (line.trim() === "WAKE") {
        // Release the reader lock so we can read again next time
        reader.releaseLock();
        return;
      }
    }
  }
}

export function stopBridge(): void {
  if (bridgeProcess) {
    bridgeProcess.kill();
    bridgeProcess = null;
  }
}
