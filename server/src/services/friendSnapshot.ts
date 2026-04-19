import {
  countSubmissionsInRange,
  formatDayKey,
  getCalendar,
  getContestRanking,
  getProfile,
  getRecentSubmissions,
  isActiveToday,
  parseSubmissionCalendar,
  startOfLocalDay,
  type RecentSubsPayload,
} from "./leetcodeService.js";

export type FriendSnapshot = {
  username: string;
  exists: boolean;
  avatar?: string;
  realName?: string;
  ranking?: number;
  difficulty: { easy: number; medium: number; hard: number };
  totalSolved: number;
  streak: number;
  totalActiveDays: number;
  contestRating: number | null;
  contestsAttended: number | null;
  activeToday: boolean;
  lastActiveAt: string | null;
  calendarYear: number;
  heatmap: Record<string, number>;
  counts: { daily: number; weekly: number; monthly: number };
  recentSubmissions: RecentSubsPayload["recentSubmissionList"];
};

export async function buildFriendSnapshot(username: string): Promise<FriendSnapshot> {
  const normalized = username.trim().toLowerCase();
  const year = new Date().getFullYear();
  const [profile, calendar, contest, recent] = await Promise.all([
    getProfile(normalized),
    getCalendar(normalized, year),
    getContestRanking(normalized),
    getRecentSubmissions(normalized, 15),
  ]);

  const mu = profile.matchedUser;
  const exists = Boolean(mu?.username);
  const ac = mu?.submitStats?.acSubmissionNum ?? [];
  let easy = 0,
    medium = 0,
    hard = 0;
  for (const row of ac) {
    const d = row.difficulty.toLowerCase();
    if (d.includes("easy")) easy = row.count;
    else if (d.includes("medium")) medium = row.count;
    else if (d.includes("hard")) hard = row.count;
  }
  const totalSolved = easy + medium + hard;

  const cal = calendar.matchedUser?.userCalendar;
  const heatmap = cal?.submissionCalendar ? parseSubmissionCalendar(cal.submissionCalendar) : {};
  const streak = cal?.streak ?? 0;
  const totalActiveDays = cal?.totalActiveDays ?? 0;

  const now = new Date();
  const today = startOfLocalDay(now);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const counts = {
    daily: heatmap[formatDayKey(today)] ?? 0,
    weekly: countSubmissionsInRange(heatmap, weekStart, today),
    monthly: countSubmissionsInRange(heatmap, monthStart, today),
  };

  const cr = contest.userContestRanking;
  const contestRating = cr?.rating ?? null;
  const contestsAttended = cr?.attendedContestsCount ?? null;

  const activeToday = isActiveToday(heatmap, now);

  let lastActiveAt: string | null = null;
  const subs = recent.recentSubmissionList?.submissions;
  if (subs?.length) {
    const maxTs = Math.max(
      ...subs.map((s) => {
        const n = Number(s.timestamp);
        const ms = Number.isFinite(n) ? (n < 1e12 ? n * 1000 : n) : 0;
        return ms;
      })
    );
    if (maxTs > 0) lastActiveAt = new Date(maxTs).toISOString();
  }
  if (!lastActiveAt) {
    let lastDay: string | null = null;
    for (const k of Object.keys(heatmap).sort()) {
      if ((heatmap[k] ?? 0) > 0) lastDay = k;
    }
    if (lastDay) lastActiveAt = new Date(`${lastDay}T23:59:59`).toISOString();
  }

  return {
    username: normalized,
    exists,
    avatar: mu?.profile?.userAvatar,
    realName: mu?.profile?.realName ?? undefined,
    ranking: mu?.profile?.ranking,
    difficulty: { easy, medium, hard },
    totalSolved,
    streak,
    totalActiveDays,
    contestRating,
    contestsAttended,
    activeToday,
    lastActiveAt,
    calendarYear: year,
    heatmap,
    counts,
    recentSubmissions: recent.recentSubmissionList,
  };
}
