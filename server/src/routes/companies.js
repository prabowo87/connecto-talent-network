import { Router } from "express";
import { repo } from "../repo.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    res.json(await repo.listCompanies());
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const company = await repo.company(req.params.id);
    if (!company) {
      return res.status(404).json({ error: "not_found", message: "Company not found." });
    }
    res.json(company);
  } catch (err) {
    next(err);
  }
});

export default router;