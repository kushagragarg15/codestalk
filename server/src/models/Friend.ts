import mongoose, { Schema, type InferSchemaType } from "mongoose";

const friendSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    leetcodeUsername: { type: String, required: true, trim: true, lowercase: true },
    nickname: { type: String, trim: true },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

friendSchema.index({ ownerId: 1, leetcodeUsername: 1 }, { unique: true });

export type FriendDoc = InferSchemaType<typeof friendSchema> & { _id: mongoose.Types.ObjectId };
export const Friend = mongoose.model("Friend", friendSchema);
