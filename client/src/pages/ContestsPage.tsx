import { useEffect, useState } from "react";
import api from "@/api";

type Contest = {
  title: string;
  slug: string;
  startTime: number;
  durationSec: number;
};

function Countdown({ targetSec }: { targetSec: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const diff = targetSec * 1000 - now;
  if (diff <= 0) return <span className="text-stalk-rose">Started or past</span>;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return (
    <span className="font-mono text-stalk-mint">
      {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

export function ContestsPage() {
  const [items, setItems] = useState<Contest[]>([]);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ upcoming: Contest[]; note?: string }>("/contests")
      .then((r) => {
        setItems(r.data.upcoming ?? []);
        setNote(r.data.note ?? null);
      })
      .catch(() => setItems([]));
  }, []);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="font-display text-4xl font-bold text-white">Contests</h1>
        <p className="mt-2 text-slate-400">
          Upcoming LeetCode contests — times shown in your local timezone.
        </p>
      </header>

      {note && <p className="text-sm text-slate-500">{note}</p>}

      <ul className="space-y-4">
        {items.map((c) => {
          const start = new Date(c.startTime * 1000);
          return (
            <li
              key={c.slug + c.startTime}
              className="rounded-2xl border border-stalk-line bg-stalk-card p-5"
            >
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">{c.title}</h2>
                  <p className="text-sm text-slate-500">{start.toLocaleString()}</p>
                  <p className="mt-2 text-xs text-slate-600">
                    Duration {Math.round(c.durationSec / 60)} minutes
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Starts in</div>
                  <div className="mt-1 text-xl">
                    <Countdown targetSec={c.startTime} />
                  </div>
                </div>
              </div>
            </li>
          );
        })}
        {!items.length && (
          <li className="rounded-xl border border-dashed border-stalk-line p-8 text-center text-slate-500">
            Could not load contests — try again later.
          </li>
        )}
      </ul>
    </div>
  );
}
