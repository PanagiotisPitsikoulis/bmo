import React, { useRef } from "react";
import { motion, useAnimationControls } from "motion/react";
import { useParallax } from "../features/home/use-parallax";
import { Button } from "../components/ui/button";
import { ConstructionBanner } from "../components/construction-banner";
import { sfxBmoPoke } from "../lib/sounds";

export function Home() {
  const { bmoX, bmoY, bmoRotate } = useParallax();
  const bmoControls = useAnimationControls();
  const poking = useRef(false);

  function handlePoke() {
    if (poking.current) return;
    poking.current = true;
    sfxBmoPoke();
    bmoControls
      .start({
        scale: [1, 1.25, 0.85, 1.15, 0.95, 1.05, 1],
        rotate: [0, -15, 12, -8, 5, -2, 0],
        y: [0, -60, 20, -30, 10, -5, 0],
        transition: { duration: 0.7, ease: "easeOut" },
      })
      .then(() => {
        poking.current = false;
      });
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center z-0 overflow-hidden">
      <div className="relative mt-24 w-full max-w-2xl px-8 py-8 rounded-base border-2 border-border bg-secondary-background shadow-shadow flex flex-col items-center text-center z-10">
        <h1 className="text-3xl md:text-5xl font-heading">
          Assemble BMO
          <br />
          <span>Starter Pack</span>
        </h1>
        <p className="mt-4 text-base text-muted-foreground max-w-md">
          Easily Build Your, Real-Life Talking Robot From Adventure Time.
          (Budget-Friendly I Swear)
        </p>
        <div className="flex gap-4 mt-10">
          <Button asChild size="lg">
            <a href="#/test">Play Around</a>
          </Button>
          <Button asChild variant="neutral" size="lg">
            <a href="#/instructions">Build BMO IRL</a>
          </Button>
        </div>
      </div>

      <motion.img
        src="/assets/bmo.webp"
        alt="BMO"
        className="mt-auto h-[65vh] w-auto drop-shadow-[0_0_40px_rgba(0,0,0,0.3)] translate-y-24 z-10 cursor-pointer"
        style={{
          x: bmoX,
          y: bmoY,
          rotate: bmoRotate,
        }}
        animate={bmoControls}
        whileHover={{ y: -40, transition: { type: "spring", stiffness: 120, damping: 14 } }}
        onClick={handlePoke}
      />

      <div className="absolute bottom-24 left-0 right-0 h-0 z-0">
        <div className="absolute left-1/2 -translate-x-1/2 w-[200vw]">
          <ConstructionBanner text="⚠ NOT OFFICIALLY AFFILIATED WITH ADVENTURE TIME ⚠ BUILT WITH LOVE AND ZERO BUDGET ⚠ IF BMO GAINS SENTIENCE WE ARE NOT LIABLE ⚠" />
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 w-[200vw]">
          <ConstructionBanner
            flip
            text="⚠ THIS IS A FAN PROJECT ⚠ NO PRINCESSES WERE HARMED IN THE MAKING OF THIS ⚠ BMO IS REAL IN OUR HEARTS ⚠ MATHEMATICAL! ⚠"
          />
        </div>
      </div>
    </div>
  );
}
