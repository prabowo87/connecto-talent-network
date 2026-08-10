import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useFetch } from "../hooks.js";
import { Loading, EmptyState, ErrorState } from "../components/States.jsx";
import { IconCompany } from "../components/Icons.jsx";

export default function Companies() {
  const { data, loading, error, reload } = useFetch(() => api("/companies"), []);

  return (
    <div>
      <div className="page-head">
        <h1>Companies</h1>
        <p className="sub">Employers in the graph, with current headcount and alumni footprints.</p>
      </div>

      {loading ? (
        <Loading label="Loading companies…" />
      ) : error ? (
        <ErrorState
          title={error.payload?.error === "database_unavailable" ? "Database unreachable" : "Couldn't load companies"}
          message={error.message}
          onRetry={reload}
        />
      ) : data.length === 0 ? (
        <EmptyState emoji="🏢" title="No companies yet" detail="Run the seed script to populate the graph." />
      ) : (
        <div className="grid cols-2">
          {data.map((c) => (
            <Link key={c.id} to={`/companies/${encodeURIComponent(c.id)}`} className="card" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div className="stat-icon">
                <IconCompany style={{ width: 20, height: 20 }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{c.name}</div>
                <div className="muted" style={{ fontSize: "0.85rem" }}>
                  {[c.industry, c.location].filter(Boolean).join(" · ")}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  <span className="badge neutral">{c.employees} employees</span>
                  <span className="badge green">{c.alumni} alumni in network</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}