import React, { useState } from "react";

interface ControlsProps {
	onSend: (text: string) => void;
	onTalk: () => void;
	isRecording: boolean;
	speechSupported: boolean;
}

export function Controls({ onSend, onTalk, isRecording, speechSupported }: ControlsProps) {
	const [input, setInput] = useState("");

	function handleSend() {
		if (!input.trim()) return;
		onSend(input);
		setInput("");
	}

	return (
		<div className="w-full max-w-lg flex gap-2">
			<input
				type="text"
				value={input}
				onChange={(e) => setInput(e.target.value)}
				onKeyDown={(e) => e.key === "Enter" && handleSend()}
				placeholder="Type a message..."
				className="flex-1 border-4 border-black px-3 py-2 font-mono outline-none focus:shadow-[4px_4px_0px_0px_#000]"
			/>
			<button
				onClick={handleSend}
				className="border-4 border-black px-4 py-2 font-bold hover:bg-black hover:text-white transition-colors"
			>
				Send
			</button>
			<button
				onClick={onTalk}
				disabled={!speechSupported}
				title={speechSupported ? "Click to talk" : "Speech recognition not supported — use Chrome"}
				className={`border-4 border-black px-4 py-2 font-bold transition-colors ${
					!speechSupported
						? "opacity-40 cursor-not-allowed"
						: isRecording
							? "bg-red-500 text-white"
							: "hover:bg-black hover:text-white"
				}`}
			>
				{isRecording ? "Stop" : "Talk"}
			</button>
		</div>
	);
}
