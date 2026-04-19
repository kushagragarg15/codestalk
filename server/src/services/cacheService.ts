import { CachedLeetcodeData } from "../models/CachedLeetcodeData.js";
import { loadEnv } from "../config/env.js";

export async function getCached<T>(key: string): Promise<T | null> {
  const doc = await CachedLeetcodeData.findOne({ key, expiresAt: { $gt: new Date() } }).lean();
  return doc ? (doc.payload as T) : null;
}

export async function setCached(key: string, payload: unknown, ttlSec?: number): Promise<void> {
  const env = loadEnv();
  const ttl = ttlSec ?? env.DEFAULT_CACHE_TTL_SEC;
  const expiresAt = new Date(Date.now() + ttl * 1000);
  await CachedLeetcodeData.findOneAndUpdate(
    { key },
    { $set: { payload, expiresAt } },
    { upsert: true, new: true }
  );
}
