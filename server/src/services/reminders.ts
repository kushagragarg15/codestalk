import cron from "node-cron";
import nodemailer from "nodemailer";
import { loadEnv } from "../config/env.js";
import { User } from "../models/User.js";
import { Friend } from "../models/Friend.js";
import { buildFriendSnapshot } from "./friendSnapshot.js";

function createTransport() {
  const env = loadEnv();
  if (!env.SMTP_HOST || !env.SMTP_USER || !env.SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 587,
    secure: false,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
}

/** Daily check: email users who opted in when a friend had no activity today (best-effort) */
export function scheduleReminders() {
  const env = loadEnv();
  const transport = createTransport();
  if (!transport) {
    console.info("[reminders] SMTP not configured — daily email reminders disabled.");
    return;
  }
  cron.schedule(env.REMINDER_CRON, async () => {
    const users = await User.find({ reminderEmailEnabled: true }).lean();
    for (const u of users) {
      const friends = await Friend.find({ ownerId: u._id }).lean();
      if (!friends.length) continue;
      const slackers: string[] = [];
      for (const f of friends) {
        const snap = await buildFriendSnapshot(f.leetcodeUsername);
        if (snap.exists && !snap.activeToday) slackers.push(f.leetcodeUsername);
      }
      if (!slackers.length) continue;
      try {
        await transport.sendMail({
          from: env.SMTP_FROM ?? "noreply@codestalk.local",
          to: u.email,
          subject: "[CodeStalk] Friendly check-in on your study group",
          text: `Some friends have no LeetCode activity logged today: ${slackers.join(
            ", "
          )}. Maybe nudge them — or use it as motivation to extend your own streak.`,
        });
      } catch (e) {
        console.error("[reminders] send failed", u.email, e);
      }
    }
  });
}
