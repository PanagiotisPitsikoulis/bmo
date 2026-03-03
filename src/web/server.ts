import { chat, summarize } from "../llm/claude";
import { textToSpeech } from "../tts/fish-audio";
import { executeAction, extractJson, extractEmotion, stripJson } from "../tools/router";
import type { Message, Emotion } from "../config";
import index from "./index.html";

const EMOTION_COOLDOWN_MESSAGES = 3;

function parseApiError(e: unknown): string {
	const msg = String(e);
	if (msg.includes("credit balance is too low"))
		return "Claude API: No credits. Add billing at console.anthropic.com";
	if (msg.includes("invalid x-api-key") || msg.includes("invalid_api_key"))
		return "Claude API: Invalid API key. Check ANTHROPIC_API_KEY in .env";
	if (msg.includes("authentication_error"))
		return "Claude API: Authentication failed. Check your API key.";
	if (msg.includes("rate_limit"))
		return "Claude API: Rate limited. Wait a moment and try again.";
	if (msg.includes("overloaded"))
		return "Claude API: Overloaded. Try again in a few seconds.";
	if (msg.includes("Fish Audio") || msg.includes("api.fish.audio"))
		return `Fish Audio TTS: ${msg.includes("401") ? "Invalid API key. Check FISH_AUDIO_API_KEY" : msg.includes("402") ? "No credits" : "Request failed"}`;
	return msg;
}

interface Connection {
	messages: Message[];
	emotion: Emotion;
	messagesSinceEmotionChange: number;
}

const connections = new Map<unknown, Connection>();

const server = Bun.serve({
	port: parseInt(process.env.PORT ?? "3000"),
	routes: {
		"/": index,
	},
	async fetch(req, server) {
		const url = new URL(req.url);
		if (url.pathname === "/ws") {
			if (server.upgrade(req)) return;
			return new Response("WebSocket upgrade failed", { status: 500 });
		}
		if (url.pathname.startsWith("/assets/")) {
			const file = Bun.file(`./src/web${url.pathname}`);
			if (await file.exists()) return new Response(file);
		}
		return new Response("Not Found", { status: 404 });
	},
	websocket: {
		open(ws) {
			connections.set(ws, { messages: [], emotion: "normal", messagesSinceEmotionChange: 0 });
			ws.send(JSON.stringify({ type: "state", state: "idle" }));
			console.log("[WS] Client connected");
		},
		async message(ws, raw) {
			const conn = connections.get(ws);
			if (!conn) return;

			try {
				const msg = JSON.parse(String(raw));

				if (msg.type === "mock") {
					const mockResponses = [
						"Hello! I am B-MO! I am ready to help you!",
						"Beep boop! That is a great question!",
						"I am thinking very hard about this. The answer is 42!",
						"Oh boy! B-MO loves talking to you!",
					];
					const pick = mockResponses[Math.floor(Math.random() * mockResponses.length)]!;
					console.log(`[MOCK] ${pick}`);

					ws.send(JSON.stringify({ type: "response", text: pick }));
					ws.send(JSON.stringify({ type: "state", state: "speaking" }));

					try {
						const audio = await textToSpeech(pick);
						ws.send(audio);
					} catch (e) {
						const errMsg = parseApiError(e);
						console.error(`[TTS] ${errMsg}`);
						ws.send(JSON.stringify({ type: "error", message: errMsg }));
					}

					ws.send(JSON.stringify({ type: "state", state: "idle" }));
					return;
				}

				if (msg.type === "text") {
					const userText = msg.text;
					console.log(`[USER] ${userText}`);
					conn.messages.push({ role: "user", content: userText });

					ws.send(JSON.stringify({ type: "state", state: "thinking" }));

					let response: string;
					try {
						response = await chat(conn.messages);
					} catch (e) {
						const errMsg = parseApiError(e);
						console.error(`[CLAUDE] ${errMsg}`);
						ws.send(JSON.stringify({ type: "error", message: errMsg }));
						ws.send(JSON.stringify({ type: "state", state: "idle" }));
						conn.messages.pop();
						return;
					}

					// Extract emotion with tolerance — don't flip-flop every message
					const newEmotion = extractEmotion(response);
					conn.messagesSinceEmotionChange++;
					if (newEmotion && newEmotion !== conn.emotion && conn.messagesSinceEmotionChange >= EMOTION_COOLDOWN_MESSAGES) {
						conn.emotion = newEmotion;
						conn.messagesSinceEmotionChange = 0;
						console.log(`[EMOTION] ${newEmotion}`);
						ws.send(JSON.stringify({ type: "emotion", emotion: newEmotion }));
					}

					// Extract action data
					const actionData = extractJson(response);
					let finalText: string;

					if (actionData?.action) {
						console.log(`[ACTION] ${JSON.stringify(actionData)}`);
						const toolResult = await executeAction(actionData);

						// Strip JSON from text for display
						const spokenText = stripJson(response);

						if (toolResult === "INVALID_ACTION") {
							finalText = spokenText || "I am not sure how to do that.";
						} else if (toolResult === "SEARCH_EMPTY") {
							finalText = spokenText || "I searched, but I could not find anything about that.";
						} else if (toolResult === "SEARCH_ERROR") {
							finalText = spokenText || "I cannot reach the internet right now.";
						} else if (toolResult.startsWith("MEMORY_SAVED:")) {
							// Memory saved — use the spoken text from Claude
							finalText = spokenText || "B-MO will remember that!";
						} else {
							finalText = await summarize(toolResult, userText);
						}
					} else if (actionData?.emotion) {
						// Emotion-only JSON, strip it from display text
						finalText = stripJson(response);
					} else {
						finalText = response;
					}

					conn.messages.push({ role: "assistant", content: finalText });
					ws.send(JSON.stringify({ type: "response", text: finalText }));

					// TTS
					ws.send(JSON.stringify({ type: "state", state: "speaking" }));
					try {
						const audio = await textToSpeech(
							finalText.replace(/[^\w\s,.!?:'-]/g, "").trim(),
						);
						ws.send(audio);
					} catch (e) {
						const errMsg = parseApiError(e);
						console.error(`[TTS] ${errMsg}`);
						ws.send(JSON.stringify({ type: "error", message: errMsg }));
					}

					ws.send(JSON.stringify({ type: "state", state: "idle" }));
				}
			} catch (e) {
				const errMsg = parseApiError(e);
				console.error(`[WS] ${errMsg}`);
				ws.send(JSON.stringify({ type: "error", message: errMsg }));
				ws.send(JSON.stringify({ type: "state", state: "idle" }));
			}
		},
		close(ws) {
			connections.delete(ws);
			console.log("[WS] Client disconnected");
		},
	},
	development: {
		hmr: true,
		console: true,
	},
});

console.log(`BMO test server running at http://localhost:${server.port}`);
