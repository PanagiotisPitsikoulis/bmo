import type { State } from "./types";

export interface WSCallbacks {
	onState: (state: State) => void;
	onResponse: (text: string) => void;
	onAudio: (data: ArrayBuffer) => void;
	onError: (message: string) => void;
	onDisconnect: () => void;
}

export function createWebSocket(callbacks: WSCallbacks): WebSocket {
	const ws = new WebSocket(`ws://${window.location.host}/ws`);

	ws.onopen = () => {
		console.log("[WS] Connected");
	};

	ws.onmessage = async (e) => {
		if (e.data instanceof Blob) {
			callbacks.onAudio(await e.data.arrayBuffer());
			return;
		}
		const msg = JSON.parse(e.data);
		switch (msg.type) {
			case "state":
				callbacks.onState(msg.state);
				break;
			case "response":
				callbacks.onResponse(msg.text);
				break;
			case "error":
				callbacks.onError(msg.message ?? "Unknown server error");
				break;
		}
	};

	ws.onerror = () => {
		callbacks.onError("WebSocket connection failed. Is the server running?");
	};

	ws.onclose = () => {
		callbacks.onDisconnect();
	};

	return ws;
}

export function sendMessage(ws: WebSocket, text: string): void {
	if (ws.readyState !== WebSocket.OPEN) {
		return;
	}
	ws.send(JSON.stringify({ type: "text", text }));
}
