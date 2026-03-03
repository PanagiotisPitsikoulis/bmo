import React, { useState, useRef, useEffect } from "react";

import type { State, ChatMessage } from "../lib/types";
import { playAudio } from "../lib/audio";
import { startSpeechRecognition, isSpeechSupported } from "../lib/speech";
import { createWebSocket, sendMessage } from "../lib/websocket";
import { BMOFace } from "../components/bmo-face";
import { ChatLog } from "../components/chat-log";
import { Controls } from "../components/controls";
import { DebugMenu } from "../components/debug-menu";
import { Badge } from "../components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "../components/ui/alert";
import { AlertCircle } from "lucide-react";

export function TestInterface() {
	const [state, setState] = useState<State>("idle");
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [isRecording, setIsRecording] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [connected, setConnected] = useState(false);
	const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const errorRef = useRef<string | null>(null);
	const wsRef = useRef<WebSocket | null>(null);

	function showError(msg: string) {
		setError(msg);
		errorRef.current = msg;
		setState("error");
		if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
		errorTimerRef.current = setTimeout(() => {
			setError(null);
			errorRef.current = null;
			setState("idle");
		}, 6000);
	}

	useEffect(() => {
		const ws = createWebSocket({
			onState: (s) => {
				if (s === "idle" && errorRef.current) return;
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
	}, []);

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

	function handleMockResponse() {
		if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
			showError("Not connected to server.");
			return;
		}
		wsRef.current.send(JSON.stringify({ type: "mock" }));
		setState("thinking");
	}

	return (
		<>
			<BMOFace state={state} />

			<div className="flex items-center gap-3">
				<Badge className="text-sm uppercase tracking-wider px-4 py-1">
					{state}
				</Badge>
				<DebugMenu onMockResponse={handleMockResponse} />
			</div>

			{error && (
				<Alert variant="destructive" className="max-w-lg">
					<AlertCircle className="size-4" />
					<AlertTitle>Error</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}

			<ChatLog messages={messages} />
			<Controls
				onSend={handleSend}
				onTalk={handleTalk}
				isRecording={isRecording}
				speechSupported={isSpeechSupported()}
			/>
		</>
	);
}
