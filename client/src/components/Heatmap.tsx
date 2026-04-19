/** GitHub-style activity grid from YYYY-MM-DD → count map (LeetCode submission calendar) */

function intensityClass(n: number): string {
  if (n <= 0) return "bg-stalk-line/40";
  if (n === 1) return "bg-emerald-900/80";
  if (n <= 3) return "bg-emerald-700/90";
  if (n <= 6) return "bg-emerald-500/90";
  return "bg-stalk-mint shadow-glow";
}

export function Heatmap({
  heatmap,
  days = 120,
}: {
  heatmap: Record<string, number>;
  days?: number;
}) {
  const end = new Date();
  const cells: { key: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const key = `${y}-${m}-${day}`;
    cells.push({ key, count: heatmap[key] ?? 0 });
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
        <span>Last {days} days</span>
        <span>More</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {cells.map((c) => (
          <div
            key={c.key}
            title={`${c.key}: ${c.count} subs`}
            className={`h-3 w-3 rounded-sm ${intensityClass(c.count)}`}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
        <span>Less</span>
        <span className="h-3 w-3 rounded-sm bg-stalk-line/40" />
        <span className="h-3 w-3 rounded-sm bg-emerald-900/80" />
        <span className="h-3 w-3 rounded-sm bg-emerald-700/90" />
        <span className="h-3 w-3 rounded-sm bg-emerald-500/90" />
        <span className="h-3 w-3 rounded-sm bg-stalk-mint" />
        <span>More</span>
      </div>
    </div>
  );
}
