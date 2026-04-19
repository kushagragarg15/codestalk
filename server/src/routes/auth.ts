import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { z } from "zod";
import { loadEnv } from "../config/env.js";
import { User } from "../models/User.js";
import { requireAuth } from "../middleware/requireAuth.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().max(80).optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const authRouter = Router();

authRouter.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const { email, password, displayName } = parsed.data;
  const exists = await User.findOne({ email });
  if (exists) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email, passwordHash, displayName });
  const env = loadEnv();
  const signOpts: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  const token = jwt.sign({ sub: user._id.toString() }, env.JWT_SECRET, signOpts);
  res.status(201).json({
    token,
    user: { id: user._id, email: user.email, displayName: user.displayName, myLeetcodeUsername: user.myLeetcodeUsername },
  });
});

authRouter.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const user = await User.findOne({ email: parsed.data.email });
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const env = loadEnv();
  const signOpts: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
  };
  const token = jwt.sign({ sub: user._id.toString() }, env.JWT_SECRET, signOpts);
  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      displayName: user.displayName,
      myLeetcodeUsername: user.myLeetcodeUsername,
      reminderEmailEnabled: user.reminderEmailEnabled,
    },
  });
});

authRouter.get("/me", requireAuth, async (req, res) => {
  const u = await User.findById(req.user!._id).lean();
  if (!u) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.json({
    id: u._id,
    email: u.email,
    displayName: u.displayName,
    myLeetcodeUsername: u.myLeetcodeUsername,
    reminderEmailEnabled: u.reminderEmailEnabled,
  });
});

const patchSchema = z.object({
  displayName: z.string().max(80).optional(),
  myLeetcodeUsername: z
    .string()
    .min(2)
    .max(64)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional()
    .or(z.literal("")),
  reminderEmailEnabled: z.boolean().optional(),
});

authRouter.patch("/me", requireAuth, async (req, res) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const u = await User.findById(req.user!._id);
  if (!u) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  const d = parsed.data;
  if (d.displayName !== undefined) u.displayName = d.displayName;
  if (d.myLeetcodeUsername !== undefined)
    u.myLeetcodeUsername = d.myLeetcodeUsername ? d.myLeetcodeUsername.toLowerCase() : undefined;
  if (d.reminderEmailEnabled !== undefined) u.reminderEmailEnabled = d.reminderEmailEnabled;
  await u.save();
  res.json({
    id: u._id,
    email: u.email,
    displayName: u.displayName,
    myLeetcodeUsername: u.myLeetcodeUsername,
    reminderEmailEnabled: u.reminderEmailEnabled,
  });
});
