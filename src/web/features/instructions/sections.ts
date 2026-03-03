import readmeDoc from "../../../../docs/readme.md" with { type: "text" };
import gettingStartedDoc from "../../../../docs/getting-started.md" with { type: "text" };
import apiKeysDoc from "../../../../docs/api-keys.md" with { type: "text" };
import devModeDoc from "../../../../docs/dev-mode.md" with { type: "text" };
import hardwareAssemblyDoc from "../../../../docs/hardware-assembly.md" with { type: "text" };
import deployDoc from "../../../../docs/deploy.md" with { type: "text" };
import partsListDoc from "../../../../docs/parts-list.md" with { type: "text" };
import notesDoc from "../../../../docs/notes.md" with { type: "text" };

export interface Section {
	label: string;
	content: string;
}

export const sections: Section[] = [
	{ label: "About BMO", content: readmeDoc },
	{ label: "Getting Started", content: gettingStartedDoc },
	{ label: "API Keys", content: apiKeysDoc },
	{ label: "Dev Mode", content: devModeDoc },
	{ label: "Hardware Assembly", content: hardwareAssemblyDoc },
	{ label: "Deploy to Hardware", content: deployDoc },
	{ label: "Parts List", content: partsListDoc },
	{ label: "Notes", content: notesDoc },
];
