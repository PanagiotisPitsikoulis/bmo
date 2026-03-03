import React from "react";
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
	SelectValue,
} from "./ui/select";

interface DebugMenuProps {
	onMockResponse: () => void;
}

export function DebugMenu({ onMockResponse }: DebugMenuProps) {
	function handleChange(value: string) {
		if (value === "mock") onMockResponse();
	}

	return (
		<Select onValueChange={handleChange} value="">
			<SelectTrigger className="w-[160px]">
				<SelectValue placeholder="Debug Menu" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="mock">Mock BMO response</SelectItem>
			</SelectContent>
		</Select>
	);
}
