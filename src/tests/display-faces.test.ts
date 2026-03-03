import { test, expect, describe } from "bun:test";
import { getFrames, type FaceState } from "../display/faces";
import { WIDTH, HEIGHT, FRAME_SIZE } from "../display/matrix";
import type { Emotion } from "../config";

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

describe("face frame generators (normal emotion)", () => {
  test("idle returns non-empty array with 22 frames", () => {
    const frames = getFrames("idle", "normal");
    expect(frames.length).toBe(22);
  });

  test("listening returns 8 frames", () => {
    const frames = getFrames("listening", "normal");
    expect(frames).toHaveLength(8);
  });

  test("thinking returns 12 frames", () => {
    const frames = getFrames("thinking", "normal");
    expect(frames).toHaveLength(12);
  });

  test("speaking returns 4 frames", () => {
    const frames = getFrames("speaking", "normal");
    expect(frames).toHaveLength(4);
  });

  test("error returns 1 frame", () => {
    const frames = getFrames("error", "normal");
    expect(frames).toHaveLength(1);
  });

  test("warmup returns 17 frames", () => {
    const frames = getFrames("warmup", "normal");
    expect(frames).toHaveLength(17);
  });

  test("all frames have correct byte size", () => {
    const states: FaceState[] = ["idle", "listening", "thinking", "speaking", "error", "warmup"];
    for (const state of states) {
      const frames = getFrames(state, "normal");
      for (const frame of frames) {
        expect(frame.length).toBe(FRAME_SIZE);
      }
    }
  });

  test("all frames are Uint8Array instances", () => {
    const states: FaceState[] = ["idle", "listening", "thinking", "speaking", "error", "warmup"];
    for (const state of states) {
      const frames = getFrames(state, "normal");
      for (const frame of frames) {
        expect(frame).toBeInstanceOf(Uint8Array);
      }
    }
  });

  test("all pixel values are in 0-255 range", () => {
    const frames = getFrames("idle", "normal");
    for (const frame of frames) {
      for (let i = 0; i < frame.length; i++) {
        expect(frame[i]!).toBeGreaterThanOrEqual(0);
        expect(frame[i]!).toBeLessThanOrEqual(255);
      }
    }
  });

  test("idle frames have teal green background (0, 200, 160)", () => {
    const frames = getFrames("idle", "normal");
    const frame = frames[0]!;
    expect(frame[0]).toBe(0);
    expect(frame[1]).toBe(200);
    expect(frame[2]).toBe(160);
  });

  test("error frames have red background (180, 40, 40)", () => {
    const frames = getFrames("error", "normal");
    const frame = frames[0]!;
    expect(frame[0]).toBe(180);
    expect(frame[1]).toBe(40);
    expect(frame[2]).toBe(40);
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
    const frames1 = getFrames("idle", "normal");
    const frames2 = getFrames("idle", "normal");
    expect(frames1).toBe(frames2);
  });

  test("returns different frames for different states", () => {
    const idle = getFrames("idle", "normal");
    const error = getFrames("error", "normal");
    expect(idle.length).not.toBe(error.length);
  });
});

describe("emotion face generators", () => {
  const emotions: Emotion[] = ["normal", "happy", "sad", "hungry", "in_love", "sleepy"];
  const states: FaceState[] = ["idle", "listening", "thinking", "speaking"];

  test("all emotion+state combinations produce valid frames", () => {
    for (const emotion of emotions) {
      for (const state of states) {
        const frames = getFrames(state, emotion);
        expect(frames.length).toBeGreaterThan(0);
        for (const frame of frames) {
          expect(frame.length).toBe(FRAME_SIZE);
          expect(frame).toBeInstanceOf(Uint8Array);
        }
      }
    }
  });

  test("happy idle has 16 frames (bounce animation)", () => {
    expect(getFrames("idle", "happy")).toHaveLength(16);
  });

  test("sad idle has 30 frames (slow blink)", () => {
    expect(getFrames("idle", "sad")).toHaveLength(30);
  });

  test("hungry idle has 12 frames (chewing)", () => {
    expect(getFrames("idle", "hungry")).toHaveLength(12);
  });

  test("in_love idle has 8 frames (heart pulse)", () => {
    expect(getFrames("idle", "in_love")).toHaveLength(8);
  });

  test("sleepy idle has 16 frames (eye droop + Zs)", () => {
    expect(getFrames("idle", "sleepy")).toHaveLength(16);
  });

  test("error overrides emotion", () => {
    const errorNormal = getFrames("error", "normal");
    const errorHappy = getFrames("error", "happy");
    // Both should be 1 frame with red background
    expect(errorNormal).toHaveLength(1);
    expect(errorHappy).toHaveLength(1);
    expect(errorNormal[0]![0]).toBe(180); // red bg
    expect(errorHappy[0]![0]).toBe(180);  // same red bg
  });

  test("different emotions produce different frame data for idle", () => {
    const normal = getFrames("idle", "normal");
    const happy = getFrames("idle", "happy");
    // Different frame counts means different animations
    expect(normal.length).not.toBe(happy.length);
  });

  test("cache key includes emotion", () => {
    const normalIdle = getFrames("idle", "normal");
    const happyIdle = getFrames("idle", "happy");
    expect(normalIdle).not.toBe(happyIdle); // different cache entries
  });
});
