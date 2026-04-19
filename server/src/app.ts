import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { loadEnv } from "./config/env";
import { authRouter } from "./routes/auth";
import { friendsRouter } from "./routes/friends";
import { leetcodeRouter } from "./routes/leetcode";
import { leaderboardRouter } from "./routes/leaderboard";
import { contestsRouter } from "./routes/contests";
import { compareRouter } from "./routes/compare";
import { insightsRouter } from "./routes/insights";
import { dashboardRouter } from "./routes/dashboard";
import { competitionRouter } from "./routes/competition";
import { challengesRouter } from "./routes/challenges";

export function createApp() {
  const env = loadEnv();
  const app = express();
  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN.split(",").map((s) => s.trim()),
      credentials: true,
    })
  );
  app.use(express.json({ limit: "256kb" }));

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 800,
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(globalLimiter);

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "codestalk-api" });
  });

  app.use("/auth", authRouter);
  app.use("/friends", friendsRouter);
  app.use("/leetcode", leetcodeRouter);
  app.use("/leaderboard", leaderboardRouter);
  app.use("/contests", contestsRouter);
  app.use("/compare", compareRouter);
  app.use("/insights", insightsRouter);
  app.use("/dashboard", dashboardRouter);
  app.use("/competition", competitionRouter);
  app.use("/challenges", challengesRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}

// Serverless-compatible export (used by Vercel api/index.ts)
export const appHandler = createApp();
