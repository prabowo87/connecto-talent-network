import { Router } from "express";
import { repo } from "../repo.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    res.json(await repo.stats());
  } catch (err) {
    next(err);
  }
});

export default router;