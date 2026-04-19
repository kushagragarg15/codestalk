import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { buildFriendSnapshot } from "../services/friendSnapshot";

export const compareRouter = Router();

const limiter = rateLimit({
  windowMs: Number(process.env.LEETCODE_PROXY_WINDOW_MS ?? 60_000),
  max: Number(process.env.LEETCODE_PROXY_MAX ?? 90),
  standardHeaders: true,
  legacyHeaders: false,
});

compareRouter.use(limiter);

const u = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/);

compareRouter.get("/", async (req, res) => {
  const parsed = z
    .object({ a: u, b: u })
    .safeParse({ a: req.query.a, b: req.query.b });
  if (!parsed.success) {
    res.status(400).json({ error: "Query params a and b (LeetCode usernames) are required" });
    return;
  }
  try {
    const [A, B] = await Promise.all([
      buildFriendSnapshot(parsed.data.a),
      buildFriendSnapshot(parsed.data.b),
    ]);
    res.json({
      a: {
        username: A.username,
        exists: A.exists,
        totalSolved: A.totalSolved,
        difficulty: A.difficulty,
        contestRating: A.contestRating,
        streak: A.streak,
      },
      b: {
        username: B.username,
        exists: B.exists,
        totalSolved: B.totalSolved,
        difficulty: B.difficulty,
        contestRating: B.contestRating,
        streak: B.streak,
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Comparison failed";
    res.status(502).json({ error: msg });
  }
});
