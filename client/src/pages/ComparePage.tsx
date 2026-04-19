import { FormEvent, useState } from "react";
import api from "@/api";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

type Side = {
  username: string;
  exists: boolean;
  totalSolved: number;
  difficulty: { easy: number; medium: number; hard: number };
  contestRating: number | null;
  streak: number;
};

export function ComparePage() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [data, setData] = useState<{ a: Side; b: Side } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function compare(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const { data: res } = await api.get<{ a: Side; b: Side }>("/compare", {
        params: { a: a.trim(), b: b.trim() },
      });
      setData(res);
    } catch {
      setError("Comparison failed — check usernames.");
    }
  }

  const radar =
    data &&
    [
      {
        metric: "Easy",
        a: data.a.difficulty.easy,
        b: data.b.difficulty.easy,
      },
      {
        metric: "Medium",
        a: data.a.difficulty.medium,
        b: data.b.difficulty.medium,
      },
      {
        metric: "Hard",
        a: data.a.difficulty.hard,
        b: data.b.difficulty.hard,
      },
      {
        metric: "Total",
        a: data.a.totalSolved,
        b: data.b.totalSolved,
      },
      {
        metric: "Streak",
        a: data.a.streak,
        b: data.b.streak,
      },
    ];

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header>
        <h1 className="font-display text-4xl font-bold text-white">Face-off</h1>
        <p className="mt-2 max-w-xl text-slate-400">
          Compare two LeetCode profiles side by side — difficulty mix, totals, streaks, and contest
          rating when available.
        </p>
      </header>

      <form
        onSubmit={compare}
        className="grid gap-4 rounded-2xl border border-stalk-line bg-stalk-card p-6 md:grid-cols-3"
      >
        <div>
          <label className="text-xs uppercase text-slate-500">Player A</label>
          <input
            required
            className="mt-1 w-full rounded-lg border border-stalk-line bg-stalk-bg px-3 py-2 outline-none focus:ring-2 focus:ring-stalk-mint/30"
            value={a}
            onChange={(e) => setA(e.target.value)}
          />
        </div>
        <div>
          <label className="text-xs uppercase text-slate-500">Player B</label>
          <input
            required
            className="mt-1 w-full rounded-lg border border-stalk-line bg-stalk-bg px-3 py-2 outline-none focus:ring-2 focus:ring-stalk-mint/30"
            value={b}
            onChange={(e) => setB(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-xl bg-stalk-mint py-2 font-semibold text-stalk-bg hover:brightness-110"
          >
            Compare
          </button>
        </div>
      </form>
      {error && <p className="text-sm text-red-400">{error}</p>}

      {data && (
        <div className="grid gap-8 lg:grid-cols-2">
          <section className="rounded-2xl border border-stalk-line bg-stalk-card p-6">
            <h2 className="text-lg font-semibold text-white">{data.a.username}</h2>
            {!data.a.exists && <p className="text-sm text-red-400">User not found</p>}
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Total solved</dt>
                <dd className="font-mono">{data.a.totalSolved}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Contest rating</dt>
                <dd className="font-mono">{data.a.contestRating ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Streak</dt>
                <dd className="font-mono">{data.a.streak}</dd>
              </div>
            </dl>
          </section>
          <section className="rounded-2xl border border-stalk-line bg-stalk-card p-6">
            <h2 className="text-lg font-semibold text-white">{data.b.username}</h2>
            {!data.b.exists && <p className="text-sm text-red-400">User not found</p>}
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Total solved</dt>
                <dd className="font-mono">{data.b.totalSolved}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Contest rating</dt>
                <dd className="font-mono">{data.b.contestRating ?? "—"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Streak</dt>
                <dd className="font-mono">{data.b.streak}</dd>
              </div>
            </dl>
          </section>

          {radar && (
            <section className="lg:col-span-2 h-96 rounded-2xl border border-stalk-line bg-stalk-card p-4">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radar}>
                  <PolarGrid stroke="#1f2a37" />
                  <PolarAngleAxis dataKey="metric" stroke="#94a3b8" />
                  <PolarRadiusAxis stroke="#475569" />
                  <Tooltip
                    contentStyle={{
                      background: "#0b0f14",
                      border: "1px solid #1f2a37",
                      borderRadius: 8,
                    }}
                  />
                  <Legend />
                  <Radar name={data.a.username} dataKey="a" stroke="#34d399" fill="#34d399" fillOpacity={0.35} />
                  <Radar name={data.b.username} dataKey="b" stroke="#fb7185" fill="#fb7185" fillOpacity={0.25} />
                </RadarChart>
              </ResponsiveContainer>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
