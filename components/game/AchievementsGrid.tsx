"use client";

import {
  Film,
  AudioLines,
  Sparkles,
  Target,
  Ear,
  Award,
  Flame,
  Calendar,
  Lock,
} from "lucide-react";
import { ACHIEVEMENTS } from "@/lib/game/achievements";
import { toArabicDigits } from "@/lib/utils/format";

const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>> = {
  Film,
  AudioLines,
  Sparkles,
  Target,
  Ear,
  Award,
  Flame,
  Calendar,
};

export function AchievementsGrid({
  unlocked,
}: {
  unlocked: string[];
}) {
  const unlockedSet = new Set(unlocked);
  const totalUnlocked = unlocked.length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] text-fg-muted">الإنجازات</span>
        <span dir="ltr" className="font-mono text-[11px] text-fg-muted tabular-nums">
          {totalUnlocked}/{totalCount}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {ACHIEVEMENTS.map((a) => {
          const Icon = ICONS[a.icon] ?? Award;
          const isUnlocked = unlockedSet.has(a.id);
          return (
            <div
              key={a.id}
              title={`${a.title}\n${a.description}`}
              className={`aspect-square rounded-lg border flex items-center justify-center transition-all ${
                isUnlocked
                  ? "border-accent/40 bg-accent/[0.06] text-accent"
                  : "border-border bg-surface/30 text-fg-faint"
              }`}
            >
              {isUnlocked ? (
                <Icon size={16} strokeWidth={1.5} />
              ) : (
                <Lock size={11} strokeWidth={1.5} />
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[10px] leading-relaxed text-fg-faint">
        مرّر فوق الشارة لرؤية تفاصيلها.
      </p>
    </div>
  );
}
