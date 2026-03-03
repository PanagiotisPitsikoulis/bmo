import { test, expect, describe } from "bun:test";
import { textToSpeech } from "../tts/fish-audio";
import { config } from "../config";

describe("textToSpeech", () => {
  const hasApiKey = config.fishAudioApiKey.length > 0;

  test.skipIf(!hasApiKey)("returns a Buffer for valid text", async () => {
    const result = await textToSpeech("Hello world");
    expect(result).toBeInstanceOf(Buffer);
    expect(result.length).toBeGreaterThan(0);
  });

  test.skipIf(!hasApiKey)("returned buffer starts with RIFF header (WAV format)", async () => {
    const result = await textToSpeech("Test");
    const header = result.subarray(0, 4).toString("ascii");
    expect(header).toBe("RIFF");
  });

  test.skipIf(!hasApiKey)("throws on empty API key", async () => {
    // This test validates the error handling when API returns an error
    const originalKey = config.fishAudioApiKey;
    (config as any).fishAudioApiKey = "";
    try {
      await expect(textToSpeech("test")).rejects.toThrow();
    } finally {
      (config as any).fishAudioApiKey = originalKey;
    }
  });

  test("speak function is exported", async () => {
    const mod = await import("../tts/fish-audio");
    expect(typeof mod.speak).toBe("function");
    expect(typeof mod.textToSpeech).toBe("function");
  });
});
