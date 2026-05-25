"use client";

import { Flame } from "lucide-react";
import { toArabicDigits } from "@/lib/utils/format";

export function StreakBadge({
  current,
  best,
}: {
  current: number;
  best: number;
}) {
  const isHot = current >= 3;
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-surface/40 px-4 py-3">
      <div className="flex items-center gap-2.5">
        <Flame
          size={14}
          strokeWidth={1.5}
          className={isHot ? "text-accent" : "text-fg-faint"}
        />
        <span className="text-xs text-fg-muted">سلسلة الأيام</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          dir="ltr"
          className="font-latin text-lg font-medium text-fg tabular-nums"
        >
          {current}
        </span>
        <span className="text-[10px] text-fg-faint">
          أفضل {toArabicDigits(best)}
        </span>
      </div>
    </div>
  );
}
