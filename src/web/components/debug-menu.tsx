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
			<SelectTrigger className="w-auto h-auto px-4 py-1 text-sm uppercase tracking-wider">
				<SelectValue placeholder="Debug" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="mock">Mock BMO response</SelectItem>
			</SelectContent>
		</Select>
	);
}
