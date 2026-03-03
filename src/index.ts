import { BotState, type BotStateType, type Message } from "./config";
import { recordAdaptive } from "./audio/recorder";
import { playRandomSound, stopPlayback } from "./audio/player";
import { waitForWakeWord, startBridge, stopBridge } from "./audio/wake-word";
import { transcribe } from "./stt/whisper";
import { chat, summarize } from "./llm/claude";
import { speak } from "./tts/fish-audio";
import { executeAction, extractJson } from "./tools/router";
import { loadHistory, saveHistory, resetMemory } from "./memory";
import * as renderer from "./display/renderer";

// Sound directories (same structure as original)
const SOUNDS = {
  greeting: "sounds/greeting_sounds",
  ack: "sounds/ack_sounds",
  thinking: "sounds/thinking_sounds",
  error: "sounds/error_sounds",
};

let state: BotStateType = BotState.WARMUP;
let messages: Message[] = loadHistory();

function setState(newState: BotStateType, msg?: string): void {
  if (msg) console.log(`[STATE] ${newState.toUpperCase()}: ${msg}`);
  state = newState;
  renderer.setState(newState as any);
}

async function warmup(): Promise<void> {
  setState(BotState.WARMUP, "Starting up...");
  renderer.start();
  startBridge();
  await playRandomSound(SOUNDS.greeting);
  console.log("[BMO] Ready!");
}

async function mainLoop(): Promise<void> {
  await warmup();

  while (true) {
    try {
      // IDLE — wait for wake word
      setState(BotState.IDLE, "Waiting for wake word...");
      await waitForWakeWord();

      // LISTENING — record audio
      setState(BotState.LISTENING, "I'm listening!");
      await playRandomSound(SOUNDS.ack);
      const audioFile = await recordAdaptive();
      if (!audioFile) {
        setState(BotState.IDLE, "Heard nothing.");
        continue;
      }

      // Transcribe
      setState(BotState.THINKING, "Transcribing...");
      const userText = await transcribe(audioFile);
      if (!userText) {
        setState(BotState.IDLE, "Transcription empty.");
        continue;
      }
      console.log(`[USER] ${userText}`);

      // Check for memory reset command
      if (userText.toLowerCase().includes("forget everything") || userText.toLowerCase().includes("reset memory")) {
        messages = resetMemory();
        await speak("Okay. Memory wiped.");
        continue;
      }

      // Add user message
      messages.push({ role: "user", content: userText });

      // Play thinking sounds in background
      const thinkingActive = { active: true };
      playThinkingSounds(thinkingActive);

      // THINKING — get Claude response
      setState(BotState.THINKING, "Thinking...");
      let fullResponse = "";
      const response = await chat(messages, (chunk) => {
        fullResponse += chunk;
      });
      fullResponse = response;
      thinkingActive.active = false;

      // Check if response is a tool action
      const actionData = extractJson(fullResponse);
      if (actionData && actionData.action) {
        console.log(`[ACTION] ${JSON.stringify(actionData)}`);
        const toolResult = await executeAction(actionData);

        if (toolResult === "INVALID_ACTION") {
          setState(BotState.SPEAKING, "Speaking...");
          await speak("I am not sure how to do that.");
        } else if (toolResult === "SEARCH_EMPTY") {
          setState(BotState.SPEAKING, "Speaking...");
          await speak("I searched, but I could not find anything about that.");
        } else if (toolResult === "SEARCH_ERROR") {
          setState(BotState.SPEAKING, "Speaking...");
          await speak("I cannot reach the internet right now.");
        } else {
          // Summarize tool result and speak it
          setState(BotState.THINKING, "Reading results...");
          const summary = await summarize(toolResult, userText);
          setState(BotState.SPEAKING, "Speaking...");
          await speak(summary);
          messages.push({ role: "assistant", content: summary });
        }
      } else {
        // Normal chat response — speak it
        setState(BotState.SPEAKING, "Speaking...");
        console.log(`[BMO] ${fullResponse}`);
        await speak(fullResponse);
        messages.push({ role: "assistant", content: fullResponse });
      }

      // Save memory
      await saveHistory(messages);
    } catch (e) {
      console.error(`[ERROR] ${e}`);
      setState(BotState.ERROR, `Error: ${String(e).slice(0, 40)}`);
      await playRandomSound(SOUNDS.error);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

async function playThinkingSounds(flag: { active: boolean }): Promise<void> {
  await new Promise((r) => setTimeout(r, 500));
  while (flag.active) {
    await playRandomSound(SOUNDS.thinking);
    // Wait 5 seconds between thinking sounds
    for (let i = 0; i < 50 && flag.active; i++) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n[BMO] Shutting down...");
  stopPlayback();
  stopBridge();
  renderer.stop();
  await saveHistory(messages);
  process.exit(0);
});

process.on("SIGTERM", async () => {
  stopPlayback();
  stopBridge();
  renderer.stop();
  await saveHistory(messages);
  process.exit(0);
});

// Start
mainLoop().catch((e) => {
  console.error(`[FATAL] ${e}`);
  process.exit(1);
});
