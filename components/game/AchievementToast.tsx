"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Award } from "lucide-react";
import { useGameStore } from "@/lib/stores/gameStore";
import { achievementById } from "@/lib/game/achievements";

export function AchievementToastBridge() {
  const pending = useGameStore((s) => s.pendingAchievements);
  const consume = useGameStore((s) => s.consumeAchievements);

  useEffect(() => {
    if (pending.length === 0) return;
    pending.forEach((id, i) => {
      const ach = achievementById(id);
      if (!ach) return;
      setTimeout(() => {
        toast.custom(
          () => (
            <div className="flex items-start gap-3 rounded-xl border border-accent/30 bg-surface px-4 py-3 shadow-lg min-w-[280px]">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                <Award size={14} strokeWidth={1.5} />
              </div>
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-[0.2em] text-fg-faint font-latin mb-0.5">
                  Achievement
                </div>
                <div className="text-sm font-medium text-fg leading-tight">
                  {ach.title}
                </div>
                <div className="mt-1 text-xs text-fg-muted leading-relaxed">
                  {ach.description}
                </div>
              </div>
            </div>
          ),
          { duration: 3500 },
        );
      }, i * 600);
    });
    consume();
  }, [pending, consume]);

  return null;
}
