export type State = "idle" | "listening" | "thinking" | "speaking" | "error";
export type Emotion = "normal" | "happy" | "sad" | "hungry" | "in_love" | "sleepy";

export interface ChatMessage {
	role: "user" | "assistant";
	text: string;
}
