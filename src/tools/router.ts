import { getTime } from "./time";
import { searchWeb } from "./web-search";

const ALIASES: Record<string, string> = {
  google: "search_web",
  browser: "search_web",
  news: "search_web",
  search_news: "search_web",
  check_time: "get_time",
};

interface ActionData {
  action: string;
  value?: string;
  query?: string;
}

export async function executeAction(data: ActionData): Promise<string> {
  const rawAction = data.action.toLowerCase().trim();
  const action = ALIASES[rawAction] ?? rawAction;
  const value = data.value ?? data.query ?? "";

  console.log(`[TOOLS] Action: ${rawAction} -> ${action}`);

  switch (action) {
    case "get_time":
      return getTime();
    case "search_web":
      return await searchWeb(value);
    default:
      return "INVALID_ACTION";
  }
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
