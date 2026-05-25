"use client";

import { motion } from "motion/react";
import { toArabicDigits } from "@/lib/utils/format";

export function LevelBadge({ level }: { level: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] uppercase tracking-[0.2em] text-fg-faint mb-2 font-latin">
        Level
      </span>
      <div className="relative">
        <motion.div
          key={level}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 22 }}
          className="grid place-items-center"
        >
          <span
            dir="ltr"
            className="font-latin font-light text-[88px] leading-none text-fg tabular-nums"
            style={{ fontFeatureSettings: '"ss01"' }}
          >
            {level}
          </span>
        </motion.div>
        <div className="mt-1 text-center text-xs text-fg-muted">
          المستوى {toArabicDigits(level)}
        </div>
      </div>
    </div>
  );
}
