import React, { useRef } from "react";
import type { State } from "../lib/types";

interface DebugMenuProps {
	onAction: (action: string) => void;
}

export function DebugMenu({ onAction }: DebugMenuProps) {
	const selectRef = useRef<HTMLSelectElement>(null);

	function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
		const val = e.target.value;
		if (val) onAction(val);
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
			<optgroup label="Test APIs">
				<option value="test-voice">Check if BMO's voice works</option>
				<option value="test-logic">Check if BMO's logic works</option>
			</optgroup>
			<optgroup label="Animation States">
				<option value="state-idle">State: Idle</option>
				<option value="state-listening">State: Listening</option>
				<option value="state-thinking">State: Thinking</option>
				<option value="state-speaking">State: Speaking</option>
				<option value="state-error">State: Error</option>
			</optgroup>
		</select>
	);
}
