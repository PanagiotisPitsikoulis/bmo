import React, { useRef, useEffect } from "react";
import type { ChatMessage } from "../lib/types";

export function ChatLog({ messages }: { messages: ChatMessage[] }) {
	const endRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	return (
		<div className="w-full max-w-lg border-4 border-black p-4 h-64 overflow-y-auto bg-gray-50">
			{messages.map((m, i) => (
				<div
					key={i}
					className={`mb-2 ${m.role === "user" ? "text-blue-700" : "text-green-700"}`}
				>
					<span className="font-bold">
						{m.role === "user" ? "You" : "BMO"}:
					</span>{" "}
					{m.text}
				</div>
			))}
			<div ref={endRef} />
		</div>
	);
}
