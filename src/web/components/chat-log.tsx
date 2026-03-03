import React, { useRef, useEffect } from "react";
import type { ChatMessage } from "../lib/types";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

export function ChatLog({ messages }: { messages: ChatMessage[] }) {
	const endRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<ScrollArea className="w-full max-w-lg h-64 rounded-base border-2 border-border bg-secondary-background p-4">
			{messages.map((m, i) => (
				<div key={i} className="mb-3 flex gap-2 items-start">
					<Badge
						variant={m.role === "user" ? "neutral" : "default"}
						className="shrink-0 mt-0.5"
					>
						{m.role === "user" ? "You" : "BMO"}
					</Badge>
					<span className="text-sm font-base">{m.text}</span>
				</div>
			))}
			<div ref={endRef} />
		</ScrollArea>
	);
}
