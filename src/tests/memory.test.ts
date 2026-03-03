import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { loadHistory, saveHistory, resetMemory } from "../memory";
import { SYSTEM_PROMPT, type Message } from "../config";
import { existsSync, unlinkSync } from "fs";

const MEMORY_FILE = "memory.json";

function cleanup() {
  try {
    if (existsSync(MEMORY_FILE)) unlinkSync(MEMORY_FILE);
  } catch {}
}

describe("memory", () => {
  beforeEach(cleanup);
  afterEach(cleanup);

  describe("loadHistory", () => {
    test("returns default history when no file exists", () => {
      const history = loadHistory();
      expect(history).toHaveLength(1);
      expect(history[0]!.role).toBe("system");
      expect(history[0]!.content).toBe(SYSTEM_PROMPT);
    });

    test("loads history from file when it exists", async () => {
      const messages: Message[] = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: "hello" },
        { role: "assistant", content: "hi there!" },
      ];
      await Bun.write(MEMORY_FILE, JSON.stringify(messages));

      const history = loadHistory();
      expect(history).toHaveLength(3);
      expect(history[1]!.role).toBe("user");
      expect(history[1]!.content).toBe("hello");
      expect(history[2]!.role).toBe("assistant");
      expect(history[2]!.content).toBe("hi there!");
    });

    test("returns default history when file is corrupted", async () => {
      await Bun.write(MEMORY_FILE, "not valid json{{{");

      const history = loadHistory();
      expect(history).toHaveLength(1);
      expect(history[0]!.role).toBe("system");
    });
  });

  describe("saveHistory", () => {
    test("saves messages to file", async () => {
      const messages: Message[] = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: "test" },
        { role: "assistant", content: "response" },
      ];

      await saveHistory(messages);

      const raw = await Bun.file(MEMORY_FILE).text();
      const saved = JSON.parse(raw);
      expect(saved).toHaveLength(3);
    });

    test("trims conversation to last 10 exchanges (20 messages)", async () => {
      const messages: Message[] = [{ role: "system", content: SYSTEM_PROMPT }];
      // Add 15 exchanges = 30 messages
      for (let i = 0; i < 15; i++) {
        messages.push({ role: "user", content: `question ${i}` });
        messages.push({ role: "assistant", content: `answer ${i}` });
      }

      await saveHistory(messages);

      const raw = await Bun.file(MEMORY_FILE).text();
      const saved = JSON.parse(raw);
      // system + last 20 messages = 21
      expect(saved).toHaveLength(21);
      // Should keep the latest exchanges, not the earliest
      expect(saved[1].content).toBe("question 5");
    });

    test("preserves system prompt as first message", async () => {
      const messages: Message[] = [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: "hey" },
      ];

      await saveHistory(messages);

      const raw = await Bun.file(MEMORY_FILE).text();
      const saved = JSON.parse(raw);
      expect(saved[0].role).toBe("system");
      expect(saved[0].content).toBe(SYSTEM_PROMPT);
    });
  });

  describe("resetMemory", () => {
    test("returns fresh history with only system prompt", () => {
      const fresh = resetMemory();
      expect(fresh).toHaveLength(1);
      expect(fresh[0]!.role).toBe("system");
      expect(fresh[0]!.content).toBe(SYSTEM_PROMPT);
    });

    test("writes fresh history to file", async () => {
      // First save some history
      await Bun.write(
        MEMORY_FILE,
        JSON.stringify([
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: "old stuff" },
        ])
      );

      resetMemory();

      const raw = await Bun.file(MEMORY_FILE).text();
      const saved = JSON.parse(raw);
      expect(saved).toHaveLength(1);
      expect(saved[0].role).toBe("system");
    });
  });
});
