// 8-bit BMO sound effects using Web Audio API
// All sounds are generated procedurally — no external files needed

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
	if (!ctx) ctx = new AudioContext();
	return ctx;
}

function playTone(
	freq: number,
	duration: number,
	type: OscillatorType = "square",
	volume = 0.15,
) {
	const ac = getCtx();
	const osc = ac.createOscillator();
	const gain = ac.createGain();
	osc.type = type;
	osc.frequency.value = freq;
	gain.gain.setValueAtTime(volume, ac.currentTime);
	gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
	osc.connect(gain);
	gain.connect(ac.destination);
	osc.start();
	osc.stop(ac.currentTime + duration);
}

/** Short blip for button hover */
export function sfxHover() {
	playTone(800, 0.06, "square", 0.06);
}

/** Click / select sound */
export function sfxClick() {
	playTone(600, 0.08, "square", 0.12);
	setTimeout(() => playTone(900, 0.08, "square", 0.12), 40);
}

/** Navigation / page change */
export function sfxNavigate() {
	playTone(440, 0.08, "square", 0.1);
	setTimeout(() => playTone(660, 0.08, "square", 0.1), 60);
	setTimeout(() => playTone(880, 0.1, "square", 0.1), 120);
}

/** Send message beep */
export function sfxSend() {
	playTone(523, 0.06, "square", 0.1);
	setTimeout(() => playTone(784, 0.1, "square", 0.1), 50);
}

/** Receive / BMO response */
export function sfxReceive() {
	playTone(784, 0.06, "triangle", 0.12);
	setTimeout(() => playTone(523, 0.1, "triangle", 0.12), 60);
}

/** Error sound */
export function sfxError() {
	playTone(200, 0.15, "sawtooth", 0.1);
	setTimeout(() => playTone(150, 0.2, "sawtooth", 0.1), 100);
}

/** Start recording */
export function sfxRecordStart() {
	playTone(440, 0.06, "square", 0.1);
	setTimeout(() => playTone(880, 0.12, "square", 0.1), 60);
}

/** Stop recording */
export function sfxRecordStop() {
	playTone(880, 0.06, "square", 0.1);
	setTimeout(() => playTone(440, 0.12, "square", 0.1), 60);
}

/** BMO poke — dramatic squeal */
export function sfxBmoPoke() {
	playTone(400, 0.05, "square", 0.15);
	setTimeout(() => playTone(600, 0.05, "square", 0.15), 40);
	setTimeout(() => playTone(900, 0.06, "square", 0.14), 80);
	setTimeout(() => playTone(1200, 0.06, "triangle", 0.12), 120);
	setTimeout(() => playTone(1600, 0.08, "triangle", 0.1), 170);
	setTimeout(() => playTone(2000, 0.15, "sine", 0.08), 230);
}
