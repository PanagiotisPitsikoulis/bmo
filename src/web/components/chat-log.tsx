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

function TypewriterText({ text, onDone }: { text: string; onDone?: () => void }) {
	const [phase, setPhase] = useState<"delay" | "typing" | "done">("delay");
	const [charIndex, setCharIndex] = useState(0);

	useEffect(() => {
		const timer = setTimeout(() => setPhase("typing"), 800);
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (phase !== "typing") return;
		if (charIndex >= text.length) {
			setPhase("done");
			onDone?.();
			return;
		}
		const speed = 25 + Math.random() * 20;
		const timer = setTimeout(() => setCharIndex((c) => c + 1), speed);
		return () => clearTimeout(timer);
	}, [phase, charIndex, text]);

	if (phase === "delay") return <Spinner />;
	return (
		<span className="text-sm font-base">
			{text.slice(0, charIndex)}
			{phase === "typing" && (
				<span className="inline-block w-0.5 h-3.5 bg-foreground ml-0.5 animate-pulse align-text-bottom" />
			)}
		</span>
	);
}

export function ChatLog({ messages }: { messages: ChatMessage[] }) {
	const endRef = useRef<HTMLDivElement>(null);
	const [lastTypedIndex, setLastTypedIndex] = useState(-1);

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
							{isBmo ? "BMO" : "You"}
						</Badge>
						{isNew ? (
							<TypewriterText
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
