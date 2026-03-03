import React, { useState } from "react";
import { marked } from "marked";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";

import readmeDoc from "../../../docs/readme.md" with { type: "text" };
import gettingStartedDoc from "../../../docs/getting-started.md" with { type: "text" };
import apiKeysDoc from "../../../docs/api-keys.md" with { type: "text" };
import devModeDoc from "../../../docs/dev-mode.md" with { type: "text" };
import hardwareAssemblyDoc from "../../../docs/hardware-assembly.md" with { type: "text" };
import deployDoc from "../../../docs/deploy.md" with { type: "text" };
import partsListDoc from "../../../docs/parts-list.md" with { type: "text" };
import notesDoc from "../../../docs/notes.md" with { type: "text" };

const sections = [
	{ label: "About BMO", content: readmeDoc },
	{ label: "Getting Started", content: gettingStartedDoc },
	{ label: "API Keys", content: apiKeysDoc },
	{ label: "Dev Mode", content: devModeDoc },
	{ label: "Hardware Assembly", content: hardwareAssemblyDoc },
	{ label: "Deploy to Hardware", content: deployDoc },
	{ label: "Parts List", content: partsListDoc },
	{ label: "Notes", content: notesDoc },
];

export function Instructions() {
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	if (activeIndex !== null) {
		const section = sections[activeIndex]!;
		const html = marked.parse(section.content) as string;

		return (
			<>
				<Button
					variant="neutral"
					onClick={() => setActiveIndex(null)}
				>
					<ArrowLeft />
					Back
				</Button>
				<Card className="max-w-2xl w-full">
					<CardContent>
						<div
							className="prose max-w-none"
							dangerouslySetInnerHTML={{ __html: html }}
						/>
					</CardContent>
				</Card>
			</>
		);
	}

	return (
		<>
			<h1 className="text-2xl font-heading">Instructions</h1>
			<div className="grid grid-cols-2 gap-4 max-w-lg w-full">
				{sections.map((section, i) => (
					<Button
						key={section.label}
						variant="neutral"
						onClick={() => setActiveIndex(i)}
						className="h-auto py-6 text-sm uppercase tracking-wider"
					>
						{section.label}
					</Button>
				))}
			</div>
		</>
	);
}
