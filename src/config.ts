import { join } from "path";

const CONFIG_FILE = join(import.meta.dir, "..", "config.json");

export interface Config {
  anthropicApiKey: string;
  fishAudioApiKey: string;
  bmoVoiceId: string;
  silenceThreshold: number;
  silenceDuration: number;
  maxRecordTime: number;
  wakeWordThreshold: number;
  whisperModelPath: string;
  whisperCliPath: string;
  wakeWordModelPath: string;
  systemPromptExtras: string;
}

const defaults = {
  silenceThreshold: 0.006,
  silenceDuration: 1.5,
  maxRecordTime: 30,
  wakeWordThreshold: 0.5,
  whisperModelPath: "./whisper.cpp/models/ggml-base.en.bin",
  whisperCliPath: "./whisper.cpp/build/bin/whisper-cli",
  wakeWordModelPath: "./wakeword.onnx",
  systemPromptExtras: "",
};

function loadFileConfig(): Partial<Config> {
  try {
    const file = Bun.file(CONFIG_FILE);
    // Synchronous check isn't available, use a blocking approach
    return JSON.parse(require("fs").readFileSync(CONFIG_FILE, "utf-8"));
  } catch {
    return {};
  }
}

const fileConfig = loadFileConfig();

export const config: Config = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  fishAudioApiKey: process.env.FISH_AUDIO_API_KEY ?? "",
  bmoVoiceId: process.env.BMO_VOICE_ID ?? "",
  ...defaults,
  ...fileConfig,
};

export const BotState = {
  WARMUP: "warmup",
  IDLE: "idle",
  LISTENING: "listening",
  THINKING: "thinking",
  SPEAKING: "speaking",
  ERROR: "error",
} as const;

export type BotStateType = (typeof BotState)[keyof typeof BotState];

export const SYSTEM_PROMPT = `You are BMO, a helpful robot assistant running on a Raspberry Pi.
Personality: Cute, helpful, enthusiastic robot.
Style: Short sentences. Enthusiastic.

INSTRUCTIONS:
- If the user asks for a physical action (time, search), output JSON.
- If the user just wants to chat, reply with NORMAL TEXT.

### EXAMPLES ###

User: What time is it?
You: {"action": "get_time"}

User: Hello!
You: Hi! I am ready to help!

User: Search for news about robots.
You: {"action": "search_web", "query": "robots news"}

### END EXAMPLES ###
${config.systemPromptExtras}`;

export interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}
