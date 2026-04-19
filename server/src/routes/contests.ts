import { Router } from "express";
import rateLimit from "express-rate-limit";
import { getUpcomingContests } from "../services/leetcodeService.js";

export const contestsRouter = Router();

const limiter = rateLimit({
  windowMs: Number(process.env.LEETCODE_PROXY_WINDOW_MS ?? 60_000),
  max: Number(process.env.LEETCODE_PROXY_MAX ?? 120),
  standardHeaders: true,
  legacyHeaders: false,
});

contestsRouter.use(limiter);

/** Upcoming contests (global). Past per-user contest history is not exposed on public GraphQL the same way for all accounts; client can show rating from profile. */
contestsRouter.get("/", async (_req, res) => {
  try {
    const data = await getUpcomingContests();
    res.json({
      upcoming: data.upcomingContests.map((c) => ({
        title: c.title,
        slug: c.slug,
        startTime: c.startTime,
        durationSec: c.duration,
      })),
      note: "Past contest scoreboards are on LeetCode; this API returns upcoming schedule and cached metadata.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to fetch contests";
    res.status(502).json({ error: msg });
  }
});
