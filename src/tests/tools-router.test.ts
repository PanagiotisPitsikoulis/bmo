import { test, expect, describe } from "bun:test";
import { executeAction, extractJson } from "../tools/router";

describe("extractJson", () => {
  test("extracts JSON from a string with JSON", () => {
    const result = extractJson('Here is the result: {"action": "get_time"}');
    expect(result).toEqual({ action: "get_time" });
  });

  test("extracts JSON with multiple fields", () => {
    const result = extractJson('{"action": "search_web", "query": "robots"}');
    expect(result).toEqual({ action: "search_web", query: "robots" });
  });

  test("returns null for plain text", () => {
    const result = extractJson("Hello, I am BMO!");
    expect(result).toBeNull();
  });

  test("returns null for empty string", () => {
    const result = extractJson("");
    expect(result).toBeNull();
  });

  test("returns null for malformed JSON", () => {
    const result = extractJson('{"action": broken}');
    expect(result).toBeNull();
  });

  test("extracts JSON from multiline text", () => {
    const text = `Sure, let me check that for you.
{"action": "search_web", "query": "weather today"}
I'll search for that now.`;
    const result = extractJson(text);
    expect(result).toEqual({ action: "search_web", query: "weather today" });
  });

  test("extracts JSON even when surrounded by other text with braces", () => {
    const text = 'I think {"action": "get_time"} is what you need';
    const result = extractJson(text);
    expect(result).not.toBeNull();
    expect(result!.action).toBe("get_time");
  });
});

describe("executeAction", () => {
  test("returns time for get_time action", async () => {
    const result = await executeAction({ action: "get_time" });
    expect(result).toStartWith("The current time is");
  });

  test("returns INVALID_ACTION for unknown action", async () => {
    const result = await executeAction({ action: "fly_to_moon" });
    expect(result).toBe("INVALID_ACTION");
  });

  test("resolves aliases - google maps to search_web", async () => {
    const result = await executeAction({ action: "google", query: "test" });
    expect(result).not.toBe("INVALID_ACTION");
  });

  test("resolves aliases - check_time maps to get_time", async () => {
    const result = await executeAction({ action: "check_time" });
    expect(result).toStartWith("The current time is");
  });

  test("resolves aliases - news maps to search_web", async () => {
    const result = await executeAction({ action: "news", query: "tech" });
    expect(result).not.toBe("INVALID_ACTION");
  });

  test("resolves aliases - browser maps to search_web", async () => {
    const result = await executeAction({ action: "browser", query: "hello" });
    expect(result).not.toBe("INVALID_ACTION");
  });

  test("resolves aliases - search_news maps to search_web", async () => {
    const result = await executeAction({ action: "search_news", query: "sports" });
    expect(result).not.toBe("INVALID_ACTION");
  });

  test("action is case-insensitive", async () => {
    const result = await executeAction({ action: "GET_TIME" });
    expect(result).toStartWith("The current time is");
  });

  test("action is trimmed", async () => {
    const result = await executeAction({ action: "  get_time  " });
    expect(result).toStartWith("The current time is");
  });

  test("uses value field as fallback for query", async () => {
    const result = await executeAction({ action: "search_web", value: "bun runtime" });
    expect(result).not.toBe("INVALID_ACTION");
  });
});
