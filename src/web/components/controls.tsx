import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Microphone, MicrophoneSlash, PaperPlaneRight } from "@phosphor-icons/react";

interface ControlsProps {
	onSend: (text: string) => void;
	onTalk: () => void;
	isRecording: boolean;
	speechSupported: boolean;
}

export function Controls({
	onSend,
	onTalk,
	isRecording,
	speechSupported,
}: ControlsProps) {
	const [input, setInput] = useState("");

	function handleSend() {
		if (!input.trim()) return;
		onSend(input);
		setInput("");
	}

	return (
		<div className="w-full flex gap-2">
			<Input
				value={input}
				onChange={(e) => setInput(e.target.value)}
				onKeyDown={(e) => e.key === "Enter" && handleSend()}
				placeholder="Type a message..."
				className="flex-1"
			/>
			<Button onClick={handleSend}>
				<PaperPlaneRight />
				Send
			</Button>
			<Button
				onClick={onTalk}
				disabled={!speechSupported}
				variant={isRecording ? "noShadow" : "neutral"}
				title={
					speechSupported
						? "Click to talk"
						: "Speech recognition not supported — use Chrome"
				}
				className={isRecording ? "bg-destructive text-destructive-foreground border-border" : ""}
			>
				{isRecording ? <MicrophoneSlash /> : <Microphone />}
				{isRecording ? "Stop" : "Talk"}
			</Button>
		</div>
	);
}
