import { useEffect, useState } from "react";
import api from "@/api";
import { Heatmap } from "@/components/Heatmap";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type DashboardRes = {
  user: { displayName?: string; myLeetcodeUsername?: string };
  self: null | {
    username: string;
    difficulty: { easy: number; medium: number; hard: number };
    heatmap: Record<string, number>;
    streak: number;
    counts: { daily: number; weekly: number; monthly: number };
    contestRating: number | null;
    totalSolved: number;
  };
  friendsPreview: {
    leetcodeUsername: string;
    activeToday: boolean;
    streak: number;
    weekly: number;
    contestRating: number | null;
  }[];
  friendTotal: number;
};

type SummaryRes = {
  inactiveToday: string[];
  topWeekly: { username: string; weekly: number; streak: number }[];
};

const COLORS = ["#34d399", "#fbbf24", "#fb7185"];

export function DashboardPage() {
  const [dash, setDash] = useState<DashboardRes | null>(null);
  const [summary, setSummary] = useState<SummaryRes | null>(null);
  const [lc, setLc] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.all([
      api.get<DashboardRes>("/dashboard"),
      api.get<SummaryRes>("/insights/weekly-summary"),
    ]).then(([d, s]) => {
      if (!alive) return;
      setDash(d.data);
      setLc(d.data.user.myLeetcodeUsername ?? "");
      setSummary(s.data);
    });
    return () => {
      alive = false;
    };
  }, []);

  async function saveHandle(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    try {
      await api.patch("/auth/me", { myLeetcodeUsername: lc || "" });
      setMsg("Saved your LeetCode handle.");
      const { data } = await api.get<DashboardRes>("/dashboard");
      setDash(data);
    } catch {
      setMsg("Could not save — check the username format.");
    }
  }

  const pieData =
    dash?.self &&
    [
      { name: "Easy", value: dash.self.difficulty.easy },
      { name: "Medium", value: dash.self.difficulty.medium },
      { name: "Hard", value: dash.self.difficulty.hard },
    ].filter((x) => x.value > 0);

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header>
        <h1 className="font-display text-4xl font-bold text-white">
          Hey{dash?.user.displayName ? `, ${dash.user.displayName}` : ""}
        </h1>
        <p className="mt-2 max-w-xl text-slate-400">
          Wire your LeetCode handle for your own heatmap and difficulty split. Friends show up below
          with today&apos;s activity signal.
        </p>
      </header>

      <section className="rounded-2xl border border-stalk-line bg-stalk-card p-6">
        <h2 className="text-lg font-semibold text-white">Your LeetCode handle</h2>
        <form onSubmit={saveHandle} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-xs uppercase text-slate-500">Username</label>
            <input
              className="mt-1 w-full rounded-lg border border-stalk-line bg-stalk-bg px-3 py-2 outline-none focus:ring-2 focus:ring-stalk-mint/30"
              value={lc}
              onChange={(e) => setLc(e.target.value)}
              placeholder="e.g. tourist"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-stalk-line px-5 py-2 font-medium text-white hover:bg-stalk-mint hover:text-stalk-bg"
          >
            Save
          </button>
        </form>
        {msg && <p className="mt-3 text-sm text-stalk-mint">{msg}</p>}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-stalk-line bg-stalk-card p-6">
          <h2 className="text-lg font-semibold text-white">Your snapshot</h2>
          {!dash?.self?.username && (
            <p className="mt-4 text-sm text-slate-500">Add a handle above to unlock your charts.</p>
          )}
          {dash?.self && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Streak</span>
                  <span className="font-mono text-white">{dash.self.streak}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Solved (total)</span>
                  <span className="font-mono text-white">{dash.self.totalSolved}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contest rating</span>
                  <span className="font-mono text-white">
                    {dash.self.contestRating ?? "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">This week</span>
                  <span className="font-mono text-white">{dash.self.counts.weekly}</span>
                </div>
              </div>
              <div className="h-44">
                {pieData && pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70}>
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "#0b0f14",
                          border: "1px solid #1f2a37",
                          borderRadius: 8,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-slate-500">No solved stats yet.</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <Heatmap heatmap={dash.self.heatmap} />
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-stalk-line bg-stalk-card p-6">
          <h2 className="text-lg font-semibold text-white">Friend pulse</h2>
          <p className="mt-1 text-sm text-slate-500">
            {dash?.friendTotal ?? 0} tracked — green means active today.
          </p>
          <ul className="mt-4 divide-y divide-stalk-line">
            {(dash?.friendsPreview ?? []).map((f) => (
              <li
                key={f.leetcodeUsername}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <div className="font-medium text-white">{f.leetcodeUsername}</div>
                  <div className="text-xs text-slate-500">
                    streak {f.streak} · week {f.weekly}
                    {f.contestRating != null ? ` · RT ${f.contestRating}` : ""}
                  </div>
                </div>
                <span
                  className={`h-3 w-3 rounded-full ${
                    f.activeToday ? "bg-stalk-mint shadow-glow" : "bg-stalk-rose"
                  }`}
                  title={f.activeToday ? "Active today" : "Quiet today"}
                />
              </li>
            ))}
            {!dash?.friendsPreview?.length && (
              <li className="py-6 text-center text-slate-500">No friends yet — add some!</li>
            )}
          </ul>
        </section>
      </div>

      {summary && (
        <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6">
          <h2 className="text-lg font-semibold text-amber-200">Weekly nudge engine</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium text-slate-300">Quiet today</h3>
              <p className="mt-2 text-sm text-slate-400">
                {summary.inactiveToday.length
                  ? summary.inactiveToday.join(", ")
                  : "Everyone showed color today — iconic."}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-300">Weekly volume leaders</h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-400">
                {summary.topWeekly.map((r) => (
                  <li key={r.username}>
                    <span className="text-white">{r.username}</span> · {r.weekly} subs · streak{" "}
                    {r.streak}
                  </li>
                ))}
                {!summary.topWeekly.length && <li>No data yet.</li>}
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
