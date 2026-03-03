import { CaretDown } from "@phosphor-icons/react";
import * as React from "react";
import { cn } from "../../lib/utils";

interface SelectContextValue {
	open: boolean;
	setOpen: (open: boolean) => void;
	value: string;
	onValueChange: (value: string) => void;
}

const SelectContext = React.createContext<SelectContextValue>(null!);

function Select({
	children,
	value = "",
	onValueChange,
}: {
	children: React.ReactNode;
	value?: string;
	onValueChange?: (value: string) => void;
}) {
	const [open, setOpen] = React.useState(false);

	return (
		<SelectContext.Provider
			value={{
				open,
				setOpen,
				value,
				onValueChange: onValueChange ?? (() => {}),
			}}
		>
			<div className="relative inline-block">{children}</div>
		</SelectContext.Provider>
	);
}

function SelectValue({ placeholder }: { placeholder?: string }) {
	const { value } = React.useContext(SelectContext);
	return <span>{value || placeholder}</span>;
}

function SelectTrigger({
	className,
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) {
	const { open, setOpen } = React.useContext(SelectContext);

	return (
		<button
			type="button"
			data-slot="select-trigger"
			className={cn(
				"flex h-10 w-full items-center justify-between rounded-base border-2 border-border bg-main gap-2 px-3 py-2 text-sm font-base text-main-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 [&>span]:line-clamp-1 [&_svg]:pointer-events-none [&_svg]:shrink-0",
				className,
			)}
			onClick={() => setOpen(!open)}
			onBlur={(e) => {
				if (!e.currentTarget.parentElement?.contains(e.relatedTarget)) {
					setOpen(false);
				}
			}}
		>
			{children}
			<CaretDown size={16} />
		</button>
	);
}

function SelectContent({
	className,
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) {
	const { open } = React.useContext(SelectContext);
	if (!open) return null;

	return (
		<div
			data-slot="select-content"
			className={cn(
				"absolute top-full left-0 z-50 mt-1 min-w-full max-h-96 overflow-auto rounded-base border-2 border-border bg-main text-main-foreground p-1 animate-in fade-in-0 zoom-in-95",
				className,
			)}
		>
			{children}
		</div>
	);
}

function SelectItem({
	className,
	children,
	value,
}: {
	className?: string;
	children: React.ReactNode;
	value: string;
}) {
	const { onValueChange, setOpen } = React.useContext(SelectContext);

	return (
		<button
			type="button"
			data-slot="select-item"
			className={cn(
				"relative flex w-full cursor-default select-none items-center gap-2 rounded-base py-1.5 px-2 text-sm border-2 border-transparent font-base outline-none hover:border-border",
				className,
			)}
			onMouseDown={(e) => {
				e.preventDefault();
				onValueChange(value);
				setOpen(false);
			}}
		>
			{children}
		</button>
	);
}

export {
	Select,
	SelectValue,
	SelectTrigger,
	SelectContent,
	SelectItem,
};
