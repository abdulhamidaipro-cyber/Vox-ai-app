"use client";

import { useEffect, useState } from "react";
import { useGameStore } from "@/lib/stores/gameStore";
import { getProgressInLevel } from "@/lib/game/leveling";
import { LevelBadge } from "./LevelBadge";
import { XPBar } from "./XPBar";
import { StreakBadge } from "./StreakBadge";
import { StatsRow } from "./StatsRow";
import { AchievementsGrid } from "./AchievementsGrid";

export function GamePanel() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const xp = useGameStore((s) => s.xp);
  const reels = useGameStore((s) => s.reelsCount);
  const transcriptions = useGameStore((s) => s.transcriptionsCount);
  const streakCurrent = useGameStore((s) => s.streakCurrent);
  const streakBest = useGameStore((s) => s.streakBest);
  const unlocked = useGameStore((s) => s.unlockedAchievements);

  // Avoid SSR/CSR mismatch from persisted store
  if (!hydrated) {
    return <div className="hidden lg:block w-full max-w-[320px]" aria-hidden />;
  }

  const prog = getProgressInLevel(xp);

  return (
    <aside className="hidden lg:flex flex-col w-full max-w-[320px] shrink-0 border-s border-border bg-bg/40">
      <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
        <div className="flex flex-col items-center gap-5 py-2">
          <LevelBadge level={prog.level} />
          <div className="w-full">
            <XPBar
              current={prog.current}
              needed={prog.needed}
              ratio={prog.ratio}
            />
          </div>
        </div>

        <div className="h-px bg-border" />

        <StreakBadge current={streakCurrent} best={streakBest} />

        <StatsRow reels={reels} transcriptions={transcriptions} />

        <div className="h-px bg-border" />

        <AchievementsGrid unlocked={unlocked} />

        <div className="mt-auto pt-4 text-center">
          <p className="text-[10px] text-fg-faint leading-relaxed">
            +١٠ نقاط لكل ريل أو تفريغ ناجح.
            <br />
            ١٠ نقاط = ٥ رسائل للمستوى التالي.
          </p>
        </div>
      </div>
    </aside>
  );
}
