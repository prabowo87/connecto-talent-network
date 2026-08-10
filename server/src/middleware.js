import { DatabaseUnavailableError } from "./db.js";

/** Map repository errors to sensible HTTP statuses. */
export function handleError(err, _req, res, _next) {
  if (err instanceof DatabaseUnavailableError) {
    return res.status(503).json({
      error: "database_unavailable",
      message: "The graph database is unreachable. Check your CognoDB connection settings.",
      detail: err.cause?.message,
    });
  }

  if (err.name === "Neo4jError") {
    // e.g. a malformed Cypher statement — a server bug, not a client problem.
    return res.status(500).json({ error: "query_failed", message: err.message });
  }

  console.error("[api] Unhandled error:", err);
  return res.status(500).json({ error: "internal", message: "Internal server error." });
}