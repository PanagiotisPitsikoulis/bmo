import { useEffect } from "react";
import {
	useMotionValue,
	useSpring,
	useTransform,
	type MotionValue,
} from "motion/react";

const SPRING_CONFIG = { stiffness: 50, damping: 20 };

export interface ParallaxValues {
	bmoX: MotionValue<number>;
	bmoY: MotionValue<number>;
	bmoRotate: MotionValue<number>;
	bgX: MotionValue<number>;
	bgY: MotionValue<number>;
	bgScale: MotionValue<number>;
}

export function useParallax(): ParallaxValues {
	const mouseX = useMotionValue(0);
	const mouseY = useMotionValue(0);

	const smoothX = useSpring(mouseX, SPRING_CONFIG);
	const smoothY = useSpring(mouseY, SPRING_CONFIG);

	// BMO moves opposite to background (follows cursor)
	const bmoX = useTransform(smoothX, [-1, 1], [-60, 60]);
	const bmoY = useTransform(smoothY, [-1, 1], [-30, 30]);
	const bmoRotate = useTransform(smoothX, [-1, 1], [-8, 8]);

	// Background shifts with cursor
	const bgX = useTransform(smoothX, [-1, 1], [20, -20]);
	const bgY = useTransform(smoothY, [-1, 1], [15, -15]);
	const bgScale = useTransform(smoothY, [-1, 1], [1.08, 1.12]);

	useEffect(() => {
		function handleMouse(e: MouseEvent) {
			const x = (e.clientX / window.innerWidth - 0.5) * 2;
			const y = (e.clientY / window.innerHeight - 0.5) * 2;
			mouseX.set(x);
			mouseY.set(y);
		}
		window.addEventListener("mousemove", handleMouse);
		return () => window.removeEventListener("mousemove", handleMouse);
	}, []);

	return { bmoX, bmoY, bmoRotate, bgX, bgY, bgScale };
}
