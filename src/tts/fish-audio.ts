import { config } from "../config";
import { playWav } from "../audio/player";

const TMP_TTS = "/tmp/bmo_tts.wav";

export async function textToSpeech(text: string): Promise<Buffer> {
  const response = await fetch("https://api.fish.audio/v1/tts", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${config.fishAudioApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text,
      reference_id: config.bmoVoiceId,
      format: "wav",
      latency: "balanced",
    }),
  });

  if (!response.ok) {
    throw new Error(`Fish Audio error: ${response.status} ${response.statusText}`);
  }

  return Buffer.from(await response.arrayBuffer());
}

export async function speak(text: string): Promise<void> {
  // Clean text for speech (strip non-speech characters)
  const clean = text.replace(/[^\w\s,.!?:'-]/g, "").trim();
  if (!clean) return;

  console.log(`[TTS] Speaking: '${clean}'`);
  const audio = await textToSpeech(clean);
  await Bun.write(TMP_TTS, audio);
  await playWav(TMP_TTS);
}
