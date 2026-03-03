const SpeechRecognition =
	(window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export function isSpeechSupported(): boolean {
	return !!SpeechRecognition;
}

export function startSpeechRecognition(
	onResult: (text: string) => void,
	onError: (error: string) => void,
	onEnd: () => void,
): void {
	if (!SpeechRecognition) {
		onError("Speech recognition not supported in this browser. Use Chrome.");
		onEnd();
		return;
	}

	try {
		const recognition = new SpeechRecognition();
		recognition.lang = "en-US";
		recognition.interimResults = false;
		recognition.continuous = false;

		recognition.onresult = (e: any) => {
			const text = e.results?.[0]?.[0]?.transcript;
			if (text) onResult(text);
			else onEnd();
		};

		recognition.onerror = (e: any) => {
			const errorMap: Record<string, string> = {
				"not-allowed": "Microphone access denied. Check browser permissions.",
				"no-speech": "No speech detected. Try again.",
				"audio-capture": "No microphone found.",
				"network": "Network error during speech recognition.",
			};
			onError(errorMap[e.error] ?? `Speech error: ${e.error}`);
			onEnd();
		};

		recognition.onend = () => onEnd();
		recognition.start();
	} catch (e) {
		onError(`Failed to start speech recognition: ${e}`);
		onEnd();
	}
}
