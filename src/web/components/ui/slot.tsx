import * as React from "react";

export function Slot({
	children,
	...props
}: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
	if (React.isValidElement(children)) {
		return React.cloneElement(children, {
			...props,
			...children.props,
			className: [props.className, children.props.className]
				.filter(Boolean)
				.join(" "),
		} as any);
	}
	return <>{children}</>;
}
