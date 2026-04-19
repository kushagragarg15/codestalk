import { Router } from "express";
import { Friend } from "../models/Friend.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { buildFriendSnapshot } from "../services/friendSnapshot.js";

export const insightsRouter = Router();
insightsRouter.use(requireAuth);

/** Aggregated “who’s slacking today” + simple weekly rollup for the logged-in user’s friend list */
insightsRouter.get("/weekly-summary", async (req, res) => {
  const friends = await Friend.find({ ownerId: req.user!._id }).lean();
  const snaps = await Promise.all(friends.map((f) => buildFriendSnapshot(f.leetcodeUsername)));
  const inactiveToday = snaps
    .filter((s) => s.exists && !s.activeToday)
    .map((s) => s.username);
  const topWeekly = snaps
    .filter((s) => s.exists)
    .sort((a, b) => b.counts.weekly - a.counts.weekly)
    .slice(0, 5)
    .map((s) => ({ username: s.username, weekly: s.counts.weekly, streak: s.streak }));
  res.json({
    generatedAt: new Date().toISOString(),
    friendCount: friends.length,
    inactiveToday,
    topWeekly,
  });
});
