import mongoose, { Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    displayName: { type: String, trim: true },
    /** Optional — link your own LeetCode handle for dashboards */
    myLeetcodeUsername: { type: String, trim: true, lowercase: true },
    reminderEmailEnabled: { type: Boolean, default: false },
    streakBadgeIds: [{ type: String }],
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };
export const User = mongoose.model("User", userSchema);
