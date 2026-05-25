"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { GameState } from "@/lib/types";
import { XP_PER_ACTION, getLevel } from "@/lib/game/leveling";
import { tickStreak } from "@/lib/game/streak";
import { checkUnlocks } from "@/lib/game/achievements";

interface GameStore extends GameState {
  /** Result of last successful action — pending events the UI must render. */
  pendingLevelUp: number | null;
  pendingAchievements: string[];
  /** Increment counters + xp after a successful workflow action. */
  recordSuccess: (kind: "reel" | "transcription") => void;
  /** Clear UI-side pending events after they've been shown. */
  consumeLevelUp: () => void;
  consumeAchievements: () => void;
  /** Hard reset (used by a hidden devtools shortcut, not part of UI). */
  reset: () => void;
}

const initial: GameState = {
  xp: 0,
  reelsCount: 0,
  transcriptionsCount: 0,
  streakCurrent: 0,
  streakBest: 0,
  lastActiveDate: null,
  unlockedAchievements: [],
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initial,
      pendingLevelUp: null,
      pendingAchievements: [],

      recordSuccess: (kind) => {
        const s = get();
        const prevLevel = getLevel(s.xp);

        const nextXp = s.xp + XP_PER_ACTION;
        const reels = kind === "reel" ? s.reelsCount + 1 : s.reelsCount;
        const transcriptions =
          kind === "transcription"
            ? s.transcriptionsCount + 1
            : s.transcriptionsCount;

        const streak = tickStreak(
          s.lastActiveDate,
          s.streakCurrent,
          s.streakBest,
        );

        const newLevel = getLevel(nextXp);
        const leveledUp = newLevel > prevLevel ? newLevel : null;

        const intermediate: GameState = {
          xp: nextXp,
          reelsCount: reels,
          transcriptionsCount: transcriptions,
          streakCurrent: streak.current,
          streakBest: streak.best,
          lastActiveDate: streak.lastActiveDate,
          unlockedAchievements: s.unlockedAchievements,
        };

        const newlyUnlocked = checkUnlocks(intermediate);

        set({
          ...intermediate,
          unlockedAchievements: [
            ...s.unlockedAchievements,
            ...newlyUnlocked,
          ],
          pendingLevelUp: leveledUp,
          pendingAchievements: [
            ...s.pendingAchievements,
            ...newlyUnlocked,
          ],
        });
      },

      consumeLevelUp: () => set({ pendingLevelUp: null }),
      consumeAchievements: () => set({ pendingAchievements: [] }),

      reset: () =>
        set({
          ...initial,
          pendingLevelUp: null,
          pendingAchievements: [],
        }),
    }),
    {
      name: "voxai-game-v1",
      // Don't persist pending events — they're UI-only ephemeral state
      partialize: (state) => ({
        xp: state.xp,
        reelsCount: state.reelsCount,
        transcriptionsCount: state.transcriptionsCount,
        streakCurrent: state.streakCurrent,
        streakBest: state.streakBest,
        lastActiveDate: state.lastActiveDate,
        unlockedAchievements: state.unlockedAchievements,
      }),
    },
  ),
);
