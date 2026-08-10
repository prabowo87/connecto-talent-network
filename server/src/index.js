import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { checkDatabaseHealth, closeDriver } from "./db.js";
import { handleError } from "./middleware.js";

import peopleRouter from "./routes/people.js";
import companiesRouter from "./routes/companies.js";
import networkRouter from "./routes/network.js";
import recommendationsRouter from "./routes/recommendations.js";
import statsRouter from "./routes/stats.js";

const app = express();

app.use(cors({ origin: config.clientOrigin }));
app.use(express.json());

// Health probe — the client uses this to show a friendly
// "database offline" banner instead of a blank screen.
app.get("/api/health", async (_req, res) => {
  const health = await checkDatabaseHealth();
  res.status(health.ok ? 200 : 503).json(health);
});

app.use("/api/people", peopleRouter);
app.use("/api/companies", companiesRouter);
app.use("/api/network", networkRouter);
app.use("/api/recommendations", recommendationsRouter);
app.use("/api/stats", statsRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "not_found", message: "No such endpoint." });
});

app.use(handleError);

const server = app.listen(config.port, () => {
  console.log(`[api] Connecto API listening on http://localhost:${config.port}`);
  console.log(`[api] Target graph database: ${config.neo4jUri}`);
});

async function shutdown() {
  console.log("\n[api] Shutting down…");
  server.close();
  await closeDriver();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export default app;