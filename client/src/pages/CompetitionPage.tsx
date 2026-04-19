import { useEffect, useState } from "react";
import api from "@/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

type BadgeLeaderboard = {
  username: string;
  nickname?: string;
  badgeCount: number;
  badges: { id: string; displayName: string; icon: string }[];
};

type SkillComparison = {
  username: string;
  topSkills: { tagName: string; problemsSolved: number }[];
  totalSkillProblems: number;
};

type ContestPerformance = {
  username: string;
  totalContests: number;
  avgRating: number;
  bestRanking: number;
  trend: string;
};

export function CompetitionPage() {
  const [activeTab, setActiveTab] = useState<"badges" | "skills" | "contests">("badges");
  const [badges, setBadges] = useState<BadgeLeaderboard[]>([]);
  const [skills, setSkills] = useState<SkillComparison[]>([]);
  const [contests, setContests] = useState<ContestPerformance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  async function loadData() {
    setLoading(true);
    try {
      if (activeTab === "badges") {
        const { data } = await api.get<{ leaderboard: BadgeLeaderboard[] }>(
          "/competition/badges"
        );
        setBadges(data.leaderboard);
      } else if (activeTab === "skills") {
        const { data } = await api.get<{ skillComparison: SkillComparison[] }>(
          "/competition/skills"
        );
        setSkills(data.skillComparison);
      } else {
        const { data } = await api.get<{ contestLeaderboard: ContestPerformance[] }>(
          "/competition/contest-performance"
        );
        setContests(data.contestLeaderboard);
      }
    } catch (err) {
      console.error("Failed to load competition data", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <h1 className="font-display text-4xl font-bold text-white">
          Competition Arena 🏆
        </h1>
        <p className="mt-2 text-slate-400">
          See who's dominating in badges, skills, and contests. May the best coder win.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["badges", "skills", "contests"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-5 py-2 text-sm font-medium capitalize transition ${
              activeTab === tab
                ? "bg-stalk-mint text-stalk-bg shadow-glow"
                : "border border-stalk-line text-slate-400 hover:border-stalk-mint/40 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-stalk-line bg-stalk-card p-12 text-center text-slate-500">
          Loading competition data...
        </div>
      ) : (
        <>
          {activeTab === "badges" && (
            <div className="space-y-6">
              <section className="rounded-2xl border border-stalk-line bg-stalk-card p-6">
                <h2 className="mb-4 text-xl font-semibold text-white">Badge Collectors</h2>
                <div className="space-y-4">
                  {badges.map((user, idx) => (
                    <div
                      key={user.username}
                      className="flex items-center justify-between rounded-xl border border-stalk-line bg-stalk-bg p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                            idx === 0
                              ? "bg-amber-500 text-stalk-bg"
                              : idx === 1
                              ? "bg-slate-400 text-stalk-bg"
                              : idx === 2
                              ? "bg-orange-600 text-white"
                              : "bg-stalk-line text-slate-400"
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{user.username}</div>
                          <div className="text-sm text-slate-500">
                            {user.badgeCount} badges earned
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {user.badges.slice(0, 5).map((badge) => (
                          <div
                            key={badge.id}
                            className="rounded-lg border border-stalk-line bg-stalk-card px-3 py-1 text-xs"
                            title={badge.displayName}
                          >
                            {badge.icon || "🏅"}
                          </div>
                        ))}
                        {user.badgeCount > 5 && (
                          <div className="rounded-lg border border-stalk-line bg-stalk-card px-3 py-1 text-xs text-slate-400">
                            +{user.badgeCount - 5}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {badges.length === 0 && (
                    <p className="py-8 text-center text-slate-500">
                      Add friends to see badge competition
                    </p>
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === "skills" && (
            <div className="space-y-6">
              <section className="rounded-2xl border border-stalk-line bg-stalk-card p-6">
                <h2 className="mb-4 text-xl font-semibold text-white">Skill Masters</h2>
                <div className="space-y-6">
                  {skills.map((user) => (
                    <div
                      key={user.username}
                      className="rounded-xl border border-stalk-line bg-stalk-bg p-4"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <div className="font-semibold text-white">{user.username}</div>
                        <div className="text-sm text-slate-500">
                          {user.totalSkillProblems} problems across skills
                        </div>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        {user.topSkills.map((skill, idx) => (
                          <div
                            key={`${skill.tagName}-${idx}`}
                            className="rounded-lg border border-stalk-line bg-stalk-card p-3"
                          >
                            <div className="text-xs text-slate-500">{skill.tagName}</div>
                            <div className="mt-1 font-mono text-lg text-stalk-mint">
                              {skill.problemsSolved}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  {skills.length === 0 && (
                    <p className="py-8 text-center text-slate-500">
                      Add friends to see skill comparison
                    </p>
                  )}
                </div>
              </section>
            </div>
          )}

          {activeTab === "contests" && (
            <div className="space-y-6">
              <section className="rounded-2xl border border-stalk-line bg-stalk-card p-6">
                <h2 className="mb-4 text-xl font-semibold text-white">Contest Champions</h2>
                {contests.length > 0 && (
                  <div className="mb-6 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={contests.slice(0, 10).map((c) => ({
                          name: c.username,
                          rating: c.avgRating,
                        }))}
                      >
                        <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{
                            background: "#0b0f14",
                            border: "1px solid #1f2a37",
                            borderRadius: 8,
                          }}
                        />
                        <Legend />
                        <Bar dataKey="rating" fill="#34d399" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <div className="space-y-3">
                  {contests.map((user, idx) => (
                    <div
                      key={user.username}
                      className="flex items-center justify-between rounded-xl border border-stalk-line bg-stalk-bg p-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stalk-line font-mono text-sm text-slate-400">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{user.username}</div>
                          <div className="text-xs text-slate-500">
                            {user.totalContests} contests · Best rank: {user.bestRanking}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-lg text-stalk-mint">
                          {user.avgRating}
                        </div>
                        <div className="text-xs text-slate-500">avg rating</div>
                        {user.trend === "improving" && (
                          <div className="mt-1 text-xs text-emerald-400">📈 Improving</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {contests.length === 0 && (
                    <p className="py-8 text-center text-slate-500">
                      Add friends to see contest rankings
                    </p>
                  )}
                </div>
              </section>
            </div>
          )}
        </>
      )}
    </div>
  );
}
