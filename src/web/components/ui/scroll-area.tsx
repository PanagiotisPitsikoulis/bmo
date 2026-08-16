import * as React from "react";
import { cn } from "../../lib/utils";

function ScrollArea({
	className,
	children,
	...props
}: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="scroll-area"
			className={cn("relative overflow-auto font-base", className)}
			{...props}
		>
			{children}
		</div>
	);
}

export { ScrollArea };
