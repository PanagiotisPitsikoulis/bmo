import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";

import { Nav } from "./components/nav";
import { Home } from "./pages/home";
import { TestInterface } from "./pages/test-interface";
import { Instructions } from "./pages/instructions";

function getHash() {
	return window.location.hash || "#/";
}

function App() {
	const [hash, setHash] = useState(getHash);

	useEffect(() => {
		const onHashChange = () => setHash(getHash());
		window.addEventListener("hashchange", onHashChange);
		return () => window.removeEventListener("hashchange", onHashChange);
	}, []);

	let page: React.ReactNode;
	switch (hash) {
		case "#/test":
			page = <TestInterface />;
			break;
		case "#/instructions":
			page = <Instructions />;
			break;
		default:
			page = <Home />;
			break;
	}

	return (
		<div className="min-h-screen bg-background flex flex-col items-center p-8 gap-6">
			<Nav currentHash={hash} />
			{page}
		</div>
	);
}

createRoot(document.getElementById("root")!).render(<App />);
