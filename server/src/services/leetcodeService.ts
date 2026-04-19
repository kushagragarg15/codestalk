import { loadEnv } from "../config/env";
import { getCached, setCached } from "./cacheService";

const LEETCODE_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  Origin: "https://leetcode.com",
  Referer: "https://leetcode.com/",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

function useAlfa(): boolean {
  return loadEnv().LEETCODE_PROVIDER === "alfa";
}

/** Alfa wraps GraphQL errors when a username is invalid */
function alfaIndicatesUserMissing(body: unknown): boolean {
  if (body == null || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  if (Array.isArray(b.errors) && b.errors.length) {
    const txt = (b.errors as { message?: string }[])
      .map((e) => e.message ?? "")
      .join(" ");
    if (/does not exist|not exist/i.test(txt)) return true;
  }
  const data = b.data as { matchedUser?: unknown } | undefined;
  if (data && data.matchedUser === null) return true;
  return false;
}

async function alfaRequest(path: string): Promise<unknown> {
  const env = loadEnv();
  const base = env.ALFA_LEETCODE_API_URL.replace(/\/$/, "");
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const maxAttempts = 4;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
      });
      if (res.status === 429) {
        await sleep(500 * attempt * attempt);
        continue;
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Alfa API HTTP ${res.status}: ${text.slice(0, 200)}`);
      }
      return (await res.json()) as unknown;
    } catch (e) {
      lastErr = e;
      if (attempt < maxAttempts) await sleep(300 * attempt);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Alfa API request failed");
}

type AlfaAcRow = { difficulty: string; count: number; submissions: number };

type AlfaProfileFlat = {
  totalSolved?: number;
  ranking?: number;
  easySolved?: number;
  mediumSolved?: number;
  hardSolved?: number;
  matchedUserStats?: { acSubmissionNum?: AlfaAcRow[] };
  totalSubmissions?: AlfaAcRow[];
};

function rowsFromAlfaProfile(p: AlfaProfileFlat): AlfaAcRow[] {
  const fromStats = p.matchedUserStats?.acSubmissionNum?.filter((x) => x.difficulty !== "All");
  if (fromStats?.length) return fromStats;
  const easy = p.easySolved ?? 0;
  const med = p.mediumSolved ?? 0;
  const hard = p.hardSolved ?? 0;
  return [
    { difficulty: "Easy", count: easy, submissions: easy },
    { difficulty: "Medium", count: med, submissions: med },
    { difficulty: "Hard", count: hard, submissions: hard },
  ];
}

async function fetchAlfaProfilePayload(username: string): Promise<ProfilePayload> {
  const u = encodeURIComponent(username);
  const [rawProfile, rawUser] = await Promise.all([
    alfaRequest(`/${u}/profile`),
    alfaRequest(`/${u}`),
  ]);
  if (alfaIndicatesUserMissing(rawProfile)) {
    return { matchedUser: null };
  }
  const p = rawProfile as AlfaProfileFlat;
  if (typeof p.totalSolved !== "number" && !p.matchedUserStats?.acSubmissionNum?.length) {
    return { matchedUser: null };
  }
  const card = alfaIndicatesUserMissing(rawUser)
    ? undefined
    : (rawUser as { username?: string; name?: string; avatar?: string; ranking?: number });
  const rows = rowsFromAlfaProfile(p);
  return {
    matchedUser: {
      username,
      profile: {
        ranking: p.ranking ?? card?.ranking,
        userAvatar: card?.avatar,
        realName: card?.name ?? undefined,
      },
      submitStats: { acSubmissionNum: rows },
    },
  };
}

async function fetchAlfaCalendarPayload(username: string, year: number): Promise<CalendarPayload> {
  const u = encodeURIComponent(username);
  const raw = await alfaRequest(`/${u}/calendar?year=${year}`);
  if (alfaIndicatesUserMissing(raw)) {
    return { matchedUser: null };
  }
  const c = raw as {
    activeYears?: number[];
    streak?: number;
    totalActiveDays?: number;
    dccStreak?: number;
    submissionCalendar?: string;
  };
  return {
    matchedUser: {
      userCalendar: {
        activeYears: c.activeYears ?? [],
        streak: c.streak ?? 0,
        totalActiveDays: c.totalActiveDays ?? 0,
        dccStreak: c.dccStreak ?? 0,
        submissionCalendar: typeof c.submissionCalendar === "string" ? c.submissionCalendar : "{}",
      },
    },
  };
}

async function fetchAlfaRecentPayload(username: string, limit: number): Promise<RecentSubsPayload> {
  const u = encodeURIComponent(username);
  const raw = await alfaRequest(`/${u}/submission?limit=${limit}`);
  if (alfaIndicatesUserMissing(raw)) {
    return { recentSubmissionList: null };
  }
  const r = raw as {
    submission?: {
      title: string;
      titleSlug: string;
      timestamp: string;
      statusDisplay: string;
      lang: string;
    }[];
  };
  return {
    recentSubmissionList: {
      submissions: r.submission ?? [],
    },
  };
}

async function fetchAlfaContestPayload(username: string): Promise<ContestRankPayload> {
  const u = encodeURIComponent(username);
  const raw = await alfaRequest(`/${u}/contest`);
  if (alfaIndicatesUserMissing(raw)) {
    return { userContestRanking: null };
  }
  const r = raw as {
    contestAttend?: number;
    contestRating?: number;
    contestGlobalRanking?: number;
    totalParticipants?: number;
    contestTopPercentage?: number;
    contestParticipation?: unknown[];
  };
  const hasRating = r.contestRating != null && !Number.isNaN(r.contestRating);
  const attend = r.contestAttend ?? 0;
  const hasParticipation = Array.isArray(r.contestParticipation) && r.contestParticipation.length > 0;
  if (!hasRating && attend === 0 && !hasParticipation) {
    return { userContestRanking: null };
  }
  return {
    userContestRanking: {
      attendedContestsCount: attend,
      rating: r.contestRating ?? 0,
      globalRanking: r.contestGlobalRanking ?? 0,
      totalParticipants: r.totalParticipants ?? 0,
      topPercentage: r.contestTopPercentage ?? 0,
    },
  };
}

async function fetchAlfaUpcomingContests(): Promise<UpcomingContestsPayload> {
  const raw = await alfaRequest("/contests/upcoming");
  const r = raw as {
    contests?: { title: string; titleSlug: string; startTime: number; duration: number }[];
  };
  return {
    upcomingContests: (r.contests ?? []).map((c) => ({
      title: c.title,
      startTime: c.startTime,
      duration: c.duration,
      slug: c.titleSlug,
    })),
  };
}

export async function graphqlRequest<T>(variables: Record<string, unknown>, query: string): Promise<T> {
  const env = loadEnv();
  const maxAttempts = 4;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(env.LEETCODE_GRAPHQL_URL, {
        method: "POST",
        headers: LEETCODE_HEADERS,
        body: JSON.stringify({ query, variables }),
      });
      if (res.status === 429) {
        await sleep(500 * attempt * attempt);
        continue;
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`LeetCode HTTP ${res.status}: ${text.slice(0, 200)}`);
      }
      const body = (await res.json()) as { data?: T; errors?: { message: string }[] };
      if (body.errors?.length) {
        throw new Error(body.errors.map((e) => e.message).join("; "));
      }
      if (!body.data) throw new Error("LeetCode returned no data");
      return body.data;
    } catch (e) {
      lastErr = e;
      if (attempt < maxAttempts) await sleep(300 * attempt);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("LeetCode request failed");
}

const PROFILE_QUERY = `
query userProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile {
      ranking
      userAvatar
      realName
    }
    submitStats: submitStatsGlobal {
      acSubmissionNum {
        difficulty
        count
        submissions
      }
    }
  }
}`;

const CALENDAR_QUERY = `
query userCalendar($username: String!, $year: Int!) {
  matchedUser(username: $username) {
    userCalendar(year: $year) {
      activeYears
      streak
      totalActiveDays
      dccStreak
      submissionCalendar
    }
  }
}`;

const RECENT_SUBS_QUERY = `
query recentSubmissions($username: String!, $limit: Int!) {
  recentSubmissionList(username: $username, limit: $limit) {
    submissions {
      title
      titleSlug
      timestamp
      statusDisplay
      lang
    }
  }
}`;

const CONTEST_RANK_QUERY = `
query userContestRanking($username: String!) {
  userContestRanking(username: $username) {
    attendedContestsCount
    rating
    globalRanking
    totalParticipants
    topPercentage
  }
}`;

const UPCOMING_CONTESTS_QUERY = `
query upcomingContests {
  upcomingContests {
    title
    startTime
    duration
    slug
  }
}`;

export type ProfilePayload = {
  matchedUser: null | {
    username: string;
    profile: { ranking?: number; userAvatar?: string; realName?: string } | null;
    submitStats: {
      acSubmissionNum: { difficulty: string; count: number; submissions: number }[];
    } | null;
  };
};

export type CalendarPayload = {
  matchedUser: null | {
    userCalendar: null | {
      activeYears: number[];
      streak: number;
      totalActiveDays: number;
      dccStreak: number;
      submissionCalendar: string;
    };
  };
};

export type RecentSubsPayload = {
  recentSubmissionList: null | {
    submissions: {
      title: string;
      titleSlug: string;
      timestamp: string;
      statusDisplay: string;
      lang: string;
    }[];
  };
};

export type ContestRankPayload = {
  userContestRanking: null | {
    attendedContestsCount: number;
    rating: number;
    globalRanking: number;
    totalParticipants: number;
    topPercentage: number;
  };
};

export type UpcomingContestsPayload = {
  upcomingContests: {
    title: string;
    startTime: number;
    duration: number;
    slug: string;
  }[];
};

export async function getProfile(username: string): Promise<ProfilePayload> {
  const key = `profile:${username.toLowerCase()}`;
  const hit = await getCached<ProfilePayload>(key);
  if (hit) return hit;
  const data = useAlfa()
    ? await fetchAlfaProfilePayload(username.toLowerCase())
    : await graphqlRequest<ProfilePayload>({ username }, PROFILE_QUERY);
  await setCached(key, data, loadEnv().DEFAULT_CACHE_TTL_SEC);
  return data;
}

export async function getCalendar(username: string, year: number): Promise<CalendarPayload> {
  const key = `calendar:${username.toLowerCase()}:${year}`;
  const hit = await getCached<CalendarPayload>(key);
  if (hit) return hit;
  const data = useAlfa()
    ? await fetchAlfaCalendarPayload(username.toLowerCase(), year)
    : await graphqlRequest<CalendarPayload>({ username, year }, CALENDAR_QUERY);
  await setCached(key, data, loadEnv().DEFAULT_CACHE_TTL_SEC);
  return data;
}

export async function getRecentSubmissions(username: string, limit: number): Promise<RecentSubsPayload> {
  const key = `recent:${username.toLowerCase()}:${limit}`;
  const hit = await getCached<RecentSubsPayload>(key);
  if (hit) return hit;
  const data = useAlfa()
    ? await fetchAlfaRecentPayload(username.toLowerCase(), limit)
    : await graphqlRequest<RecentSubsPayload>({ username, limit }, RECENT_SUBS_QUERY);
  await setCached(key, data, 120);
  return data;
}

export async function getContestRanking(username: string): Promise<ContestRankPayload> {
  const key = `contestRank:${username.toLowerCase()}`;
  const hit = await getCached<ContestRankPayload>(key);
  if (hit) return hit;
  const data = useAlfa()
    ? await fetchAlfaContestPayload(username.toLowerCase())
    : await graphqlRequest<ContestRankPayload>({ username }, CONTEST_RANK_QUERY);
  await setCached(key, data, loadEnv().DEFAULT_CACHE_TTL_SEC);
  return data;
}

export async function getUpcomingContests(): Promise<UpcomingContestsPayload> {
  const key = "upcomingContests:global";
  const hit = await getCached<UpcomingContestsPayload>(key);
  if (hit) return hit;
  const data = useAlfa()
    ? await fetchAlfaUpcomingContests()
    : await graphqlRequest<UpcomingContestsPayload>({}, UPCOMING_CONTESTS_QUERY);
  await setCached(key, data, 600);
  return data;
}

/** Parse submissionCalendar JSON; values are submission counts per day */
export function parseSubmissionCalendar(calendarJson: string): Record<string, number> {
  try {
    const o = JSON.parse(calendarJson) as Record<string, number>;
    return o && typeof o === "object" ? o : {};
  } catch {
    return {};
  }
}

export function startOfLocalDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function formatDayKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Count AC submissions in calendar between start and end (inclusive), local dates */
export function countSubmissionsInRange(
  byDay: Record<string, number>,
  start: Date,
  end: Date
): number {
  let total = 0;
  const cur = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const endT = new Date(end);
  endT.setHours(23, 59, 59, 999);
  while (cur <= endT) {
    const k = formatDayKey(cur);
    total += byDay[k] ?? 0;
    cur.setDate(cur.getDate() + 1);
  }
  return total;
}

export function isActiveToday(byDay: Record<string, number>, now = new Date()): boolean {
  const k = formatDayKey(now);
  return (byDay[k] ?? 0) > 0;
}
