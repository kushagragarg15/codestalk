import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { loadEnv } from "./config/env.js";
import { authRouter } from "./routes/auth.js";
import { friendsRouter } from "./routes/friends.js";
import { leetcodeRouter } from "./routes/leetcode.js";
import { leaderboardRouter } from "./routes/leaderboard.js";
import { contestsRouter } from "./routes/contests.js";
import { compareRouter } from "./routes/compare.js";
import { insightsRouter } from "./routes/insights.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { competitionRouter } from "./routes/competition.js";
import { challengesRouter } from "./routes/challenges.js";

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
