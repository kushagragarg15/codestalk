import { Router } from "express";
import { z } from "zod";
import { Friend } from "../models/Friend";
import { requireAuth } from "../middleware/requireAuth";
import { getProfile } from "../services/leetcodeService";
import { buildFriendSnapshot } from "../services/friendSnapshot";
import { badgesForStats, friendlyNudge } from "../services/gamification";

export const friendsRouter = Router();

friendsRouter.use(requireAuth);

const usernameSchema = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/, "Invalid LeetCode username format");

friendsRouter.get("/", async (req, res) => {
  const list = await Friend.find({ ownerId: req.user!._id }).sort({ addedAt: -1 }).lean();
  const enriched = await Promise.all(
    list.map(async (f) => {
      const snap = await buildFriendSnapshot(f.leetcodeUsername);
      const badges = badgesForStats({
        streak: snap.streak,
        totalActiveDays: snap.totalActiveDays,
        weeklySubs: snap.counts.weekly,
        contestRating: snap.contestRating,
      });
      const nudge = friendlyNudge({
        activeToday: snap.activeToday,
        streak: snap.streak,
        weeklySubs: snap.counts.weekly,
      });
      return {
        id: f._id,
        leetcodeUsername: f.leetcodeUsername,
        nickname: f.nickname,
        addedAt: f.addedAt,
        snapshot: snap,
        badges,
        nudge,
      };
    })
  );
  res.json({ friends: enriched });
});

friendsRouter.post("/", async (req, res) => {
  const bodySchema = z.object({
    leetcodeUsername: usernameSchema,
    nickname: z.string().max(80).optional(),
  });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const lc = parsed.data.leetcodeUsername.trim().toLowerCase();
  const prof = await getProfile(lc);
  if (!prof.matchedUser?.username) {
    res.status(404).json({ error: "LeetCode user not found" });
    return;
  }
  try {
    const doc = await Friend.create({
      ownerId: req.user!._id,
      leetcodeUsername: lc,
      nickname: parsed.data.nickname,
    });
    const snap = await buildFriendSnapshot(lc);
    res.status(201).json({ friend: doc, snapshot: snap });
  } catch (e: unknown) {
    if ((e as { code?: number }).code === 11000) {
      res.status(409).json({ error: "Friend already added" });
      return;
    }
    throw e;
  }
});

friendsRouter.delete("/:username", async (req, res) => {
  const u = req.params.username?.trim().toLowerCase();
  if (!u) {
    res.status(400).json({ error: "username required" });
    return;
  }
  await Friend.deleteOne({ ownerId: req.user!._id, leetcodeUsername: u });
  res.status(204).send();
});
