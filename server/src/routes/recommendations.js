import { Router } from "express";
import { repo } from "../repo.js";

const router = Router();

// Rank candidates for a job: skill match + hops of separation from the
// hiring manager. skills is a comma-separated list of required skills.
router.get("/", async (req, res, next) => {
  try {
    const { managerId, skills } = req.query;
    if (!managerId || !skills) {
      return res.status(400).json({
        error: "bad_request",
        message: "managerId and skills are required (skills comma-separated).",
      });
    }
    const skillList = String(skills)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    res.json(await repo.recommendCandidates(managerId, skillList));
  } catch (err) {
    next(err);
  }
});

export default router;