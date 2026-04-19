import mongoose from "mongoose";

// Lazy-load to avoid issues with module resolution on Vercel
let appReady: ReturnType<typeof import("../server/src/app").createApp> | null = null;
let dbConnected = false;

async function getApp() {
  if (!dbConnected) {
    await mongoose.connect(process.env.MONGODB_URI!);
    dbConnected = true;
  }
  if (!appReady) {
    const { createApp } = await import("../server/src/app");
    appReady = createApp();
  }
  return appReady;
}

export default async function handler(req: any, res: any) {
  try {
    const app = await getApp();
    return app(req, res);
  } catch (err) {
    console.error("Handler error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}
