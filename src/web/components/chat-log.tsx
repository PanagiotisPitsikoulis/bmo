import React, { useRef, useEffect, useState } from "react";
import type { ChatMessage } from "../lib/types";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

function Spinner() {
	return (
		<span className="inline-flex gap-1 items-center h-4">
			{[0, 1, 2].map((i) => (
				<span
					key={i}
					className="w-1.5 h-1.5 rounded-full bg-main animate-bounce"
					style={{ animationDelay: `${i * 0.15}s` }}
				/>
			))}
		</span>
	);
}

function WordByWordText({ text, onDone }: { text: string; onDone?: () => void }) {
	const [phase, setPhase] = useState<"delay" | "streaming" | "done">("delay");
	const [wordIndex, setWordIndex] = useState(0);
	const words = text.split(/(\s+)/); // preserve whitespace tokens

	useEffect(() => {
		const timer = setTimeout(() => setPhase("streaming"), 400);
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (phase !== "streaming") return;
		if (wordIndex >= words.length) {
			setPhase("done");
			onDone?.();
			return;
		}
		// Skip whitespace-only tokens instantly
		if (/^\s+$/.test(words[wordIndex]!)) {
			setWordIndex((i) => i + 1);
			return;
		}
		const speed = 120 + Math.random() * 80;
		const timer = setTimeout(() => setWordIndex((i) => i + 1), speed);
		return () => clearTimeout(timer);
	}, [phase, wordIndex, words]);

	if (phase === "delay") return <Spinner />;

	// Reconstruct text up to current word index
	const visible = words.slice(0, wordIndex).join("");

	return (
		<span className="text-sm font-base">
			{visible}
			{phase === "streaming" && (
				<span className="inline-block w-0.5 h-3.5 bg-foreground ml-0.5 animate-pulse align-text-bottom" />
			)}
		</span>
	);
}

export function ChatLog({ messages }: { messages: ChatMessage[] }) {
	const endRef = useRef<HTMLDivElement>(null);
	const [lastTypedIndex, setLastTypedIndex] = useState(messages.length - 1);

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, lastTypedIndex]);

	return (
		<ScrollArea className="w-full h-64 rounded-base border-2 border-border bg-secondary-background p-4">
			{messages.map((m, i) => {
				const isBmo = m.role === "assistant";
				const isNew = isBmo && i > lastTypedIndex;
				return (
					<div key={i} className="mb-3 flex gap-2 items-start">
						<Badge
							variant={isBmo ? "default" : "neutral"}
							className="shrink-0 mt-0.5"
						>
							{isBmo ? "B-MO" : "You"}
						</Badge>
						{isNew ? (
							<WordByWordText
								text={m.text}
								onDone={() => setLastTypedIndex(i)}
							/>
						) : (
							<span className="text-sm font-base">{m.text}</span>
						)}
					</div>
				);
			})}
			<div ref={endRef} />
		</ScrollArea>
	);
}
