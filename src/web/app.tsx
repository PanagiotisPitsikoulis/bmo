import React, { useState, useRef, useEffect } from "react";
import { createRoot } from "react-dom/client";

import type { State, ChatMessage } from "./lib/types";
import { playAudio } from "./lib/audio";
import { startSpeechRecognition, isSpeechSupported } from "./lib/speech";
import { createWebSocket, sendMessage } from "./lib/websocket";
import { BMOFace } from "./components/bmo-face";
import { ChatLog } from "./components/chat-log";
import { Controls } from "./components/controls";
import { DebugMenu } from "./components/debug-menu";

function App() {
	const [state, setState] = useState<State>("idle");
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isRecording, setIsRecording] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [connected, setConnected] = useState(false);
	const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const wsRef = useRef<WebSocket | null>(null);

	function showError(msg: string) {
		setError(msg);
		setState("error");
		if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
		errorTimerRef.current = setTimeout(() => {
			setError(null);
			setState("idle");
		}, 6000);
	}

	useEffect(() => {
		const ws = createWebSocket({
			onState: (s) => {
				// Don't let server "idle" clear an active error
				if (s === "idle" && error) return;
				setState(s);
			},
			onResponse: (text) =>
				setMessages((prev) => [...prev, { role: "assistant", text }]),
			onAudio: (data) => playAudio(data, () => setState("idle")),
			onError: (msg) => showError(msg),
			onDisconnect: () => {
				setConnected(false);
				showError("Disconnected from server. Refresh to reconnect.");
			},
		});
		ws.onopen = () => setConnected(true);
		wsRef.current = ws;
		return () => ws.close();
	}, [error]);

	function handleSend(text: string) {
		if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
			showError("Not connected to server.");
			return;
		}
		setMessages((prev) => [...prev, { role: "user", text }]);
		sendMessage(wsRef.current, text);
		setState("thinking");
	}

	function handleTalk() {
		if (isRecording) {
			setIsRecording(false);
			return;
		}
		setIsRecording(true);
		setState("listening");
		startSpeechRecognition(
			(text) => {
				setIsRecording(false);
				handleSend(text);
			},
			(err) => {
				setIsRecording(false);
				showError(err);
			},
			() => {
				setIsRecording(false);
			},
		);
	}

	function handleDebugAction(action: string) {
		if (action.startsWith("state-")) {
			setState(action.replace("state-", "") as State);
			return;
		}

		if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
			showError("Not connected to server.");
			return;
		}

		if (action === "test-voice") {
			wsRef.current.send(JSON.stringify({ type: "test-voice" }));
			setState("speaking");
		} else if (action === "test-logic") {
			wsRef.current.send(JSON.stringify({ type: "test-logic" }));
			setState("thinking");
		}
	}

	return (
		<div className="min-h-screen bg-white font-mono flex flex-col items-center p-8 gap-6">
			<div className="flex items-center gap-3">
				<h1 className="text-2xl font-bold border-b-4 border-black pb-2">
					BMO Test Interface
				</h1>
				<span
					className={`w-3 h-3 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`}
					title={connected ? "Connected" : "Disconnected"}
				/>
			</div>

			<BMOFace state={state} />

			{/* Status + debug menu inline */}
			<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
				<div style={{ border: "2px solid black", padding: "4px 16px", fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "monospace" }}>
					{state}
				</div>
				<DebugMenu onAction={handleDebugAction} />
			</div>

			{error && (
				<div className="w-full max-w-lg border-4 border-red-500 bg-red-50 p-3 text-red-700 text-sm">
					{error}
				</div>
			)}

			<ChatLog messages={messages} />
			<Controls
				onSend={handleSend}
				onTalk={handleTalk}
				isRecording={isRecording}
				speechSupported={isSpeechSupported()}
			/>
		</div>
	);
}

createRoot(document.getElementById("root")!).render(<App />);
