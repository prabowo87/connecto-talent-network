import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
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

// Serve the built frontend from a single Express process — used in
// production (and by the Vercel serverless function). In dev, Vite serves
// the app and these routes are simply never hit.
const clientDist = fileURLToPath(new URL("../../client/dist", import.meta.url));
app.use(express.static(clientDist, { index: false }));

// SPA fallback for production: any non-API path returns index.html.
app.get(/^\/(?!api\/).*/, (_req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.use((_req, res) => {
  res.status(404).json({ error: "not_found", message: "No such endpoint." });
});

app.use(handleError);

const isMain =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
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
}

export default app;