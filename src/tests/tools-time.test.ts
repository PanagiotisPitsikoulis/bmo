import { test, expect, describe } from "bun:test";
import { getTime } from "../tools/time";

describe("getTime", () => {
  test("returns a string", () => {
    const result = getTime();
    expect(typeof result).toBe("string");
  });

  test("starts with 'The current time is'", () => {
    const result = getTime();
    expect(result).toStartWith("The current time is");
  });

  test("ends with a period", () => {
    const result = getTime();
    expect(result).toEndWith(".");
  });

  test("contains AM or PM", () => {
    const result = getTime();
    expect(result).toMatch(/AM|PM/);
  });

  test("contains a colon-separated time", () => {
    const result = getTime();
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  test("returns current time (not stale)", () => {
    const before = new Date();
    const result = getTime();
    const after = new Date();

    // Extract the hour from the result
    const hourMatch = result.match(/(\d{1,2}):\d{2}/);
    expect(hourMatch).not.toBeNull();

    const resultHour = parseInt(hourMatch![1]!);
    const beforeHour = before.getHours() % 12 || 12;
    const afterHour = after.getHours() % 12 || 12;

    // The hour in the result should match the current hour
    expect(resultHour === beforeHour || resultHour === afterHour).toBe(true);
  });
});
