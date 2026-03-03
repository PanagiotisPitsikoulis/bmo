import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { motion, AnimatePresence } from "motion/react";
import { useParallax } from "./features/home/use-parallax";
import { sfxNavigate } from "./lib/sounds";

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
    document.documentElement.classList.add("dark");
  }, []);

  const initialRef = useRef(true);
  useEffect(() => {
    const onHashChange = () => {
      setHash(getHash());
      sfxNavigate();
    };
    window.addEventListener("hashchange", onHashChange);
    initialRef.current = false;
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

  const isHome = hash === "#/" || hash === "#";

  const { bgX, bgY, bgScale } = useParallax();

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center">
      <motion.div
        className="fixed inset-[-40px] bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: "url(/assets/adventure-time.webp)",
          x: bgX,
          y: bgY,
          scale: bgScale,
        }}
        animate={{
          y: [0, 4, 0, 2, 0],
          rotate: [0, 0.3, 0, -0.3, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <div className={`relative z-10 w-full flex flex-col items-center ${isHome ? "min-h-screen" : "min-h-screen p-8 gap-8"}`}>
        <Nav currentHash={hash} floating={isHome} />
        <AnimatePresence mode="wait">
          <motion.div
            key={hash}
            className={`w-full flex flex-col items-center ${isHome ? "min-h-screen" : "gap-8"}`}
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {page}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

const container = document.getElementById("root")!;
const root = (globalThis as any).__bmo_root ??= createRoot(container);
root.render(<App />);

// Force full remount on HMR so WebSocket connections and state reset cleanly
if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    root.unmount();
    delete (globalThis as any).__bmo_root;
  });
}
