import { Router } from "express";
import { z } from "zod";
import rateLimit from "express-rate-limit";
import { buildFriendSnapshot } from "../services/friendSnapshot.js";

export const leetcodeRouter = Router();

const leetcodeLimiter = rateLimit({
  windowMs: Number(process.env.LEETCODE_PROXY_WINDOW_MS ?? 60_000),
  max: Number(process.env.LEETCODE_PROXY_MAX ?? 60),
  standardHeaders: true,
  legacyHeaders: false,
});

leetcodeRouter.use(leetcodeLimiter);

const paramSchema = z
  .string()
  .min(2)
  .max(64)
  .regex(/^[a-zA-Z0-9_-]+$/);

/** Public-ish proxy with rate limits — optional auth to align with spec route names */
leetcodeRouter.get("/:username", async (req, res) => {
  const parsed = paramSchema.safeParse(req.params.username);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid username" });
    return;
  }
  try {
    const snap = await buildFriendSnapshot(parsed.data);
    res.json(snap);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upstream error";
    res.status(502).json({ error: msg });
  }
});
