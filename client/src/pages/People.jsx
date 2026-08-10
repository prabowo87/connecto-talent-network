import { useMemo, useState } from "react";
import { api } from "../api.js";
import { useFetch } from "../hooks.js";
import { PersonCard } from "../components/PersonCard.jsx";
import { Loading, EmptyState, ErrorState } from "../components/States.jsx";
import { IconSearch } from "../components/Icons.jsx";

export default function People() {
  const [q, setQ] = useState("");

  const result = useFetch(
    useMemo(
      () => async () => {
        const people = await api("/people?limit=500");
        const qq = q.trim().toLowerCase();
        if (!qq) return people;
        return people.filter(
          (p) =>
            (p.name || "").toLowerCase().includes(qq) ||
            (p.title || "").toLowerCase().includes(qq) ||
            (p.location || "").toLowerCase().includes(qq) ||
            (p.company || "").toLowerCase().includes(qq)
        );
      },
      [q]
    ),
    [q]
  );

  const { data, loading, error, reload } = result;

  return (
    <div>
      <div className="page-head">
        <h1>People</h1>
        <p className="sub">Every professional in the graph, with their connections, skills and employers.</p>
      </div>

      <div className="search-row">
        <div style={{ position: "relative", flex: 1, maxWidth: 420 }}>
          <IconSearch style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", width: 17, height: 17, color: "var(--muted)" }} />
          <input
            className="input"
            style={{ paddingLeft: 38 }}
            placeholder="Search by name, title, company or location…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search people"
          />
        </div>
      </div>

      {loading ? (
        <Loading label="Fetching people…" />
      ) : error ? (
        <ErrorState
          title={error.payload?.error === "database_unavailable" ? "Database unreachable" : "Couldn't load people"}
          message={error.message}
          onRetry={reload}
        />
      ) : data.length === 0 ? (
        <EmptyState
          emoji="🧑‍💻"
          title={q ? `No matches for “${q}”` : "No people in the graph"}
          detail={q ? "Try a different name, title or company." : "Run the seed script to load the network."}
        />
      ) : (
        <div className="grid cols-2">
          {data.map((p) => (
            <PersonCard key={p.id} person={p} />
          ))}
        </div>
      )}
    </div>
  );
}