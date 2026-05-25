"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useGameStore } from "@/lib/stores/gameStore";
import { toArabicDigits } from "@/lib/utils/format";

export function LevelUpOverlay() {
  const pending = useGameStore((s) => s.pendingLevelUp);
  const consume = useGameStore((s) => s.consumeLevelUp);
  const [shown, setShown] = useState<number | null>(null);

  useEffect(() => {
    if (pending == null) return;
    setShown(pending);
    const t = setTimeout(() => {
      setShown(null);
      consume();
    }, 1800);
    return () => clearTimeout(t);
  }, [pending, consume]);

  return (
    <AnimatePresence>
      {shown !== null && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-50 grid place-items-center pointer-events-none"
          style={{ backgroundColor: "rgba(217, 119, 87, 0.08)" }}
        >
          <div className="relative flex flex-col items-center">
            <motion.span
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-xs uppercase tracking-[0.4em] text-fg-muted font-latin mb-4"
            >
              Level Up
            </motion.span>
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.05, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 18,
                delay: 0.1,
              }}
              className="relative"
            >
              <span
                dir="ltr"
                className="block font-latin font-extralight text-[160px] leading-none text-fg tabular-nums"
                style={{
                  textShadow: "0 0 80px rgba(217,119,87,0.4)",
                }}
              >
                {shown}
              </span>
              {/* Particles */}
              {Array.from({ length: 10 }).map((_, i) => (
                <span
                  key={i}
                  className="particle"
                  style={{
                    left: `${20 + ((i * 7) % 60)}%`,
                    top: "70%",
                    animationDelay: `${i * 80}ms`,
                  }}
                />
              ))}
            </motion.div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-3 text-sm text-fg-muted"
            >
              وصلت للمستوى {toArabicDigits(shown)}
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
