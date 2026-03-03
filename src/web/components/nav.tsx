import React from "react";
import { Button } from "./ui/button";

const links = [
	{ hash: "#/", label: "Home" },
	{ hash: "#/test", label: "Test Interface" },
	{ hash: "#/instructions", label: "Instructions" },
];

export function Nav({ currentHash }: { currentHash: string }) {
	return (
		<nav className="w-full max-w-2xl flex gap-2 rounded-base border-2 border-border bg-main p-1">
			{links.map((link) => (
				<Button
					key={link.hash}
					asChild
					variant={currentHash === link.hash ? "default" : "noShadow"}
					size="sm"
					className={
						currentHash === link.hash
							? "bg-secondary-background text-foreground"
							: ""
					}
				>
					<a href={link.hash}>{link.label}</a>
				</Button>
			))}
		</nav>
	);
}
