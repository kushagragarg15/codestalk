/** Lightweight badges & copy — keeps tone playful, not harsh */

export type Badge = { id: string; label: string; emoji: string };

export function badgesForStats(input: {
  streak: number;
  totalActiveDays: number;
  weeklySubs: number;
  contestRating: number | null;
}): Badge[] {
  const out: Badge[] = [];
  if (input.streak >= 30)
    out.push({ id: "streak_30", label: "Consistency beast", emoji: "🔥" });
  else if (input.streak >= 7)
    out.push({ id: "streak_7", label: "Week warrior", emoji: "⚔️" });
  if (input.totalActiveDays >= 200)
    out.push({ id: "grinder", label: "Year-round grinder", emoji: "🏋️" });
  if (input.weeklySubs >= 20) out.push({ id: "week_blitz", label: "Weekly blitz", emoji: "⚡" });
  if (input.contestRating != null && input.contestRating >= 2000)
    out.push({ id: "contest_elite", label: "Contest cracked", emoji: "🏆" });
  return out;
}

export function friendlyNudge(input: {
  activeToday: boolean;
  streak: number;
  weeklySubs: number;
}): string {
  if (!input.activeToday && input.streak >= 3) {
    return `Streak on the line — ${input.streak} days strong. One easy problem keeps the flame alive.`;
  }
  if (!input.activeToday) {
    return "No solves logged today — your friends might be stealing the green squares.";
  }
  if (input.weeklySubs >= 25) {
    return "You're out here carrying the group project called 'discipline.'";
  }
  if (input.streak === 0 && input.weeklySubs === 0) {
    return "Fresh start energy — pick one problem and close the loop.";
  }
  return "Solid pace — keep stacking small wins.";
}
