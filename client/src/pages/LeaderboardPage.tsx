import { useEffect, useState } from "react";
import api from "@/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type Metric = "daily" | "weekly" | "monthly" | "rating" | "streak";

type Row = {
  rank: number;
  leetcodeUsername: string;
  nickname?: string;
  score: number;
  activeToday: boolean;
  contestRating: number | null;
  streak: number;
};

export function LeaderboardPage() {
  const [metric, setMetric] = useState<Metric>("weekly");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api
      .get<{ leaderboard: Row[] }>("/leaderboard", { params: { metric } })
      .then((r) => {
        if (!alive) return;
        setRows(r.data.leaderboard);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [metric]);

  const chartData = rows.slice(0, 10).map((x) => ({
    name: x.leetcodeUsername,
    score: x.score,
    active: x.activeToday,
  }));

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="font-display text-4xl font-bold text-white">Leaderboard</h1>
        <p className="mt-2 text-slate-400">
          Flip the time window or sort by contest rating — all pulled with caching so we don&apos;t
          hammer LeetCode.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(["daily", "weekly", "monthly", "rating", "streak"] as Metric[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMetric(m)}
            className={`rounded-full px-4 py-1.5 text-sm capitalize ${
              metric === m
                ? "bg-stalk-mint text-stalk-bg"
                : "border border-stalk-line text-slate-400 hover:border-stalk-mint/40"
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="h-72 rounded-2xl border border-stalk-line bg-stalk-card p-4">
          {loading ? (
            <p className="p-6 text-slate-500">Loading…</p>
          ) : chartData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid stroke="#1f2a37" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  cursor={{ fill: "rgba(52,211,153,0.06)" }}
                  contentStyle={{
                    background: "#0b0f14",
                    border: "1px solid #1f2a37",
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="score" fill="#34d399" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
              Add friends to populate this board.
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-stalk-line bg-stalk-card">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-stalk-line text-slate-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Today</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.leetcodeUsername} className="border-b border-stalk-line/60">
                  <td className="px-4 py-3 font-mono text-slate-500">{r.rank}</td>
                  <td className="px-4 py-3 font-medium text-white">{r.leetcodeUsername}</td>
                  <td className="px-4 py-3 font-mono text-emerald-300">{r.score}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block h-2 w-2 rounded-full ${
                        r.activeToday ? "bg-stalk-mint" : "bg-stalk-rose"
                      }`}
                    />
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    Nothing here yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
