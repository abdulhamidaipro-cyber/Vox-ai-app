import { daysBetween, formatToday } from "@/lib/utils/format";

/**
 * Updates streak based on today's activity.
 * - Same day → no change
 * - Yesterday → +1 to current, possibly update best
 * - Older → reset to 1
 * - Never active → start at 1
 */
export function tickStreak(
  lastActiveDate: string | null,
  currentStreak: number,
  bestStreak: number,
): { lastActiveDate: string; current: number; best: number } {
  const today = formatToday();

  if (!lastActiveDate) {
    return { lastActiveDate: today, current: 1, best: Math.max(1, bestStreak) };
  }

  if (lastActiveDate === today) {
    return { lastActiveDate: today, current: currentStreak, best: bestStreak };
  }

  const gap = daysBetween(lastActiveDate, today);
  if (gap === 1) {
    const next = currentStreak + 1;
    return {
      lastActiveDate: today,
      current: next,
      best: Math.max(next, bestStreak),
    };
  }

  return { lastActiveDate: today, current: 1, best: bestStreak };
}
