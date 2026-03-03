import { useState, useRef, useEffect } from "react";
import type { State, ChatMessage } from "../../lib/types";
import { playAudio } from "../../lib/audio";
import { startSpeechRecognition, isSpeechSupported } from "../../lib/speech";
import { createWebSocket, sendMessage } from "../../lib/websocket";
import { sfxSend, sfxReceive, sfxError, sfxRecordStart, sfxRecordStop } from "../../lib/sounds";

export function useChat() {
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
		sfxError();
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
			onResponse: (text) => {
				sfxReceive();
				setMessages((prev) => [...prev, { role: "assistant", text }]);
			},
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
		sfxSend();
		setMessages((prev) => [...prev, { role: "user", text }]);
		sendMessage(wsRef.current, text);
		setState("thinking");
	}

	function handleTalk() {
		if (isRecording) {
			sfxRecordStop();
			setIsRecording(false);
			return;
		}
		sfxRecordStart();
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

	return {
		state,
		messages,
		isRecording,
		error,
		connected,
		speechSupported: isSpeechSupported(),
		handleSend,
		handleTalk,
		handleMockResponse,
	};
}
