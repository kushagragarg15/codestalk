import { Router } from "express";
import { User } from "../models/User.js";
import { Friend } from "../models/Friend.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { buildFriendSnapshot } from "../services/friendSnapshot.js";

export const dashboardRouter = Router();
dashboardRouter.use(requireAuth);

dashboardRouter.get("/", async (req, res) => {
  const user = await User.findById(req.user!._id).lean();
  const friends = await Friend.find({ ownerId: req.user!._id }).lean();
  let selfSnap = null as Awaited<ReturnType<typeof buildFriendSnapshot>> | null;
  if (user?.myLeetcodeUsername) {
    selfSnap = await buildFriendSnapshot(user.myLeetcodeUsername);
  }
  const friendPreviews = await Promise.all(
    friends.slice(0, 8).map(async (f) => {
      const s = await buildFriendSnapshot(f.leetcodeUsername);
      return {
        leetcodeUsername: f.leetcodeUsername,
        activeToday: s.activeToday,
        streak: s.streak,
        weekly: s.counts.weekly,
        contestRating: s.contestRating,
      };
    })
  );
  res.json({
    user: {
      displayName: user?.displayName,
      myLeetcodeUsername: user?.myLeetcodeUsername,
    },
    self: selfSnap,
    friendsPreview: friendPreviews,
    friendTotal: friends.length,
  });
});
