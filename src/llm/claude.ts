import Anthropic from "@anthropic-ai/sdk";
import { config, SYSTEM_PROMPT, type Message } from "../config";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: config.anthropicApiKey });
  }
  return client;
}

export async function chat(
  messages: Message[],
  onChunk?: (text: string) => void
): Promise<string> {
  const anthropic = getClient();

  const apiMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

  let fullResponse = "";

  const stream = anthropic.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: SYSTEM_PROMPT,
    messages: apiMessages,
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
      const text = event.delta.text;
      fullResponse += text;
      onChunk?.(text);
    }
  }

  return fullResponse;
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
