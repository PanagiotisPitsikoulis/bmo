import React, { useRef, useEffect } from "react";
import type { State } from "../lib/types";

const W = 64;
const H = 32;
const SCALE = 8;
const DOT_RADIUS = 3; // LED dot size
const GAP = SCALE; // pixel pitch = SCALE

export function BMOFace({ state }: { state: State }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const frameRef = useRef(0);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d")!;
		canvas.width = W * SCALE;
		canvas.height = H * SCALE;

		// Pixel buffer — we draw into this, then render as LED dots
		const pixels: string[][] = Array.from({ length: H }, () =>
			Array.from({ length: W }, () => "#111")
		);

		function setPixel(x: number, y: number, color: string) {
			if (x >= 0 && x < W && y >= 0 && y < H) pixels[y]![x] = color;
		}

		function fillRect(x: number, y: number, w: number, h: number, color: string) {
			for (let dy = 0; dy < h; dy++)
				for (let dx = 0; dx < w; dx++)
					setPixel(x + dx, y + dy, color);
		}

		function clearPixels(color: string) {
			for (let y = 0; y < H; y++)
				for (let x = 0; x < W; x++)
					pixels[y]![x] = color;
		}

		function renderLEDs() {
			// Dark PCB background
			ctx.fillStyle = "#0a0a0a";
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			for (let y = 0; y < H; y++) {
				for (let x = 0; x < W; x++) {
					const color = pixels[y]![x]!;
					const cx = x * GAP + GAP / 2;
					const cy = y * GAP + GAP / 2;

					// LED dot
					ctx.beginPath();
					ctx.arc(cx, cy, DOT_RADIUS, 0, Math.PI * 2);
					ctx.fillStyle = color;
					ctx.fill();

					// Glow effect for bright pixels
					if (color !== "#111" && color !== "#0a0a0a") {
						ctx.beginPath();
						ctx.arc(cx, cy, DOT_RADIUS + 1.5, 0, Math.PI * 2);
						ctx.fillStyle = color + "30"; // subtle glow
						ctx.fill();
					}
				}
			}
		}

		function drawEyes(eyeH: number, offsetX = 0) {
			fillRect(16 + offsetX, 10, 10, eyeH, "#ffffff");
			fillRect(38 + offsetX, 10, 10, eyeH, "#ffffff");
			if (eyeH >= 4) {
				fillRect(20 + offsetX, 12, 3, 3, "#141414");
				fillRect(42 + offsetX, 12, 3, 3, "#141414");
			}
		}

		function drawMouth(open: boolean) {
			if (open) fillRect(26, 22, 12, 4, "#141414");
			else fillRect(26, 23, 12, 1, "#141414");
		}

		let animId: number;
		function animate() {
			frameRef.current++;
			const f = frameRef.current;

			const bg = state === "error" ? "#b42828" : "#00c8a0";
			clearPixels(bg);

			switch (state) {
				case "idle": {
					drawEyes(f % 22 >= 20 ? 1 : 6);
					drawMouth(false);
					break;
				}
				case "listening": {
					drawEyes(8);
					const b = Math.floor(128 + 127 * Math.sin(f * 0.3));
					const hex = b.toString(16).padStart(2, "0");
					fillRect(31, 27, 2, 2, `#${hex}${hex}${hex}`);
					break;
				}
				case "thinking": {
					const offsets = [-3, -2, -1, 0, 1, 2, 3, 2, 1, 0, -1, -2];
					drawEyes(6, offsets[f % offsets.length]!);
					drawMouth(false);
					break;
				}
				case "speaking": {
					drawEyes(6);
					drawMouth(f % 4 < 2);
					break;
				}
				case "error": {
					for (let d = 0; d < 6; d++) {
						setPixel(17 + d, 10 + d, "#fff");
						setPixel(22 - d, 10 + d, "#fff");
						setPixel(39 + d, 10 + d, "#fff");
						setPixel(44 - d, 10 + d, "#fff");
					}
					drawMouth(false);
					break;
				}
			}

			renderLEDs();
			animId = setTimeout(() => requestAnimationFrame(animate), 100) as unknown as number;
		}

		animate();
		return () => clearTimeout(animId);
	}, [state]);

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
