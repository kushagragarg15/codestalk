import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1),
  JWT_SECRET: z.string().min(16, "JWT_SECRET should be at least 16 chars"),
  JWT_EXPIRES_IN: z.string().default("30d"),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
  /** Use alfa-leetcode-api REST (`alfa`) or LeetCode GraphQL directly (`graphql`). */
  LEETCODE_PROVIDER: z.enum(["alfa", "graphql"]).default("alfa"),
  /** Base URL for alfa-leetcode-api (no trailing slash). */
  ALFA_LEETCODE_API_URL: z.string().url().default("https://alfa-leetcode-api.onrender.com"),
  LEETCODE_GRAPHQL_URL: z.string().url().default("https://leetcode.com/graphql"),
  DEFAULT_CACHE_TTL_SEC: z.coerce.number().default(300),
  LEETCODE_PROXY_MAX: z.coerce.number().default(60),
  LEETCODE_PROXY_WINDOW_MS: z.coerce.number().default(60_000),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),
  REMINDER_CRON: z.string().default("0 18 * * *"),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function loadEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Invalid environment configuration");
  }
  cached = parsed.data;
  return cached;
}
