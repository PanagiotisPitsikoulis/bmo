import React, { useRef } from "react";
import { motion, useAnimationControls } from "motion/react";
import { ArrowLeft } from "@phosphor-icons/react";
import { useInstructions } from "../features/instructions/use-instructions";
import { useParallax } from "../features/home/use-parallax";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { sfxBmoPoke } from "../lib/sounds";

function BmoCorner() {
  const { bmoX, bmoY, bmoRotate } = useParallax();
  const controls = useAnimationControls();
  const poking = useRef(false);

  function handlePoke() {
    if (poking.current) return;
    poking.current = true;
    sfxBmoPoke();
    controls
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
    <motion.img
      src="/assets/bmo.webp"
      alt="BMO"
      className="fixed bottom-0 left-1/2 -translate-x-1/2 h-[65vh] translate-y-[60%] z-0 drop-shadow-[0_0_40px_rgba(0,0,0,0.3)] cursor-pointer"
      style={{ x: bmoX, y: bmoY, rotate: bmoRotate }}
      animate={controls}
      whileHover={{ y: -40, transition: { type: "spring", stiffness: 120, damping: 14 } }}
      onClick={handlePoke}
    />
  );
}

export function Instructions() {
  const { sections, activeSection, activeHtml, openSection, goBack } =
    useInstructions();

  if (activeSection) {
    return (
      <>
        <Button variant="neutral" onClick={goBack}>
          <ArrowLeft />
          Back
        </Button>
        <Card className="max-w-2xl w-full">
          <CardContent>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: activeHtml! }}
            />
          </CardContent>
        </Card>
        <div className="pb-64" />
        <BmoCorner />
      </>
    );
  }

  return (
    <>
      <Card className="max-w-2xl w-full">
        <CardContent className="flex flex-col items-center gap-8">
          <h1 className="text-2xl font-heading">Coming Soon</h1>
        </CardContent>
      </Card>

      <Card className="max-w-2xl w-full">
        <CardContent className="flex flex-col items-center gap-8">
          <h1 className="text-2xl font-heading">Build BMO IRL</h1>
          <div className="grid grid-cols-2 gap-3 w-full">
            {sections.map((section, i) => (
              <Button
                key={section.label}
                variant="neutral"
                onClick={() => openSection(i)}
                className="h-auto py-6 text-sm uppercase tracking-wider"
              >
                {section.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="max-w-2xl w-full">
        <CardContent className="flex flex-col items-center gap-8">
          <h1 className="text-2xl font-heading">Coming Soon</h1>
        </CardContent>
      </Card>

      <div className="pb-64" />
      <BmoCorner />
    </>
  );
}
