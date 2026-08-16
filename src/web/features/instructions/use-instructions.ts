import { useState } from "react";
import { marked } from "marked";
import { sections } from "./sections";

/** Rewrite filesystem image paths to web-accessible /assets/ URLs */
function fixImagePaths(md: string): string {
	return md.replace(
		/!\[([^\]]*)\]\(src\/web\/assets\/([^)]+)\)/g,
		"![$1](/assets/$2)",
	);
}

export function useInstructions() {
	const [activeIndex, setActiveIndex] = useState<number | null>(null);

	const activeSection = activeIndex !== null ? sections[activeIndex]! : null;
	const activeHtml = activeSection
		? (marked.parse(fixImagePaths(activeSection.content)) as string)
		: null;

	return {
		sections,
		activeIndex,
		activeSection,
		activeHtml,
		openSection: (index: number) => setActiveIndex(index),
		goBack: () => setActiveIndex(null),
	};
}
