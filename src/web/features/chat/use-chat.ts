import { useState, useRef, useEffect, useCallback } from "react";
import type { State, Emotion, ChatMessage } from "../../lib/types";
import { playAudio } from "../../lib/audio";
import { startSpeechRecognition, isSpeechSupported } from "../../lib/speech";
import { createWebSocket, sendMessage } from "../../lib/websocket";
import { sfxSend, sfxReceive, sfxError, sfxRecordStart, sfxRecordStop } from "../../lib/sounds";

const STORAGE_KEY_MESSAGES = "bmo-messages";
const STORAGE_KEY_EMOTION = "bmo-emotion";

function loadMessages(): ChatMessage[] {
	try {
		const raw = localStorage.getItem(STORAGE_KEY_MESSAGES);
		if (raw) return JSON.parse(raw);
	} catch {}
	return [];
}

function saveMessages(messages: ChatMessage[]) {
	try {
		localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages));
	} catch {}
}

function loadEmotion(): Emotion {
	try {
		const raw = localStorage.getItem(STORAGE_KEY_EMOTION);
		if (raw) return raw as Emotion;
	} catch {}
	return "normal";
}

function saveEmotion(emotion: Emotion) {
	try {
		localStorage.setItem(STORAGE_KEY_EMOTION, emotion);
	} catch {}
}

export function useChat() {
	const [state, setState] = useState<State>("idle");
	const [emotion, setEmotionRaw] = useState<Emotion>(loadEmotion);
	const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
	const [isRecording, setIsRecording] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [connected, setConnected] = useState(false);
	const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const errorRef = useRef<string | null>(null);
	const wsRef = useRef<WebSocket | null>(null);

	const setEmotion = useCallback((e: Emotion) => {
		setEmotionRaw(e);
		saveEmotion(e);
	}, []);

	// Persist messages whenever they change
	useEffect(() => {
		saveMessages(messages);
	}, [messages]);

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
			onEmotion: (e) => setEmotion(e),
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

	function handleClear() {
		setMessages([]);
	}

	return {
		state,
		emotion,
		setEmotion,
		messages,
		isRecording,
		error,
		connected,
		speechSupported: isSpeechSupported(),
		handleSend,
		handleTalk,
		handleMockResponse,
		handleClear,
	};
}
