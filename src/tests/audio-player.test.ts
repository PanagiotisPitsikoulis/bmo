import { test, expect, describe } from "bun:test";

describe("audio/player", () => {
  test("all functions are exported", async () => {
    const mod = await import("../audio/player");
    expect(typeof mod.playWav).toBe("function");
    expect(typeof mod.playPCM).toBe("function");
    expect(typeof mod.playRandomSound).toBe("function");
    expect(typeof mod.stopPlayback).toBe("function");
  });

  test("playRandomSound handles non-existent directory gracefully", async () => {
    const { playRandomSound } = await import("../audio/player");
    // Should not throw
    await expect(playRandomSound("/tmp/nonexistent_bmo_sounds")).resolves.toBeUndefined();
  });

  test("playRandomSound handles empty directory gracefully", async () => {
    const { playRandomSound } = await import("../audio/player");
    const tmpDir = "/tmp/bmo_test_empty_sounds";
    const { mkdirSync, existsSync, rmdirSync } = await import("fs");
    if (!existsSync(tmpDir)) mkdirSync(tmpDir);
    try {
      await expect(playRandomSound(tmpDir)).resolves.toBeUndefined();
    } finally {
      try { rmdirSync(tmpDir); } catch {}
    }
  });

  test("stopPlayback does not throw when nothing is playing", () => {
    const { stopPlayback } = require("../audio/player");
    expect(() => stopPlayback()).not.toThrow();
  });
});
