import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-stalk-line text-white"
      : "text-slate-400 hover:bg-stalk-line/60 hover:text-white"
  }`;

export function Shell() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-stalk-line bg-stalk-card/80 px-4 py-6 backdrop-blur lg:w-56 lg:flex-shrink-0 lg:border-b-0 lg:border-r">
        <div className="mb-8 flex items-center justify-between gap-2 lg:block">
          <div>
            <div className="font-display text-xl font-bold tracking-tight text-white">
              Code<span className="text-stalk-mint">Stalk</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">Friendly LeetCode competition</p>
          </div>
        </div>
        <nav className="flex flex-wrap gap-1 lg:flex-col">
          <NavLink to="/" end className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/friends" className={linkClass}>
            Friends
          </NavLink>
          <NavLink to="/challenges" className={linkClass}>
            🎯 Daily Challenge
          </NavLink>
          <NavLink to="/competition" className={linkClass}>
            🏆 Competition
          </NavLink>
          <NavLink to="/leaderboard" className={linkClass}>
            Leaderboard
          </NavLink>
          <NavLink to="/contests" className={linkClass}>
            Contests
          </NavLink>
          <NavLink to="/compare" className={linkClass}>
            Compare
          </NavLink>
        </nav>
        <div className="mt-8 rounded-xl border border-stalk-line bg-stalk-bg/50 p-3 text-xs text-slate-400">
          <div className="truncate font-medium text-slate-200">{user?.email}</div>
          <button
            type="button"
            onClick={() => logout()}
            className="mt-3 w-full rounded-md border border-stalk-line px-2 py-1 text-left text-slate-300 hover:border-stalk-mint/40 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 px-4 py-8 lg:px-10">
        <Outlet />
      </main>
    </div>
  );
}
