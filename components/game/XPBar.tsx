"use client";

import { motion } from "motion/react";

export function XPBar({
  current,
  needed,
  ratio,
}: {
  current: number;
  needed: number;
  ratio: number;
}) {
  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-[11px] text-fg-muted">
        <span>التقدّم للمستوى التالي</span>
        <span dir="ltr" className="font-mono text-fg tabular-nums">
          {current}/{needed}
        </span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-surface-2">
        <motion.div
          initial={false}
          animate={{ width: `${Math.min(100, ratio * 100)}%` }}
          transition={{ type: "spring", stiffness: 150, damping: 24 }}
          className="h-full rounded-full bg-accent"
        />
      </div>
    </div>
  );
}
