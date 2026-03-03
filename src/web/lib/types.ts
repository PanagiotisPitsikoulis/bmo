export type State = "idle" | "listening" | "thinking" | "speaking" | "error";

export interface ChatMessage {
	role: "user" | "assistant";
	text: string;
}
