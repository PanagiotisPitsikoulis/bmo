let audioCtx: AudioContext | null = null;

export async function playAudio(
	wavBuffer: ArrayBuffer,
	onEnd?: () => void,
): Promise<void> {
	if (!audioCtx) audioCtx = new AudioContext();
	const audioBuffer = await audioCtx.decodeAudioData(wavBuffer);
	const source = audioCtx.createBufferSource();
	source.buffer = audioBuffer;
	source.connect(audioCtx.destination);
	source.onended = () => onEnd?.();
	source.start();
}
