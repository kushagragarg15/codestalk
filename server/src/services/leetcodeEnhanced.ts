import { loadEnv } from "../config/env.js";
import { getCached, setCached } from "./cacheService.js";

const ALFA_BASE = () => loadEnv().ALFA_LEETCODE_API_URL.replace(/\/$/, "");

async function alfaFetch(path: string): Promise<unknown> {
  const url = `${ALFA_BASE()}${path}`;
  const maxAttempts = 3;
  let lastErr: unknown;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (res.status === 429) {
        await new Promise((r) => setTimeout(r, 500 * attempt));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      lastErr = e;
      if (attempt < maxAttempts) await new Promise((r) => setTimeout(r, 300 * attempt));
    }
  }
  throw lastErr;
}

// ============ BADGES ============
export type Badge = {
  id: string;
  displayName: string;
  icon: string;
  creationDate: string;
};

export async function getUserBadges(username: string): Promise<Badge[]> {
  const key = `badges:${username.toLowerCase()}`;
  const hit = await getCached<{ badges: Badge[] }>(key);
  if (hit) return hit.badges;
  
  const data = (await alfaFetch(`/${username}/badges`)) as { badges: Badge[] };
  await setCached(key, data, 3600); // 1 hour cache
  return data.badges || [];
}

// ============ SKILL STATS ============
export type SkillStats = {
  tagName: string;
  tagSlug: string;
  problemsSolved: number;
};

export async function getSkillStats(username: string): Promise<SkillStats[]> {
  const key = `skills:${username.toLowerCase()}`;
  const hit = await getCached<{ data: { matchedUser: { tagProblemCounts: { advanced: SkillStats[] } } } }>(key);
  if (hit) return hit.data?.matchedUser?.tagProblemCounts?.advanced || [];
  
  const data = await alfaFetch(`/${username}/skillStats`);
  await setCached(key, data, 3600);
  return (data as any)?.data?.matchedUser?.tagProblemCounts?.advanced || [];
}

// ============ LANGUAGE STATS ============
export type LanguageStat = {
  languageName: string;
  problemsSolved: number;
};

export async function getLanguageStats(username: string): Promise<LanguageStat[]> {
  const key = `languages:${username.toLowerCase()}`;
  const hit = await getCached<{ matchedUser: { languageProblemCount: LanguageStat[] } }>(key);
  if (hit) return hit.matchedUser?.languageProblemCount || [];
  
  const data = await alfaFetch(`/${username}/languageStats`);
  await setCached(key, data, 3600);
  return (data as any)?.matchedUser?.languageProblemCount || [];
}

// ============ CONTEST HISTORY ============
export type ContestHistory = {
  attended: boolean;
  rating: number;
  ranking: number;
  trendDirection: string;
  problemsSolved: number;
  totalProblems: number;
  finishTimeInSeconds: number;
  contest: {
    title: string;
    startTime: number;
  };
};

export async function getContestHistory(username: string): Promise<ContestHistory[]> {
  const key = `contestHistory:${username.toLowerCase()}`;
  const hit = await getCached<ContestHistory[]>(key);
  if (hit) return hit;
  
  const data = (await alfaFetch(`/${username}/contest/history`)) as any;
  const history = data?.contestHistory || [];
  await setCached(key, history, 1800); // 30 min cache
  return history;
}

// ============ ACCEPTED SUBMISSIONS ============
export type Submission = {
  id: string;
  title: string;
  titleSlug: string;
  timestamp: string;
  statusDisplay: string;
  lang: string;
};

export async function getAcceptedSubmissions(username: string, limit = 20): Promise<Submission[]> {
  const key = `acSubmissions:${username.toLowerCase()}:${limit}`;
  const hit = await getCached<{ submission: Submission[] }>(key);
  if (hit) return hit.submission || [];
  
  const data = await alfaFetch(`/${username}/acSubmission?limit=${limit}`);
  await setCached(key, data, 300); // 5 min cache
  return (data as any)?.submission || [];
}

// ============ DAILY PROBLEM ============
export type DailyProblem = {
  date: string;
  link: string;
  question: {
    questionId: string;
    questionFrontendId: string;
    title: string;
    titleSlug: string;
    difficulty: string;
    isPaidOnly: boolean;
    topicTags: { name: string; slug: string }[];
  };
};

export async function getDailyProblem(): Promise<DailyProblem> {
  const key = "dailyProblem:global";
  const hit = await getCached<DailyProblem>(key);
  if (hit) return hit;
  
  const data = (await alfaFetch("/daily")) as DailyProblem;
  await setCached(key, data, 3600); // 1 hour cache
  return data;
}

// ============ PROBLEMS WITH FILTERS ============
export type Problem = {
  questionId: string;
  questionFrontendId: string;
  title: string;
  titleSlug: string;
  difficulty: string;
  isPaidOnly: boolean;
  topicTags: { name: string; slug: string }[];
  acRate: number;
};

export async function getProblems(options: {
  limit?: number;
  skip?: number;
  tags?: string[];
  difficulty?: "EASY" | "MEDIUM" | "HARD";
}): Promise<Problem[]> {
  const { limit = 20, skip = 0, tags = [], difficulty } = options;
  const params = new URLSearchParams();
  if (limit) params.set("limit", limit.toString());
  if (skip) params.set("skip", skip.toString());
  if (tags.length) params.set("tags", tags.join("+"));
  if (difficulty) params.set("difficulty", difficulty);
  
  const key = `problems:${params.toString()}`;
  const hit = await getCached<{ problemsetQuestionList: Problem[] }>(key);
  if (hit) return hit.problemsetQuestionList || [];
  
  const data = await alfaFetch(`/problems?${params.toString()}`);
  await setCached(key, data, 7200); // 2 hours cache
  return (data as any)?.problemsetQuestionList || [];
}

// ============ TRENDING DISCUSSIONS ============
export type Discussion = {
  id: string;
  title: string;
  commentCount: number;
  viewCount: number;
  topLevelCommentCount: number;
  post: {
    author: {
      username: string;
      profile: { userAvatar: string };
    };
    creationDate: number;
    content: string;
  };
};

export async function getTrendingDiscussions(limit = 20): Promise<Discussion[]> {
  const key = `trending:${limit}`;
  const hit = await getCached<{ data: { cachedTrendingCategoryTopics: Discussion[] } }>(key);
  if (hit) return hit.data?.cachedTrendingCategoryTopics || [];
  
  const data = await alfaFetch(`/trendingDiscuss?first=${limit}`);
  await setCached(key, data, 1800); // 30 min cache
  return (data as any)?.data?.cachedTrendingCategoryTopics || [];
}

// ============ USER PROGRESS ============
export type UserProgress = {
  easySolved: number;
  easyTotal: number;
  mediumSolved: number;
  mediumTotal: number;
  hardSolved: number;
  hardTotal: number;
};

export async function getUserProgress(username: string): Promise<UserProgress> {
  const key = `progress:${username.toLowerCase()}`;
  const hit = await getCached<UserProgress>(key);
  if (hit) return hit;
  
  const data = (await alfaFetch(`/${username}/progress`)) as any;
  const progress = {
    easySolved: data?.easySolved || 0,
    easyTotal: data?.easyTotal || 0,
    mediumSolved: data?.mediumSolved || 0,
    mediumTotal: data?.mediumTotal || 0,
    hardSolved: data?.hardSolved || 0,
    hardTotal: data?.hardTotal || 0,
  };
  await setCached(key, progress, 600); // 10 min cache
  return progress;
}
