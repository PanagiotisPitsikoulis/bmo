import React from "react";
import { BMOFace } from "../components/bmo-face";
import { Button } from "../components/ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardFooter,
} from "../components/ui/card";

export function Home() {
	return (
		<Card className="max-w-md w-full items-center text-center">
			<CardHeader className="items-center">
				<BMOFace state="idle" />
				<CardTitle className="text-3xl mt-4">BMO</CardTitle>
				<CardDescription>
					Your friendly AI companion. Talk to BMO using text or voice,
					and BMO will respond with speech and expressions.
				</CardDescription>
			</CardHeader>
			<CardFooter className="justify-center gap-4">
				<Button asChild size="lg">
					<a href="#/test">Start Chatting</a>
				</Button>
				<Button asChild variant="neutral" size="lg">
					<a href="#/instructions">Instructions</a>
				</Button>
			</CardFooter>
		</Card>
	);
}
