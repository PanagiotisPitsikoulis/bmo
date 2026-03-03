import { test, expect, describe } from "bun:test";
import { WIDTH, HEIGHT, FRAME_SIZE } from "../display/matrix";

describe("display/matrix constants", () => {
  test("WIDTH is 64 pixels", () => {
    expect(WIDTH).toBe(64);
  });

  test("HEIGHT is 32 pixels", () => {
    expect(HEIGHT).toBe(32);
  });

  test("FRAME_SIZE is correct for RGB (3 bytes per pixel)", () => {
    expect(FRAME_SIZE).toBe(WIDTH * HEIGHT * 3);
    expect(FRAME_SIZE).toBe(6144);
  });
});

describe("display/matrix functions", () => {
  test("all functions are exported", async () => {
    const mod = await import("../display/matrix");
    expect(typeof mod.start).toBe("function");
    expect(typeof mod.sendFrame).toBe("function");
    expect(typeof mod.stop).toBe("function");
  });

  test("sendFrame does not throw when matrix is not started", () => {
    const { sendFrame } = require("../display/matrix");
    const frame = new Uint8Array(FRAME_SIZE);
    // Should silently do nothing since process is null
    expect(() => sendFrame(frame)).not.toThrow();
  });

  test("stop does not throw when matrix is not started", () => {
    const { stop } = require("../display/matrix");
    expect(() => stop()).not.toThrow();
  });
});
