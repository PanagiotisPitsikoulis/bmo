import { test, expect, describe } from "bun:test";
import {
  idleFrames,
  listeningFrames,
  thinkingFrames,
  speakingFrames,
  errorFrames,
  warmupFrames,
  getFrames,
  type FaceState,
} from "../display/faces";
import { WIDTH, HEIGHT, FRAME_SIZE } from "../display/matrix";

describe("display constants", () => {
  test("WIDTH is 64", () => {
    expect(WIDTH).toBe(64);
  });

  test("HEIGHT is 32", () => {
    expect(HEIGHT).toBe(32);
  });

  test("FRAME_SIZE is WIDTH * HEIGHT * 3 (RGB)", () => {
    expect(FRAME_SIZE).toBe(64 * 32 * 3);
  });
});

describe("face frame generators", () => {
  test("idleFrames returns non-empty array", () => {
    const frames = idleFrames();
    expect(frames.length).toBeGreaterThan(0);
  });

  test("idleFrames has 22 frames (20 normal + 2 blink)", () => {
    const frames = idleFrames();
    expect(frames).toHaveLength(22);
  });

  test("listeningFrames returns 8 frames", () => {
    const frames = listeningFrames();
    expect(frames).toHaveLength(8);
  });

  test("thinkingFrames returns 12 frames", () => {
    const frames = thinkingFrames();
    expect(frames).toHaveLength(12);
  });

  test("speakingFrames returns 4 frames", () => {
    const frames = speakingFrames();
    expect(frames).toHaveLength(4);
  });

  test("errorFrames returns 1 frame", () => {
    const frames = errorFrames();
    expect(frames).toHaveLength(1);
  });

  test("warmupFrames returns 17 frames (0 to 16 inclusive)", () => {
    const frames = warmupFrames();
    expect(frames).toHaveLength(17);
  });

  test("all frames have correct byte size", () => {
    const allFrameSets = [
      idleFrames(),
      listeningFrames(),
      thinkingFrames(),
      speakingFrames(),
      errorFrames(),
      warmupFrames(),
    ];

    for (const frames of allFrameSets) {
      for (const frame of frames) {
        expect(frame.length).toBe(FRAME_SIZE);
      }
    }
  });

  test("all frames are Uint8Array instances", () => {
    const allFrameSets = [
      idleFrames(),
      listeningFrames(),
      thinkingFrames(),
      speakingFrames(),
      errorFrames(),
      warmupFrames(),
    ];

    for (const frames of allFrameSets) {
      for (const frame of frames) {
        expect(frame).toBeInstanceOf(Uint8Array);
      }
    }
  });

  test("all pixel values are in 0-255 range", () => {
    const frames = idleFrames();
    for (const frame of frames) {
      for (let i = 0; i < frame.length; i++) {
        expect(frame[i]!).toBeGreaterThanOrEqual(0);
        expect(frame[i]!).toBeLessThanOrEqual(255);
      }
    }
  });

  test("idle frames have teal green background (0, 200, 160)", () => {
    const frames = idleFrames();
    const frame = frames[0]!;
    // Check pixel at (0,0) which should be background
    expect(frame[0]).toBe(0);   // R
    expect(frame[1]).toBe(200); // G
    expect(frame[2]).toBe(160); // B
  });

  test("error frames have red background (180, 40, 40)", () => {
    const frames = errorFrames();
    const frame = frames[0]!;
    // Check pixel at (0,0) which should be background
    expect(frame[0]).toBe(180); // R
    expect(frame[1]).toBe(40);  // G
    expect(frame[2]).toBe(40);  // B
  });
});

describe("getFrames", () => {
  test("returns frames for all valid states", () => {
    const states: FaceState[] = ["idle", "listening", "thinking", "speaking", "error", "warmup"];
    for (const state of states) {
      const frames = getFrames(state);
      expect(frames.length).toBeGreaterThan(0);
    }
  });

  test("caches frames on subsequent calls", () => {
    const frames1 = getFrames("idle");
    const frames2 = getFrames("idle");
    expect(frames1).toBe(frames2); // same reference
  });

  test("returns different frames for different states", () => {
    const idle = getFrames("idle");
    const error = getFrames("error");
    expect(idle.length).not.toBe(error.length);
  });
});
