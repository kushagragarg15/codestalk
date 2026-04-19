import mongoose, { Schema, type InferSchemaType } from "mongoose";

const cachedLeetcodeSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    payload: { type: Schema.Types.Mixed, required: true },
    expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } },
  },
  { timestamps: true }
);

export type CachedLeetcodeDoc = InferSchemaType<typeof cachedLeetcodeSchema> & {
  _id: mongoose.Types.ObjectId;
};
export const CachedLeetcodeData = mongoose.model("CachedLeetcodeData", cachedLeetcodeSchema);
