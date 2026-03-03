import { test, expect, describe } from "bun:test";

describe("audio/wake-word", () => {
  test("all functions are exported", async () => {
    const mod = await import("../audio/wake-word");
    expect(typeof mod.startBridge).toBe("function");
    expect(typeof mod.waitForWakeWord).toBe("function");
    expect(typeof mod.stopBridge).toBe("function");
  });

  test("stopBridge does not throw when no bridge is running", () => {
    const { stopBridge } = require("../audio/wake-word");
    expect(() => stopBridge()).not.toThrow();
  });

  test("stopBridge can be called multiple times safely", () => {
    const { stopBridge } = require("../audio/wake-word");
    expect(() => {
      stopBridge();
      stopBridge();
      stopBridge();
    }).not.toThrow();
  });
});
