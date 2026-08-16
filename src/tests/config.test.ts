import { test, expect, describe } from "bun:test";
import { config, BotState, SYSTEM_PROMPT, type Config, type BotStateType, type Message } from "../config";

describe("config", () => {
  test("config object has all required keys", () => {
    const keys: (keyof Config)[] = [
      "anthropicApiKey",
      "fishAudioApiKey",
      "bmoVoiceId",
      "silenceThreshold",
      "silenceDuration",
      "maxRecordTime",
      "wakeWordThreshold",
      "whisperModelPath",
      "whisperCliPath",
      "wakeWordModelPath",
      "systemPromptExtras",
    ];
    for (const key of keys) {
      expect(config).toHaveProperty(key);
    }
  });

  test("config has correct default values", () => {
    expect(config.silenceThreshold).toBe(0.006);
    expect(config.silenceDuration).toBe(1.5);
    expect(config.maxRecordTime).toBe(30);
    expect(config.wakeWordThreshold).toBe(0.5);
    expect(config.whisperModelPath).toBe("./whisper.cpp/models/ggml-base.en.bin");
    expect(config.whisperCliPath).toBe("./whisper.cpp/build/bin/whisper-cli");
    expect(config.wakeWordModelPath).toBe("./wakeword.onnx");
    expect(config.systemPromptExtras).toBe("");
  });

  test("config reads env vars for API keys", () => {
    expect(typeof config.anthropicApiKey).toBe("string");
    expect(typeof config.fishAudioApiKey).toBe("string");
    expect(typeof config.bmoVoiceId).toBe("string");
  });
});

describe("BotState", () => {
  test("has all expected states", () => {
    expect(BotState.WARMUP).toBe("warmup");
    expect(BotState.IDLE).toBe("idle");
    expect(BotState.LISTENING).toBe("listening");
    expect(BotState.THINKING).toBe("thinking");
    expect(BotState.SPEAKING).toBe("speaking");
    expect(BotState.ERROR).toBe("error");
  });

  test("has exactly 6 states", () => {
    expect(Object.keys(BotState)).toHaveLength(6);
  });
});

describe("SYSTEM_PROMPT", () => {
  test("is a non-empty string", () => {
    expect(typeof SYSTEM_PROMPT).toBe("string");
    expect(SYSTEM_PROMPT.length).toBeGreaterThan(0);
  });

  test("contains B-MO personality", () => {
    expect(SYSTEM_PROMPT).toContain("B-MO");
  });

  test("contains action examples", () => {
    expect(SYSTEM_PROMPT).toContain("get_time");
    expect(SYSTEM_PROMPT).toContain("search_web");
  });

  test("includes system prompt extras from config", () => {
    expect(SYSTEM_PROMPT).toContain(config.systemPromptExtras);
  });
});

describe("Message type", () => {
  test("accepts valid message objects", () => {
    const msg: Message = { role: "user", content: "hello" };
    expect(msg.role).toBe("user");
    expect(msg.content).toBe("hello");
  });

  test("accepts all valid roles", () => {
    const roles: Message["role"][] = ["user", "assistant", "system"];
    for (const role of roles) {
      const msg: Message = { role, content: "test" };
      expect(msg.role).toBe(role);
    }
  });
});
