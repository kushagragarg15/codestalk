import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { Friend } from "../models/Friend.js";
import {
  getUserBadges,
  getSkillStats,
  getLanguageStats,
  getContestHistory,
  getAcceptedSubmissions,
} from "../services/leetcodeEnhanced.js";

export const competitionRouter = Router();
competitionRouter.use(requireAuth);

/**
 * GET /competition/badges
 * Compare badges earned by all friends
 */
competitionRouter.get("/badges", async (req, res) => {
  const friends = await Friend.find({ ownerId: req.user!._id }).lean();
  
  const badgeData = await Promise.all(
    friends.map(async (f) => {
      const badges = await getUserBadges(f.leetcodeUsername);
      return {
        username: f.leetcodeUsername,
        nickname: f.nickname,
        badges,
        badgeCount: badges.length,
      };
    })
  );
  
  // Sort by badge count
  badgeData.sort((a, b) => b.badgeCount - a.badgeCount);
  
  res.json({ leaderboard: badgeData });
});

/**
 * GET /competition/skills
 * Compare skill proficiency across friends
 */
competitionRouter.get("/skills", async (req, res) => {
  const friends = await Friend.find({ ownerId: req.user!._id }).lean();
  
  const skillData = await Promise.all(
    friends.map(async (f) => {
      const skills = await getSkillStats(f.leetcodeUsername);
      const topSkills = skills
        .sort((a, b) => b.problemsSolved - a.problemsSolved)
        .slice(0, 5);
      
      return {
        username: f.leetcodeUsername,
        nickname: f.nickname,
        topSkills,
        totalSkillProblems: skills.reduce((sum, s) => sum + s.problemsSolved, 0),
      };
    })
  );
  
  res.json({ skillComparison: skillData });
});

/**
 * GET /competition/languages
 * Compare programming language usage
 */
competitionRouter.get("/languages", async (req, res) => {
  const friends = await Friend.find({ ownerId: req.user!._id }).lean();
  
  const langData = await Promise.all(
    friends.map(async (f) => {
      const languages = await getLanguageStats(f.leetcodeUsername);
      return {
        username: f.leetcodeUsername,
        nickname: f.nickname,
        languages,
        primaryLanguage: languages[0]?.languageName || "Unknown",
        languageCount: languages.length,
      };
    })
  );
  
  res.json({ languageComparison: langData });
});

/**
 * GET /competition/contest-performance
 * Detailed contest performance comparison
 */
competitionRouter.get("/contest-performance", async (req, res) => {
  const friends = await Friend.find({ ownerId: req.user!._id }).lean();
  
  const contestData = await Promise.all(
    friends.map(async (f) => {
      const history = await getContestHistory(f.leetcodeUsername);
      
      // Calculate stats
      const attended = history.filter((c) => c.attended);
      const avgRating = attended.length
        ? attended.reduce((sum, c) => sum + c.rating, 0) / attended.length
        : 0;
      const avgRanking = attended.length
        ? attended.reduce((sum, c) => sum + c.ranking, 0) / attended.length
        : 0;
      const bestRanking = attended.length
        ? Math.min(...attended.map((c) => c.ranking))
        : 0;
      
      // Recent trend (last 5 contests)
      const recent = attended.slice(-5);
      const recentAvgRating = recent.length
        ? recent.reduce((sum, c) => sum + c.rating, 0) / recent.length
        : 0;
      
      return {
        username: f.leetcodeUsername,
        nickname: f.nickname,
        totalContests: attended.length,
        avgRating: Math.round(avgRating),
        avgRanking: Math.round(avgRanking),
        bestRanking,
        recentAvgRating: Math.round(recentAvgRating),
        trend: recentAvgRating > avgRating ? "improving" : "stable",
        recentContests: recent.slice(-3),
      };
    })
  );
  
  // Sort by average rating
  contestData.sort((a, b) => b.avgRating - a.avgRating);
  
  res.json({ contestLeaderboard: contestData });
});

/**
 * GET /competition/recent-activity
 * Who solved what recently - create FOMO!
 */
competitionRouter.get("/recent-activity", async (req, res) => {
  const friends = await Friend.find({ ownerId: req.user!._id }).lean();
  
  const activities = await Promise.all(
    friends.map(async (f) => {
      const submissions = await getAcceptedSubmissions(f.leetcodeUsername, 10);
      return submissions.map((s) => ({
        username: f.leetcodeUsername,
        nickname: f.nickname,
        problem: s.title,
        problemSlug: s.titleSlug,
        language: s.lang,
        timestamp: s.timestamp,
      }));
    })
  );
  
  // Flatten and sort by timestamp
  const allActivities = activities.flat().sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
  
  res.json({ recentActivity: allActivities.slice(0, 50) });
});

/**
 * GET /competition/head-to-head/:username1/:username2
 * Detailed 1v1 comparison
 */
competitionRouter.get("/head-to-head/:username1/:username2", async (req, res) => {
  const { username1, username2 } = req.params;
  
  const [badges1, badges2, skills1, skills2, langs1, langs2, contests1, contests2] =
    await Promise.all([
      getUserBadges(username1),
      getUserBadges(username2),
      getSkillStats(username1),
      getSkillStats(username2),
      getLanguageStats(username1),
      getLanguageStats(username2),
      getContestHistory(username1),
      getContestHistory(username2),
    ]);
  
  res.json({
    [username1]: {
      badges: badges1.length,
      topSkills: skills1.slice(0, 5),
      languages: langs1,
      contestsAttended: contests1.filter((c) => c.attended).length,
      avgContestRating:
        contests1.filter((c) => c.attended).reduce((sum, c) => sum + c.rating, 0) /
          contests1.filter((c) => c.attended).length || 0,
    },
    [username2]: {
      badges: badges2.length,
      topSkills: skills2.slice(0, 5),
      languages: langs2,
      contestsAttended: contests2.filter((c) => c.attended).length,
      avgContestRating:
        contests2.filter((c) => c.attended).reduce((sum, c) => sum + c.rating, 0) /
          contests2.filter((c) => c.attended).length || 0,
    },
  });
});
