import { SYSTEM_PROMPT, type Message } from "./config";

const MEMORY_FILE = "memory.json";
const MAX_EXCHANGES = 10; // Keep last 10 user+assistant pairs

export function loadHistory(): Message[] {
  try {
    const data = require("fs").readFileSync(MEMORY_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [{ role: "system", content: SYSTEM_PROMPT }];
  }
}

export async function saveHistory(messages: Message[]): Promise<void> {
  // Keep system prompt + last N exchanges
  const system = messages[0];
  const conversation = messages.slice(1);
  const trimmed = conversation.slice(-MAX_EXCHANGES * 2);
  const toSave = system ? [system, ...trimmed] : trimmed;
  await Bun.write(MEMORY_FILE, JSON.stringify(toSave, null, 2));
}

export function resetMemory(): Message[] {
  const fresh = [{ role: "system" as const, content: SYSTEM_PROMPT }];
  Bun.write(MEMORY_FILE, JSON.stringify(fresh, null, 2));
  return fresh;
}
