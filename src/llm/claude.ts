import Anthropic from "@anthropic-ai/sdk";
import { config, SYSTEM_PROMPT, type Message } from "../config";
import { getMemorySummary, recallMemories } from "../memory-store";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: config.anthropicApiKey });
  }
  return client;
}

function buildSystemPrompt(messages: Message[]): string {
  let prompt = SYSTEM_PROMPT;

  const memorySummary = getMemorySummary();
  if (memorySummary) prompt += memorySummary;

  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
  if (lastUserMsg) {
    const relevant = recallMemories(lastUserMsg.content, 5);
    if (relevant.length > 0) {
      prompt += "\n\nRelevant memories for this conversation:\n";
      for (const m of relevant) {
        prompt += `- [${m.category}] ${m.content}\n`;
      }
    }
  }

  return prompt;
}

export async function chat(messages: Message[]): Promise<string> {
  const anthropic = getClient();

  const apiMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: buildSystemPrompt(messages),
    messages: apiMessages,
  });

  const block = response.content[0];
  return block?.type === "text" ? block.text : "";
}

export async function summarize(result: string, question: string): Promise<string> {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 150,
    system: "Summarize this result in one short sentence for a voice assistant to speak aloud.",
    messages: [
      { role: "user", content: `RESULT: ${result}\nUser Question: ${question}` },
    ],
  });

  const block = response.content[0];
  return block?.type === "text" ? block.text : "";
}
