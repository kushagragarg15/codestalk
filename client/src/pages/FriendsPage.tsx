import { FormEvent, useEffect, useState } from "react";
import api from "@/api";
import { Heatmap } from "@/components/Heatmap";

type FriendRow = {
  id: string;
  leetcodeUsername: string;
  nickname?: string;
  snapshot: {
    activeToday: boolean;
    streak: number;
    counts: { daily: number; weekly: number; monthly: number };
    contestRating: number | null;
    heatmap: Record<string, number>;
    difficulty: { easy: number; medium: number; hard: number };
  };
  badges: { id: string; label: string; emoji: string }[];
  nudge: string;
};

export function FriendsPage() {
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    const { data } = await api.get<{ friends: FriendRow[] }>("/friends");
    setFriends(data.friends);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  async function addFriend(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await api.post("/friends", { leetcodeUsername: username.trim() });
      setUsername("");
      await refresh();
    } catch {
      setError("Could not add friend — verify the LeetCode username exists.");
    }
  }

  async function removeFriend(u: string) {
    await api.delete(`/friends/${encodeURIComponent(u)}`);
    await refresh();
  }

  if (loading) return <p className="text-slate-500">Loading friends…</p>;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header>
        <h1 className="font-display text-4xl font-bold text-white">Friends</h1>
        <p className="mt-2 text-slate-400">
          Add LeetCode usernames to stalk — I mean track — daily progress with good-natured pressure.
        </p>
      </header>

      <form
        onSubmit={addFriend}
        className="flex flex-col gap-3 rounded-2xl border border-stalk-line bg-stalk-card p-4 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label className="text-xs uppercase text-slate-500">LeetCode username</label>
          <input
            className="mt-1 w-full rounded-lg border border-stalk-line bg-stalk-bg px-3 py-2 outline-none focus:ring-2 focus:ring-stalk-mint/30"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="friend_handle"
            required
          />
        </div>
        <button
          type="submit"
          className="rounded-xl bg-stalk-mint px-6 py-2 font-semibold text-stalk-bg hover:brightness-110"
        >
          Add
        </button>
      </form>
      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="grid gap-6">
        {friends.map((f) => (
          <article
            key={f.id}
            className="overflow-hidden rounded-2xl border border-stalk-line bg-stalk-card"
          >
            <div className="flex flex-col gap-4 border-b border-stalk-line p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-white">{f.leetcodeUsername}</h2>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      f.snapshot.activeToday ? "bg-stalk-mint" : "bg-stalk-rose"
                    }`}
                    title={f.snapshot.activeToday ? "Active today" : "Not active today"}
                  />
                </div>
                <p className="mt-2 text-sm text-slate-400">{f.nudge}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {f.badges.map((b) => (
                    <span
                      key={b.id}
                      className="rounded-full border border-stalk-line bg-stalk-bg px-2 py-0.5 text-xs text-slate-300"
                    >
                      {b.emoji} {b.label}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right text-sm text-slate-400">
                <div>
                  Today <span className="font-mono text-white">{f.snapshot.counts.daily}</span>
                </div>
                <div>
                  Week <span className="font-mono text-white">{f.snapshot.counts.weekly}</span>
                </div>
                <div>
                  Streak <span className="font-mono text-white">{f.snapshot.streak}</span>
                </div>
                <button
                  type="button"
                  className="mt-3 text-xs text-red-400 hover:underline"
                  onClick={() => removeFriend(f.leetcodeUsername)}
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="p-5">
              <Heatmap heatmap={f.snapshot.heatmap} days={90} />
              <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
                <div className="rounded-lg border border-stalk-line bg-stalk-bg px-2 py-3">
                  <div className="text-slate-500">Easy</div>
                  <div className="font-mono text-lg text-emerald-300">{f.snapshot.difficulty.easy}</div>
                </div>
                <div className="rounded-lg border border-stalk-line bg-stalk-bg px-2 py-3">
                  <div className="text-slate-500">Medium</div>
                  <div className="font-mono text-lg text-amber-300">{f.snapshot.difficulty.medium}</div>
                </div>
                <div className="rounded-lg border border-stalk-line bg-stalk-bg px-2 py-3">
                  <div className="text-slate-500">Hard</div>
                  <div className="font-mono text-lg text-rose-300">{f.snapshot.difficulty.hard}</div>
                </div>
              </div>
            </div>
          </article>
        ))}
        {!friends.length && (
          <p className="rounded-xl border border-dashed border-stalk-line p-8 text-center text-slate-500">
            No friends yet. Drop a username above.
          </p>
        )}
      </div>
    </div>
  );
}
