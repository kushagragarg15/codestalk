import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { loadEnv } from "../config/env.js";
import type { UserDoc } from "../models/User.js";
import { User } from "../models/User.js";

export type AuthPayload = { sub: string };

declare global {
  namespace Express {
    interface Request {
      user?: UserDoc;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization;
  const token = hdr?.startsWith("Bearer ") ? hdr.slice(7) : undefined;
  if (!token) {
    res.status(401).json({ error: "Missing bearer token" });
    return;
  }
  try {
    const env = loadEnv();
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    const user = await User.findById(decoded.sub).lean();
    if (!user) {
      res.status(401).json({ error: "User not found" });
      return;
    }
    req.user = user as UserDoc;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}
