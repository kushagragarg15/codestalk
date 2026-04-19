import { useEffect, useState } from "react";
import api from "@/api";

type DailyChallenge = {
  problem: {
    question: {
      title: string;
      titleSlug: string;
      difficulty: string;
      topicTags: { name: string }[];
    };
  };
  stats: {
    totalFriends: number;
    completed: number;
    pending: number;
    completionRate: number;
  };
  completedBy: { username: string; timestamp: string }[];
  pendingUsers: { username: string }[];
};

type RecentActivity = {
  username: string;
  nickname?: string;
  problem: string;
  problemSlug: string;
  language: string;
  timestamp: string;
};

export function ChallengesPage() {
  const [daily, setDaily] = useState<DailyChallenge | null>(null);
  const [activity, setActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [dailyRes, activityRes] = await Promise.all([
        api.get<DailyChallenge>("/challenges/daily"),
        api.get<{ recentActivity: RecentActivity[] }>("/competition/recent-activity"),
      ]);
      setDaily(dailyRes.data);
      setActivity(activityRes.data.recentActivity);
    } catch (err) {
      console.error("Failed to load challenges", err);
    } finally {
      setLoading(false);
    }
  }

  function getDifficultyColor(difficulty: string) {
    if (difficulty === "Easy") return "text-emerald-400";
    if (difficulty === "Medium") return "text-amber-400";
    return "text-rose-400";
  }

  function getTimeAgo(timestamp: string) {
    const now = new Date().getTime();
    const then = new Date(timestamp).getTime();
    const diff = now - then;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "just now";
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl">
        <div className="rounded-2xl border border-stalk-line bg-stalk-card p-12 text-center text-slate-500">
          Loading challenges...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="font-display text-4xl font-bold text-white">
          Daily Challenge 🎯
        </h1>
        <p className="mt-2 text-slate-400">
          Today's problem + live feed of who's crushing it. Don't get left behind.
        </p>
      </header>

      {daily && (
        <section className="rounded-2xl border-2 border-stalk-mint/30 bg-gradient-to-br from-stalk-card to-stalk-bg p-6 shadow-glow">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <div className="mb-2 inline-block rounded-full bg-stalk-mint/20 px-3 py-1 text-xs font-semibold text-stalk-mint">
                TODAY'S CHALLENGE
              </div>
              <h2 className="text-2xl font-bold text-white">
                {daily.problem.question.title}
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <span
                  className={`text-sm font-medium ${getDifficultyColor(
                    daily.problem.question.difficulty
                  )}`}
                >
                  {daily.problem.question.difficulty}
                </span>
                {daily.problem.question.topicTags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.name}
                    className="rounded-full border border-stalk-line bg-stalk-bg px-2 py-0.5 text-xs text-slate-400"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
            <a
              href={`https://leetcode.com/problems/${daily.problem.question.titleSlug}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-stalk-mint px-6 py-3 font-semibold text-stalk-bg transition hover:brightness-110"
            >
              Solve Now →
            </a>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-stalk-line bg-stalk-bg p-4 text-center">
              <div className="text-3xl font-bold text-stalk-mint">
                {daily.stats.completionRate}%
              </div>
              <div className="mt-1 text-sm text-slate-500">Completion Rate</div>
            </div>
            <div className="rounded-xl border border-stalk-line bg-stalk-bg p-4 text-center">
              <div className="text-3xl font-bold text-emerald-400">
                {daily.stats.completed}
              </div>
              <div className="mt-1 text-sm text-slate-500">Completed</div>
            </div>
            <div className="rounded-xl border border-stalk-line bg-stalk-bg p-4 text-center">
              <div className="text-3xl font-bold text-amber-400">
                {daily.stats.pending}
              </div>
              <div className="mt-1 text-sm text-slate-500">Still Pending</div>
            </div>
          </div>

          {daily.completedBy.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Hall of Fame (Today)
              </h3>
              <div className="flex flex-wrap gap-2">
                {daily.completedBy.map((user, idx) => (
                  <div
                    key={user.username}
                    className="flex items-center gap-2 rounded-lg border border-stalk-line bg-stalk-bg px-3 py-2"
                  >
                    {idx === 0 && <span className="text-lg">🥇</span>}
                    {idx === 1 && <span className="text-lg">🥈</span>}
                    {idx === 2 && <span className="text-lg">🥉</span>}
                    <span className="font-medium text-white">{user.username}</span>
                    <span className="text-xs text-slate-500">
                      {getTimeAgo(user.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {daily.pendingUsers.length > 0 && (
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Waiting on...
              </h3>
              <div className="flex flex-wrap gap-2">
                {daily.pendingUsers.map((user) => (
                  <span
                    key={user.username}
                    className="rounded-full border border-stalk-rose/30 bg-stalk-rose/10 px-3 py-1 text-sm text-slate-300"
                  >
                    {user.username}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      <section className="rounded-2xl border border-stalk-line bg-stalk-card p-6">
        <h2 className="mb-4 text-xl font-semibold text-white">
          Live Activity Feed 🔥
        </h2>
        <p className="mb-6 text-sm text-slate-400">
          Real-time feed of what your friends are solving. FOMO is real.
        </p>
        <div className="space-y-2">
          {activity.slice(0, 30).map((act, idx) => (
            <div
              key={`${act.username}-${act.problemSlug}-${idx}`}
              className="flex items-center justify-between rounded-lg border border-stalk-line bg-stalk-bg p-3 transition hover:border-stalk-mint/30"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stalk-mint/20 text-sm">
                  ✓
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{act.username}</span>
                    <span className="text-sm text-slate-500">solved</span>
                    <a
                      href={`https://leetcode.com/problems/${act.problemSlug}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-stalk-mint hover:underline"
                    >
                      {act.problem}
                    </a>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <span className="rounded bg-stalk-line px-2 py-0.5">{act.language}</span>
                    <span>{getTimeAgo(act.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {activity.length === 0 && (
            <p className="py-8 text-center text-slate-500">
              No recent activity. Add more friends to see the action!
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
