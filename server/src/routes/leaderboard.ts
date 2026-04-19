import { Router } from "express";
import { z } from "zod";
import { Friend } from "../models/Friend";
import { requireAuth } from "../middleware/requireAuth";
import { buildFriendSnapshot } from "../services/friendSnapshot";

export const leaderboardRouter = Router();
leaderboardRouter.use(requireAuth);

const metricSchema = z.enum(["daily", "weekly", "monthly", "rating", "streak"]);

leaderboardRouter.get("/", async (req, res) => {
  const m = metricSchema.safeParse(req.query.metric ?? "weekly");
  if (!m.success) {
    res.status(400).json({ error: "metric must be daily|weekly|monthly|rating|streak" });
    return;
  }
  const metric = m.data;
  const friends = await Friend.find({ ownerId: req.user!._id }).lean();
  const snaps = await Promise.all(
    friends.map(async (f) => ({ f, s: await buildFriendSnapshot(f.leetcodeUsername) }))
  );
  const rows = snaps
    .filter((x) => x.s.exists)
    .map((x) => {
      let score = 0;
      if (metric === "daily") score = x.s.counts.daily;
      else if (metric === "weekly") score = x.s.counts.weekly;
      else if (metric === "monthly") score = x.s.counts.monthly;
      else if (metric === "rating") score = x.s.contestRating ?? -1;
      else score = x.s.streak;
      return {
        rank: 0,
        leetcodeUsername: x.f.leetcodeUsername,
        nickname: x.f.nickname,
        score,
        activeToday: x.s.activeToday,
        contestRating: x.s.contestRating,
        streak: x.s.streak,
        counts: x.s.counts,
      };
    })
    .sort((a, b) => b.score - a.score);
  rows.forEach((r, i) => {
    r.rank = i + 1;
  });
  res.json({ metric, leaderboard: rows });
});
