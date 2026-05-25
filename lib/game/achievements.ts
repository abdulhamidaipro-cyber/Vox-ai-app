import type { Achievement, GameState } from "@/lib/types";
import { getLevel } from "./leveling";

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-reel",
    title: "أول ريل",
    description: "حمّلت أول ريل من إنستقرام.",
    icon: "Film",
  },
  {
    id: "first-transcription",
    title: "أول تفريغ",
    description: "حوّلت أول رسالة صوتية إلى نص.",
    icon: "AudioLines",
  },
  {
    id: "polyglot",
    title: "متعدّد المواهب",
    description: "استخدمت الميزتين الصوت والريل.",
    icon: "Sparkles",
  },
  {
    id: "reel-hunter",
    title: "صيّاد الريلز",
    description: "حمّلت ١٠ ريلز.",
    icon: "Target",
  },
  {
    id: "good-listener",
    title: "مستمع جيّد",
    description: "فرّغت ١٠ رسائل صوتية.",
    icon: "Ear",
  },
  {
    id: "level-5",
    title: "محترف",
    description: "وصلت للمستوى الخامس.",
    icon: "Award",
  },
  {
    id: "streak-3",
    title: "ثلاثة أيام",
    description: "استخدمت التطبيق ثلاثة أيام متتالية.",
    icon: "Flame",
  },
  {
    id: "streak-7",
    title: "أسبوع كامل",
    description: "سبعة أيام بدون انقطاع.",
    icon: "Calendar",
  },
];

export function checkUnlocks(state: GameState): string[] {
  const newly: string[] = [];
  const has = (id: string) => state.unlockedAchievements.includes(id);

  if (state.reelsCount >= 1 && !has("first-reel")) newly.push("first-reel");
  if (state.transcriptionsCount >= 1 && !has("first-transcription"))
    newly.push("first-transcription");
  if (state.reelsCount >= 1 && state.transcriptionsCount >= 1 && !has("polyglot"))
    newly.push("polyglot");
  if (state.reelsCount >= 10 && !has("reel-hunter")) newly.push("reel-hunter");
  if (state.transcriptionsCount >= 10 && !has("good-listener"))
    newly.push("good-listener");
  if (getLevel(state.xp) >= 5 && !has("level-5")) newly.push("level-5");
  if (state.streakCurrent >= 3 && !has("streak-3")) newly.push("streak-3");
  if (state.streakCurrent >= 7 && !has("streak-7")) newly.push("streak-7");

  return newly;
}

export function achievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
