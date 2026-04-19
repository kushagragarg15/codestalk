import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";

export function LoginPage() {
  const { token, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (token) return <Navigate to="/" replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password, name || undefined);
    } catch {
      setError("Something went wrong. Check credentials or try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-stalk-line bg-stalk-card p-8 shadow-glow">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-white">
            Code<span className="text-stalk-mint">Stalk</span>
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Track friends, keep streaks honest, compete kindly.
          </p>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs text-emerald-400">
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Stay logged in for 30 days</span>
          </div>
        </div>
        <div className="mb-6 flex rounded-lg bg-stalk-bg p-1 text-sm">
          <button
            type="button"
            className={`flex-1 rounded-md py-2 ${
              mode === "login" ? "bg-stalk-line text-white" : "text-slate-500"
            }`}
            onClick={() => setMode("login")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={`flex-1 rounded-md py-2 ${
              mode === "register" ? "bg-stalk-line text-white" : "text-slate-500"
            }`}
            onClick={() => setMode("register")}
          >
            Create account
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="text-xs uppercase tracking-wide text-slate-500">Display name</label>
              <input
                className="mt-1 w-full rounded-lg border border-stalk-line bg-stalk-bg px-3 py-2 outline-none ring-stalk-mint/40 focus:ring"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="nickname"
              />
            </div>
          )}
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">Email</label>
            <input
              className="mt-1 w-full rounded-lg border border-stalk-line bg-stalk-bg px-3 py-2 outline-none ring-stalk-mint/40 focus:ring"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wide text-slate-500">Password</label>
            <input
              className="mt-1 w-full rounded-lg border border-stalk-line bg-stalk-bg px-3 py-2 outline-none ring-stalk-mint/40 focus:ring"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>
          {error && <p className="text-sm text-stalk-rose">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-xl bg-stalk-mint py-3 font-semibold text-stalk-bg hover:brightness-110 disabled:opacity-50"
          >
            {busy ? "Please wait…" : mode === "login" ? "Enter" : "Create account"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500">
          Uses LeetCode&apos;s unofficial GraphQL API — respect rate limits.
        </p>
      </div>
    </div>
  );
}
