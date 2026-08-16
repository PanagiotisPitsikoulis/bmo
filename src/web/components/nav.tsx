import React from "react";
import { GithubIcon } from "./icons/github";
import { Button } from "./ui/button";

const links = [
	{ hash: "#/", label: "Home" },
	{ hash: "#/test", label: "Play Around" },
	{ hash: "#/instructions", label: "Build BMO IRL" },
];

export function Nav({
	currentHash,
	floating,
}: {
	currentHash: string;
	floating?: boolean;
}) {
	return (
		<nav className={`w-full max-w-2xl flex gap-2 rounded-base border-2 border-border bg-secondary-background p-1 ${floating ? "fixed top-4 left-1/2 -translate-x-1/2 z-50" : ""}`}>
			{links.map((link) => (
				<Button
					key={link.hash}
					asChild
					variant={currentHash === link.hash ? "default" : "noShadow"}
					size="sm"
					className={
						currentHash === link.hash
							? "bg-main text-main-foreground"
							: "bg-secondary-background text-foreground border-transparent"
					}
				>
					<a href={link.hash}>{link.label}</a>
				</Button>
			))}
			<Button
				asChild
				variant="default"
				size="icon"
				className="ml-auto"
				title="Star us on GitHub"
			>
				<a href="https://github.com/ptsikoulis/bmo" target="_blank" rel="noopener noreferrer">
					<GithubIcon size={16} />
				</a>
			</Button>
		</nav>
	);
}
