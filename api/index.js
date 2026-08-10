/**
 * Vercel serverless function.
 *
 * The whole Express app (API + statically-served built frontend) is exported
 * here. `vercel.json` routes all traffic to this function; locally the app is
 * still run as a normal Node server via `npm run dev`.
 */
import app from "../server/src/index.js";

export default app;