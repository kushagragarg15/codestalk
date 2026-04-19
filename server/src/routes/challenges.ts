import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import { Friend } from "../models/Friend";
import { getDailyProblem, getProblems, getTrendingDiscussions } from "../services/leetcodeEnhanced";
import { getAcceptedSubmissions } from "../services/leetcodeEnhanced";

export const challengesRouter = Router();
challengesRouter.use(requireAuth);

/**
 * GET /challenges/daily
 * Today's challenge + who completed it
 */
challengesRouter.get("/daily", async (req, res) => {
  const daily = await getDailyProblem();
  const friends = await Friend.find({ ownerId: req.user!._id }).lean();
  
  // Check who solved today's problem
  const completionStatus = await Promise.all(
    friends.map(async (f) => {
      const submissions = await getAcceptedSubmissions(f.leetcodeUsername, 20);
      const solvedToday = submissions.some(
        (s) => s.titleSlug === daily.question.titleSlug
      );
      
      return {
        username: f.leetcodeUsername,
        nickname: f.nickname,
        completed: solvedToday,
        timestamp: solvedToday
          ? submissions.find((s) => s.titleSlug === daily.question.titleSlug)?.timestamp
          : null,
      };
    })
  );
  
  const completed = completionStatus.filter((c) => c.completed);
  const pending = completionStatus.filter((c) => !c.completed);
  
  res.json({
    problem: daily,
    stats: {
      totalFriends: friends.length,
      completed: completed.length,
      pending: pending.length,
      completionRate: Math.round((completed.length / friends.length) * 100),
    },
    completedBy: completed.sort((a, b) => 
      new Date(a.timestamp!).getTime() - new Date(b.timestamp!).getTime()
    ),
    pendingUsers: pending,
  });
});

/**
 * GET /challenges/weekly
 * Generate weekly challenge based on weak areas
 */
challengesRouter.get("/weekly", async (req, res) => {
  // Get random problems from different difficulties
  const [easy, medium, hard] = await Promise.all([
    getProblems({ limit: 2, difficulty: "EASY" }),
    getProblems({ limit: 3, difficulty: "MEDIUM" }),
    getProblems({ limit: 2, difficulty: "HARD" }),
  ]);
  
  const weeklyChallenge = {
    week: `Week ${Math.ceil(new Date().getDate() / 7)}`,
    startDate: new Date().toISOString(),
    problems: [...easy, ...medium, ...hard],
    totalPoints: easy.length * 10 + medium.length * 20 + hard.length * 30,
  };
  
  res.json({ challenge: weeklyChallenge });
});

/**
 * GET /challenges/trending
 * Hot problems everyone is discussing
 */
challengesRouter.get("/trending", async (req, res) => {
  const discussions = await getTrendingDiscussions(15);
  
  res.json({
    trending: discussions.map((d) => ({
      id: d.id,
      title: d.title,
      author: d.post.author.username,
      comments: d.commentCount,
      views: d.viewCount,
      createdAt: new Date(d.post.creationDate * 1000).toISOString(),
    })),
  });
});

/**
 * GET /challenges/recommend
 * Recommend problems based on tags
 */
challengesRouter.get("/recommend", async (req, res) => {
  const tags = (req.query.tags as string)?.split(",") || [];
  const difficulty = (req.query.difficulty as "EASY" | "MEDIUM" | "HARD") || undefined;
  
  const problems = await getProblems({
    limit: 10,
    tags,
    difficulty,
  });
  
  res.json({ recommendations: problems });
});

/**
 * POST /challenges/create-group-challenge
 * Create a custom challenge for your friend group
 */
challengesRouter.post("/create-group-challenge", async (req, res) => {
  const { name, problemSlugs, durationDays } = req.body;
  
  if (!name || !problemSlugs || !Array.isArray(problemSlugs)) {
    res.status(400).json({ error: "Invalid challenge data" });
    return;
  }
  
  const challenge = {
    id: `challenge_${Date.now()}`,
    name,
    createdBy: req.user!._id,
    problemSlugs,
    startDate: new Date(),
    endDate: new Date(Date.now() + (durationDays || 7) * 24 * 60 * 60 * 1000),
    participants: [],
  };
  
  // TODO: Store in database
  res.json({ challenge });
});
