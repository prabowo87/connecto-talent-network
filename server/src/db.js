import neo4j from "neo4j-driver";
import { config } from "./config.js";

let driver = null;

/**
 * Lazily create the shared Neo4j driver. We use the official neo4j-driver,
 * speaking openCypher over the Bolt protocol — exactly what CognoDB speaks, so
 * no CognoDB-specific SDK is needed.
 */
export function getDriver() {
  if (!driver) {
    driver = neo4j.driver(
      config.neo4jUri,
      neo4j.auth.basic(config.neo4jUser, config.neo4jPassword),
      {
        maxConnectionPoolSize: 10,
        connectionAcquisitionTimeout: 10_000,
        connectionTimeout: 15_000,
        // Keep userVerified connectivity errors surfaced as-is so the health
        // endpoint can report "database unreachable" cleanly.
      }
    );
  }
  return driver;
}

/**
 * Run a unit of work inside a single session and always release it.
 * Throws a DriverError-wrapped exception on connectivity problems so routes
 * can degrade gracefully instead of crashing the process.
 */
export async function withSession(work) {
  const session = getDriver().session({ defaultAccessMode: neo4j.session.READ });
  try {
    return await work(session);
  } finally {
    await session.close();
  }
}

export class DatabaseUnavailableError extends Error {
  constructor(cause) {
    super("The graph database is unreachable.");
    this.name = "DatabaseUnavailableError";
    this.cause = cause;
  }
}

/**
 * Verify connectivity with a trivial query. Returns true when the database is
 * reachable; never rejects.
 */
export async function checkDatabaseHealth() {
  try {
    await withSession((session) => session.run("RETURN 1 AS ok"));
    return { ok: true, uri: config.neo4jUri };
  } catch (err) {
    return { ok: false, message: err.message };
  }
}

const UNAVAILABLE_ERRORS = new Set([
  "ServiceUnavailableError",
  "SessionExpiredError",
  "ConnectionError",
  "ConnectionTimeoutError",
  "ConnectionAcquisitionTimeoutError",
  "ProtocolError",
]);

/**
 * Run a query, converting driver/connection failures into a
 * DatabaseUnavailableError so HTTP routes can respond with 503. Query-level
 * (syntax etc.) errors are left as-is so they surface as "query_failed".
 */
export async function runQuery(cypher, params = {}) {
  try {
    const result = await withSession((session) => session.run(cypher, params));
    return result.records.map((record) => toPlain(record.toObject()));
  } catch (err) {
    if (UNAVAILABLE_ERRORS.has(err.name) || err.code?.startsWith("Neo.ClientError.Security")) {
      throw new DatabaseUnavailableError(err);
    }
    throw err;
  }
}

/**
 * Recursively convert driver values (Integer, date, etc.) into plain JS
 * values so they serialise cleanly over JSON: 5, not {low:5,high:5}.
 */
function toPlain(value) {
  if (neo4j.isInt(value)) return value.toNumber();
  if (Array.isArray(value)) return value.map(toPlain);
  if (value && typeof value === "object") {
    if (typeof value.toNumber === "function") return value.toNumber();
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = toPlain(v);
    return out;
  }
  return value;
}

/**
 * Close the driver (mainly used by tests / shutdown hooks).
 */
export async function closeDriver() {
  if (driver) {
    await driver.close();
    driver = null;
  }
}