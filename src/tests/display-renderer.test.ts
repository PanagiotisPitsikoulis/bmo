import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import * as renderer from "../display/renderer";

describe("renderer", () => {
  describe("setState", () => {
    test("changes state", () => {
      renderer.setState("idle");
      expect(renderer.getState()).toBe("idle");

      renderer.setState("thinking");
      expect(renderer.getState()).toBe("thinking");
    });

    test("updates to all valid states", () => {
      const states = ["idle", "listening", "thinking", "speaking", "error", "warmup"] as const;
      for (const state of states) {
        renderer.setState(state);
        expect(renderer.getState()).toBe(state);
      }
    });

    test("setting same state does not throw", () => {
      renderer.setState("idle");
      expect(() => renderer.setState("idle")).not.toThrow();
    });
  });

  describe("getState", () => {
    test("returns current state as string", () => {
      renderer.setState("speaking");
      const state = renderer.getState();
      expect(typeof state).toBe("string");
      expect(state).toBe("speaking");
    });
  });
});
