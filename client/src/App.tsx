import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { Shell } from "./components/Shell";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { FriendsPage } from "./pages/FriendsPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { ContestsPage } from "./pages/ContestsPage";
import { ComparePage } from "./pages/ComparePage";
import { CompetitionPage } from "./pages/CompetitionPage";
import { ChallengesPage } from "./pages/ChallengesPage";

function Protected({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-400">
        Loading…
      </div>
    );
  }
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <Protected>
            <Shell />
          </Protected>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="friends" element={<FriendsPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="contests" element={<ContestsPage />} />
        <Route path="compare" element={<ComparePage />} />
        <Route path="competition" element={<CompetitionPage />} />
        <Route path="challenges" element={<ChallengesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
