import { Router } from "express";
import { repo } from "../repo.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 200, 500);
    res.json(await repo.listPeople(limit));
  } catch (err) {
    next(err);
  }
});

router.get("/search", async (req, res, next) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json([]);
    res.json(await repo.searchPeople(q));
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const person = await repo.person(req.params.id);
    if (!person) {
      return res.status(404).json({ error: "not_found", message: "Person not found." });
    }
    res.json(person);
  } catch (err) {
    next(err);
  }
});

export default router;