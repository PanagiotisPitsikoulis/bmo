import React, { useRef } from "react";

interface DebugMenuProps {
	onMockResponse: () => void;
}

export function DebugMenu({ onMockResponse }: DebugMenuProps) {
	const selectRef = useRef<HTMLSelectElement>(null);

	function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
		if (e.target.value === "mock") onMockResponse();
		if (selectRef.current) selectRef.current.selectedIndex = 0;
	}

	return (
		<select
			ref={selectRef}
			onChange={handleChange}
			defaultValue="menu"
			style={{
				border: "2px solid black",
				padding: "4px 8px",
				fontFamily: "monospace",
				fontSize: "14px",
				fontWeight: "bold",
				background: "white",
				cursor: "pointer",
				outline: "none",
				minWidth: "44px",
			}}
		>
			<option value="menu" disabled>Debug Menu</option>
			<option value="mock">Send mock BMO response</option>
		</select>
	);
}
