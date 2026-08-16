import React from "react";

export function ConstructionBanner({
	flip,
	text,
}: { flip?: boolean; text: string }) {
	return (
		<div
			className="w-full overflow-hidden border-y-2 border-border bg-[repeating-linear-gradient(45deg,#facc15_0px,#facc15_20px,#000_20px,#000_40px)] h-10 flex items-center"
			style={{ transform: flip ? "rotate(-6deg)" : "rotate(6deg)" }}
		>
			<div
				className="flex whitespace-nowrap"
				style={{
					animation: `scroll 120s linear infinite${flip ? " reverse" : ""}`,
				}}
			>
				<span className="inline-block px-4 font-heading text-sm text-black bg-[#facc15] py-1">
					{(text + " ").repeat(8)}
				</span>
				<span className="inline-block px-4 font-heading text-sm text-black bg-[#facc15] py-1">
					{(text + " ").repeat(8)}
				</span>
			</div>
		</div>
	);
}
