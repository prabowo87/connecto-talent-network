import { Router } from "express";
import { repo } from "../repo.js";

const router = Router();

// Degrees of separation between two people (shortest path, up to 6 hops).
router.get("/path", async (req, res, next) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: "bad_request", message: "from and to are required." });
    }
    res.json(await repo.degreesOfSeparation(from, to));
  } catch (err) {
    next(err);
  }
});

// Who can introduce me directly (2 hops) to a target person.
router.get("/introducers", async (req, res, next) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: "bad_request", message: "from and to are required." });
    }
    res.json(await repo.introducers(from, to));
  } catch (err) {
    next(err);
  }
});

// Mutual connections of two people.
router.get("/mutual", async (req, res, next) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: "bad_request", message: "from and to are required." });
    }
    res.json(await repo.mutualConnections(from, to));
  } catch (err) {
    next(err);
  }
});

// People I can reach (multi-hop) who currently work at a given company.
router.get("/company", async (req, res, next) => {
  try {
    const { me, companyId } = req.query;
    if (!me || !companyId) {
      return res.status(400).json({ error: "bad_request", message: "me and companyId are required." });
    }
    res.json(await repo.peopleAtCompany(me, companyId));
  } catch (err) {
    next(err);
  }
});

export default router;