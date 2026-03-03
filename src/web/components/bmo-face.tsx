import React, { useRef, useEffect } from "react";
import type { State, Emotion } from "../lib/types";

const W = 64;
const H = 32;
const SCALE = 8;
const DOT_RADIUS = 3;
const GAP = SCALE;

// Show-accurate BMO color palette
const BG = "#00c8a0";
const DOT = "#141414";
const MOUTH_FILL = "#006e58";
const TEETH = "#ffffff";
const TONGUE = "#f0788c";
const HEART_C = "#dc3250";
const BLUSH_C = "#ff82a0";
const Z_COL = "#c8c8c8";
const ERROR_BG = "#b42828";

// Eye anchor positions (top-left of 4x4 bounding box)
const LE = { x: 18, y: 10 };
const RE = { x: 42, y: 10 };
const MOUTH_Y = 23;

export function BMOFace({ state, emotion = "normal" }: { state: State; emotion?: Emotion }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const frameRef = useRef(0);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d")!;
		canvas.width = W * SCALE;
		canvas.height = H * SCALE;

		const pixels: string[][] = Array.from({ length: H }, () =>
			Array.from({ length: W }, () => "#111")
		);

		function sp(x: number, y: number, color: string) {
			if (x >= 0 && x < W && y >= 0 && y < H) pixels[y]![x] = color;
		}

		function fr(x: number, y: number, w: number, h: number, color: string) {
			for (let dy = 0; dy < h; dy++)
				for (let dx = 0; dx < w; dx++)
					sp(x + dx, y + dy, color);
		}

		function clearPixels(color: string) {
			for (let y = 0; y < H; y++)
				for (let x = 0; x < W; x++)
					pixels[y]![x] = color;
		}

		function renderLEDs() {
			ctx.fillStyle = "#0a0a0a";
			ctx.fillRect(0, 0, canvas!.width, canvas!.height);

			for (let y = 0; y < H; y++) {
				for (let x = 0; x < W; x++) {
					const color = pixels[y]![x]!;
					const cx = x * GAP + GAP / 2;
					const cy = y * GAP + GAP / 2;

					ctx.beginPath();
					ctx.arc(cx, cy, DOT_RADIUS, 0, Math.PI * 2);
					ctx.fillStyle = color;
					ctx.fill();

					if (color !== "#111" && color !== "#0a0a0a") {
						ctx.beginPath();
						ctx.arc(cx, cy, DOT_RADIUS + 1.5, 0, Math.PI * 2);
						ctx.fillStyle = color + "30";
						ctx.fill();
					}
				}
			}
		}

		// ═══════════════════════════════════════
		// EYE TYPES
		// ═══════════════════════════════════════

		// Dot eye: 4x4 rounded circle
		function dotEye(x: number, y: number) {
			sp(x + 1, y, DOT); sp(x + 2, y, DOT);
			fr(x, y + 1, 4, 2, DOT);
			sp(x + 1, y + 3, DOT); sp(x + 2, y + 3, DOT);
		}

		function dotEyes(ox: number = 0) {
			dotEye(LE.x + ox, LE.y);
			dotEye(RE.x + ox, RE.y);
		}

		// Blink: thin horizontal line
		function blinkEyes(ox: number = 0) {
			fr(LE.x + ox, LE.y + 1, 4, 2, DOT);
			fr(RE.x + ox, RE.y + 1, 4, 2, DOT);
		}

		// Crescent eye: happy closed ∪ shape (6x3)
		function crescentEye(x: number, y: number) {
			sp(x, y, DOT); sp(x + 5, y, DOT);
			sp(x + 1, y + 1, DOT); sp(x + 4, y + 1, DOT);
			sp(x + 2, y + 2, DOT); sp(x + 3, y + 2, DOT);
		}

		function crescentEyes() {
			crescentEye(LE.x - 1, LE.y + 1);
			crescentEye(RE.x - 1, RE.y + 1);
		}

		// Half-closed/sleepy eyes: flat horizontal lines
		function sleepyEyeLines() {
			fr(LE.x, LE.y + 2, 5, 1, DOT);
			fr(RE.x, RE.y + 2, 5, 1, DOT);
		}

		// Oval/scared eyes: 4x7 tall ovals (for error)
		function ovalEye(x: number, y: number, c: string) {
			sp(x + 1, y, c); sp(x + 2, y, c);
			fr(x, y + 1, 4, 5, c);
			sp(x + 1, y + 6, c); sp(x + 2, y + 6, c);
		}

		function ovalEyes(c: string) {
			ovalEye(LE.x, LE.y - 2, c);
			ovalEye(RE.x, RE.y - 2, c);
		}

		// ═══════════════════════════════════════
		// MOUTH TYPES
		// ═══════════════════════════════════════

		// Flat line mouth
		function lineMouth(w: number = 14) {
			fr(32 - Math.floor(w / 2), MOUTH_Y, w, 1, DOT);
		}

		// Smile curve
		function smileMouth(w: number = 14) {
			const cx = 32, half = Math.floor(w / 2);
			for (let dx = -half; dx <= half; dx++) {
				const a = Math.abs(dx);
				let dy = 0;
				if (a >= half) dy = -2;
				else if (a >= Math.floor(w * 0.4)) dy = -1;
				sp(cx + dx, MOUTH_Y + dy, DOT);
			}
		}

		// Frown curve
		function frownMouth(w: number = 14) {
			const cx = 32, half = Math.floor(w / 2);
			for (let dx = -half; dx <= half; dx++) {
				const a = Math.abs(dx);
				let dy = 0;
				if (a >= half) dy = 2;
				else if (a >= Math.floor(w * 0.4)) dy = 1;
				sp(cx + dx, MOUTH_Y + dy, DOT);
			}
		}

		// Open mouth: dark green D-shape with dark outline
		function openMouth(w: number = 12, h: number = 5) {
			const x = 32 - Math.floor(w / 2);
			const y = MOUTH_Y - 1;
			fr(x, y, w, h, DOT);
			if (w > 2 && h > 2) {
				fr(x + 1, y + 1, w - 2, h - 2, MOUTH_FILL);
			}
		}

		// Big open mouth with teeth + tongue (hungry)
		function teethMouth() {
			const w = 16, h = 7;
			const x = 32 - Math.floor(w / 2);
			const y = 20;
			fr(x, y, w, h, DOT);
			fr(x + 1, y + 1, w - 2, h - 2, MOUTH_FILL);
			// Top teeth: 3 white blocks
			for (let i = 0; i < 3; i++) {
				fr(x + 2 + i * 4, y + 1, 3, 2, TEETH);
			}
			// Tongue at bottom center
			fr(x + 4, y + h - 3, w - 8, 2, TONGUE);
		}

		// Wavy/scared mouth (error)
		function wavyMouth() {
			for (let dx = -6; dx <= 6; dx++) {
				const dy = Math.round(Math.sin(dx * 1.2) * 1.5);
				sp(32 + dx, MOUTH_Y + dy, DOT);
			}
		}

		// ═══════════════════════════════════════
		// EXTRAS
		// ═══════════════════════════════════════

		function drawHeart(x: number, y: number, color: string) {
			const p = [
				[0,1,1,0,1,1,0],
				[1,1,1,1,1,1,1],
				[1,1,1,1,1,1,1],
				[0,1,1,1,1,1,0],
				[0,0,1,1,1,0,0],
				[0,0,0,1,0,0,0],
			];
			for (let dy = 0; dy < p.length; dy++)
				for (let dx = 0; dx < p[0]!.length; dx++)
					if (p[dy]![dx]) sp(x + dx, y + dy, color);
		}

		function drawSmallHeart(x: number, y: number, color: string) {
			const p = [[0,1,0,1,0],[1,1,1,1,1],[0,1,1,1,0],[0,0,1,0,0]];
			for (let dy = 0; dy < p.length; dy++)
				for (let dx = 0; dx < p[0]!.length; dx++)
					if (p[dy]![dx]) sp(x + dx, y + dy, color);
		}

		function drawBlush() {
			fr(LE.x - 4, LE.y + 6, 3, 2, BLUSH_C);
			fr(RE.x + 5, RE.y + 6, 3, 2, BLUSH_C);
		}

		function drawZ(x: number, y: number, size: number) {
			for (let dx = 0; dx < size; dx++) sp(x + dx, y, Z_COL);
			for (let d = 0; d < size; d++) sp(x + size - 1 - d, y + d, Z_COL);
			for (let dx = 0; dx < size; dx++) sp(x + dx, y + size - 1, Z_COL);
		}

		function drawZs(phase: number) {
			const zs = [{ x: 50, y: 20, s: 4 }, { x: 54, y: 15, s: 3 }, { x: 57, y: 11, s: 2 }];
			for (const z of zs) {
				const yy = z.y - (phase % 16);
				if (yy >= 0 && yy + z.s < H) drawZ(z.x, yy, z.s);
			}
		}

		function drawStressMarks() {
			sp(LE.x - 3, LE.y, DOT); sp(LE.x - 2, LE.y + 1, DOT); sp(LE.x - 3, LE.y + 2, DOT);
			sp(RE.x + 6, RE.y, DOT); sp(RE.x + 7, RE.y + 1, DOT); sp(RE.x + 6, RE.y + 2, DOT);
		}

		// Listening indicator dot
		function listeningDot(f: number) {
			const b = Math.floor(128 + 127 * Math.sin((f / 8) * Math.PI * 2));
			const hex = b.toString(16).padStart(2, "0");
			fr(31, 28, 2, 2, `#${hex}${hex}${hex}`);
		}

		// ═══════════════════════════════════════
		// ANIMATION LOOP
		// ═══════════════════════════════════════

		let animId: number;
		function animate() {
			frameRef.current++;
			const f = frameRef.current;

			// Error overrides everything
			if (state === "error") {
				clearPixels(ERROR_BG);
				ovalEyes("#ffffff");
				wavyMouth();
				drawStressMarks();
				renderLEDs();
				animId = setTimeout(() => requestAnimationFrame(animate), 100) as unknown as number;
				return;
			}

			clearPixels(BG);

			switch (emotion) {
				case "happy": {
					switch (state) {
						case "idle":
							crescentEyes();
							smileMouth();
							break;
						case "listening":
							crescentEyes();
							smileMouth();
							listeningDot(f);
							break;
						case "thinking": {
							const offsets = [-3, -2, -1, 0, 1, 2, 3, 2, 1, 0, -1, -2];
							dotEyes(offsets[f % offsets.length]!);
							smileMouth();
							break;
						}
						case "speaking":
							crescentEyes();
							if (f % 4 < 2) openMouth(); else smileMouth();
							break;
						default:
							crescentEyes();
							smileMouth();
					}
					break;
				}

				case "sad": {
					switch (state) {
						case "idle":
							if (f % 30 >= 28) blinkEyes(); else dotEyes();
							frownMouth();
							break;
						case "listening":
							dotEyes();
							frownMouth();
							listeningDot(f);
							break;
						case "thinking": {
							const offsets = [-3, -2, -1, 0, 1, 2, 3, 2, 1, 0, -1, -2];
							dotEyes(offsets[f % offsets.length]!);
							frownMouth();
							break;
						}
						case "speaking":
							dotEyes();
							if (f % 4 < 2) openMouth(); else frownMouth();
							break;
						default:
							dotEyes();
							frownMouth();
					}
					break;
				}

				case "hungry": {
					switch (state) {
						case "idle":
							dotEyes();
							if (Math.floor(f / 3) % 2 === 0) teethMouth(); else lineMouth(16);
							break;
						case "listening":
							dotEyes();
							teethMouth();
							listeningDot(f);
							break;
						case "thinking": {
							const offsets = [-3, -2, -1, 0, 1, 2, 3, 2, 1, 0, -1, -2];
							dotEyes(offsets[f % offsets.length]!);
							teethMouth();
							break;
						}
						case "speaking":
							dotEyes();
							if (f % 4 < 2) teethMouth(); else lineMouth(16);
							break;
						default:
							dotEyes();
							teethMouth();
					}
					break;
				}

				case "in_love": {
					switch (state) {
						case "idle":
							crescentEyes();
							drawBlush();
							smileMouth(10);
							if (f % 4 < 2) {
								drawSmallHeart(8, 4, HEART_C);
								drawSmallHeart(52, 4, HEART_C);
							} else {
								drawHeart(7, 3, HEART_C);
								drawHeart(51, 3, HEART_C);
							}
							break;
						case "listening":
							crescentEyes();
							drawBlush();
							smileMouth(10);
							listeningDot(f);
							break;
						case "thinking":
							crescentEyes();
							drawBlush();
							smileMouth(10);
							break;
						case "speaking":
							crescentEyes();
							drawBlush();
							if (f % 4 < 2) openMouth(10, 4); else smileMouth(10);
							break;
						default:
							crescentEyes();
							drawBlush();
							smileMouth(10);
					}
					break;
				}

				case "sleepy": {
					switch (state) {
						case "idle":
							sleepyEyeLines();
							lineMouth(8);
							drawZs(f);
							break;
						case "listening":
							sleepyEyeLines();
							lineMouth(8);
							drawZs(f);
							listeningDot(f);
							break;
						case "thinking":
							sleepyEyeLines();
							lineMouth(8);
							drawZs(f);
							break;
						case "speaking":
							sleepyEyeLines();
							if (f % 4 < 2) openMouth(8, 4); else lineMouth(8);
							drawZs(f);
							break;
						default:
							sleepyEyeLines();
							lineMouth(8);
							drawZs(0);
					}
					break;
				}

				default: {
					switch (state) {
						case "idle":
							if (f % 22 >= 20) blinkEyes(); else dotEyes();
							lineMouth();
							break;
						case "listening":
							dotEyes();
							lineMouth();
							listeningDot(f);
							break;
						case "thinking": {
							const offsets = [-3, -2, -1, 0, 1, 2, 3, 2, 1, 0, -1, -2];
							dotEyes(offsets[f % offsets.length]!);
							lineMouth();
							break;
						}
						case "speaking":
							dotEyes();
							if (f % 4 < 2) openMouth(); else lineMouth();
							break;
						default:
							dotEyes();
							lineMouth();
					}
				}
			}

			renderLEDs();
			animId = setTimeout(() => requestAnimationFrame(animate), 100) as unknown as number;
		}

		animate();
		return () => clearTimeout(animId);
	}, [state, emotion]);

	return (
		<div className="w-full rounded-xl bg-[#0c0c0c] p-3 border-2 border-[#2a2a2a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.6),0_0_30px_rgba(0,200,160,0.1)]">
			<div className="relative rounded-lg overflow-hidden border border-[#1a1a1a]">
				<canvas
					ref={canvasRef}
					className="w-full block"
				/>
				<div className="absolute inset-0 pointer-events-none rounded-lg shadow-[inset_0_0_40px_rgba(0,0,0,0.4)]" />
			</div>
			<div className="flex items-center justify-between mt-2 px-1">
				<div className="flex gap-1.5">
					<div className="w-1.5 h-1.5 rounded-full bg-[#00c8a0] shadow-[0_0_4px_rgba(0,200,160,0.6)]" />
					<div className="w-1.5 h-1.5 rounded-full bg-[#333]" />
				</div>
				<span className="text-[9px] uppercase tracking-[0.2em] text-[#333] font-mono">LED Matrix</span>
				<div className="flex gap-1.5">
					<div className="w-1.5 h-1.5 rounded-full bg-[#333]" />
					<div className="w-1.5 h-1.5 rounded-full bg-[#333]" />
				</div>
			</div>
		</div>
	);
}
