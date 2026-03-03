import { test, expect, describe } from "bun:test";
import { config } from "../config";

describe("llm/claude", () => {
  // Skip API tests — they require a funded API key and make real requests
  const skipApi = true;

  test("chat and summarize functions are exported", async () => {
    const mod = await import("../llm/claude");
    expect(typeof mod.chat).toBe("function");
    expect(typeof mod.summarize).toBe("function");
  });

  test.skipIf(skipApi)("chat returns a non-empty string", async () => {
    const { chat } = await import("../llm/claude");
    const messages = [
      { role: "system" as const, content: "You are a test bot. Reply with exactly: OK" },
      { role: "user" as const, content: "Test" },
    ];

    const result = await chat(messages);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  test.skipIf(skipApi)("chat calls onChunk callback", async () => {
    const { chat } = await import("../llm/claude");
    const messages = [
      { role: "system" as const, content: "Reply with: hello" },
      { role: "user" as const, content: "Test" },
    ];

    const chunks: string[] = [];
    await chat(messages, (chunk) => chunks.push(chunk));
    expect(chunks.length).toBeGreaterThan(0);
  });

  test.skipIf(skipApi)("chat filters out system messages from API call", async () => {
    const { chat } = await import("../llm/claude");
    // This should not throw even with system messages in the array
    const messages = [
      { role: "system" as const, content: "System prompt" },
      { role: "user" as const, content: "Say OK" },
    ];

    const result = await chat(messages);
    expect(typeof result).toBe("string");
  });

  test.skipIf(skipApi)("summarize returns a non-empty string", async () => {
    const { summarize } = await import("../llm/claude");
    const result = await summarize(
      "The current time is 3:45 PM.",
      "What time is it?"
    );
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });
});
