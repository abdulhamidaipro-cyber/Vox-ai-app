// Each successful action awards 10 XP.
// Level N→N+1 requires 50*N XP (cumulative: 50, 150, 300, 500, ...).
// So level 1→2 is 5 messages, 2→3 is 10 more (15 total), etc.

export const XP_PER_ACTION = 10;

export function getLevel(xp: number): number {
  // Solve: cumulative = 50 * N*(N+1)/2 = 25 * N*(N+1)
  // For total xp T, max N where 25*N*(N+1) <= T
  let level = 1;
  let need = 50;
  let cumul = 0;
  while (cumul + need <= xp) {
    cumul += need;
    level += 1;
    need = 50 * level;
  }
  return level;
}

export function xpForLevel(level: number): number {
  // XP required cumulatively to reach `level`
  if (level <= 1) return 0;
  return 25 * (level - 1) * level;
}

export function getProgressInLevel(xp: number): {
  level: number;
  current: number; // xp within current level
  needed: number; // xp needed to next level
  ratio: number; // 0..1
} {
  const level = getLevel(xp);
  const floor = xpForLevel(level);
  const ceiling = xpForLevel(level + 1);
  const current = xp - floor;
  const needed = ceiling - floor;
  return {
    level,
    current,
    needed,
    ratio: needed > 0 ? current / needed : 0,
  };
}
