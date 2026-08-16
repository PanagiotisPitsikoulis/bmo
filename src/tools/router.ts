import { getTime } from "./time";
import { searchWeb } from "./web-search";
import { saveMemory, recallMemories } from "../memory-store";
import type { Emotion } from "../config";

const ALIASES: Record<string, string> = {
  google: "search_web",
  browser: "search_web",
  news: "search_web",
  search_news: "search_web",
  check_time: "get_time",
  remember: "save_memory",
  recall: "recall_memory",
};

export interface ActionData {
  action?: string;
  emotion?: string;
  value?: string;
  query?: string;
  category?: "fact" | "note" | "journal";
  content?: string;
  tags?: string[];
}

export async function executeAction(data: ActionData): Promise<string> {
  if (!data.action) return "INVALID_ACTION";
  const rawAction = data.action.toLowerCase().trim();
  const action = ALIASES[rawAction] ?? rawAction;
  const value = data.value ?? data.query ?? "";

  console.log(`[TOOLS] Action: ${rawAction} -> ${action}`);

  switch (action) {
    case "get_time":
      return getTime();
    case "search_web":
      return await searchWeb(value);
    case "save_memory": {
      const content = data.content ?? data.value ?? "";
      if (!content) return "MEMORY_EMPTY";
      const category = data.category ?? "note";
      const tags = data.tags ?? [];
      saveMemory(content, category, tags);
      console.log(`[MEMORY] Saved ${category}: ${content}`);
      return `MEMORY_SAVED: ${content}`;
    }
    case "recall_memory": {
      const memories = recallMemories(value, 5);
      if (memories.length === 0) return "NO_MEMORIES_FOUND";
      return memories.map((m) => `[${m.category}] ${m.content}`).join("\n");
    }
    default:
      return "INVALID_ACTION";
  }
}

const VALID_EMOTIONS: Emotion[] = ["normal", "happy", "sad", "hungry", "in_love", "sleepy"];

export function extractEmotion(text: string): Emotion | null {
  const json = extractJson(text);
  if (json?.emotion && VALID_EMOTIONS.includes(json.emotion as Emotion)) {
    return json.emotion as Emotion;
  }
  return null;
}

export function extractJson(text: string): ActionData | null {
  try {
    const match = text.match(/\{.*\}/s);
    if (match) return JSON.parse(match[0]);
    return null;
  } catch {
    return null;
  }
}

export function stripJson(text: string): string {
  return text.replace(/\{[^}]*\}\s*/s, "").trim();
}
