import { config } from "../config";

export async function transcribe(wavPath: string): Promise<string> {
  console.log("[STT] Transcribing...");
  try {
    const proc = Bun.spawn(
      [config.whisperCliPath, "-m", config.whisperModelPath, "-l", "en", "-t", "4", "-f", wavPath],
      { stdout: "pipe", stderr: "ignore" }
    );

    const output = await new Response(proc.stdout).text();
    await proc.exited;

    const lines = output.trim().split("\n");
    if (lines.length === 0) return "";

    const lastLine = lines[lines.length - 1]!.trim();
    // Whisper output format: [timestamp] text
    const text = lastLine.includes("]") ? lastLine.split("]").pop()!.trim() : lastLine;
    console.log(`[STT] Heard: '${text}'`);
    return text;
  } catch (e) {
    console.error(`[STT] Error: ${e}`);
    return "";
  }
}
