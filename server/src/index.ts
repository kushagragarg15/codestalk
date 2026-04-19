import mongoose from "mongoose";
import { loadEnv } from "./config/env";
import { createApp } from "./app";
import { scheduleReminders } from "./services/reminders";

async function main() {
  const env = loadEnv();
  await mongoose.connect(env.MONGODB_URI);
  console.info("MongoDB connected");

  const app = createApp();
  scheduleReminders();

  app.listen(env.PORT, () => {
    console.info(`CodeStalk API listening on :${env.PORT}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
