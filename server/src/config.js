import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

// The .env lives at the repository root (one level above the server package).
// Resolve it from this file's location so it works regardless of CWD.
dotenv.config({ path: fileURLToPath(new URL("../../.env", import.meta.url)) });

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable ${name}. ` +
        "Copy .env.example to .env and fill in your CognoDB connection details."
    );
  }
  return value;
}

export const config = {
  port: process.env.PORT || 4000,
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  neo4jUri: required("NEO4J_URI"),
  neo4jUser: required("NEO4J_USER"),
  neo4jPassword: required("NEO4J_PASSWORD"),
  seed: process.env.SEED === "true",
};