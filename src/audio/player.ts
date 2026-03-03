import { readdirSync } from "fs";
import { join } from "path";

let currentProcess: ReturnType<typeof Bun.spawn> | null = null;

export async function playWav(filePath: string): Promise<void> {
  try {
    currentProcess = Bun.spawn(["aplay", "-q", filePath], {
      stdout: "ignore",
      stderr: "ignore",
    });
    await currentProcess.exited;
  } catch {
    // playback failed or was interrupted
  } finally {
    currentProcess = null;
  }
}

export async function playPCM(data: Buffer, sampleRate: number = 16000): Promise<void> {
  const tmp = "/tmp/bmo_tts_output.wav";
  // Write as raw, play with format flags
  await Bun.write(tmp, data);
  try {
    currentProcess = Bun.spawn(
      ["aplay", "-q", tmp],
      { stdout: "ignore", stderr: "ignore" }
    );
    await currentProcess.exited;
  } catch {
    // interrupted
  } finally {
    currentProcess = null;
  }
}

export async function playRandomSound(directory: string): Promise<void> {
  try {
    const files = readdirSync(directory).filter((f) => f.endsWith(".wav"));
    if (files.length === 0) return;
    const pick = files[Math.floor(Math.random() * files.length)]!;
    await playWav(join(directory, pick));
  } catch {
    // directory doesn't exist or is empty
  }
}

export function stopPlayback(): void {
  if (currentProcess) {
    currentProcess.kill();
    currentProcess = null;
  }
}
