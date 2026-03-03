import React from "react";
import type { Emotion } from "../lib/types";
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
} from "./ui/select";

const EMOTIONS: Emotion[] = ["normal", "happy", "sad", "hungry", "in_love", "sleepy"];

interface DebugMenuProps {
	onMockResponse: () => void;
	onSetEmotion?: (emotion: Emotion) => void;
}

export function DebugMenu({ onMockResponse, onSetEmotion }: DebugMenuProps) {
	function handleChange(value: string) {
		if (value === "mock") {
			onMockResponse();
			return;
		}
		if (value.startsWith("emotion:")) {
			const emo = value.slice(8) as Emotion;
			onSetEmotion?.(emo);
		}
	}

	return (
		<Select onValueChange={handleChange} value="">
			<SelectTrigger className="w-auto h-auto px-4 py-1 text-sm uppercase tracking-wider">
				<SelectValue placeholder="Debug" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="mock">Mock BMO response</SelectItem>
				{EMOTIONS.map((emo) => (
					<SelectItem key={emo} value={`emotion:${emo}`}>
						Emotion: {emo}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
