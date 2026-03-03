import { test, expect, describe } from "bun:test";

describe("stt/whisper", () => {
  test("transcribe function is exported", async () => {
    const mod = await import("../stt/whisper");
    expect(typeof mod.transcribe).toBe("function");
  });

  test("transcribe returns empty string for non-existent file", async () => {
    const { transcribe } = await import("../stt/whisper");
    const result = await transcribe("/tmp/nonexistent_audio_file.wav");
    expect(typeof result).toBe("string");
    // Should return empty string on failure, not throw
    expect(result).toBe("");
  });
});
