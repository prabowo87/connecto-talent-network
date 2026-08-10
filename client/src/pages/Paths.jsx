import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { useFetch } from "../hooks.js";
import { PersonPicker } from "../components/PersonPicker.jsx";
import { PathChain } from "../components/PathChain.jsx";
import { PersonCard } from "../components/PersonCard.jsx";
import { Loading, EmptyState, ErrorState } from "../components/States.jsx";
import { usePersona } from "../App.jsx";
import { IconHop } from "../components/Icons.jsx";

export default function Paths() {
  const [params] = useSearchParams();
  const { persona } = usePersona();

  const [from, setFrom] = useState(params.get("from") || persona);
  const [to, setTo] = useState(params.get("to") || "");

  useEffect(() => {
    if (!params.get("from") && !params.get("to")) {
      setFrom(persona);
      setTo("");
    }
  }, [params, persona]);

  const ready = Boolean(from && to && from !== to);
  const { data, loading, error, reload } = useFetch(
    () =>
      ready
        ? Promise.all([
            api(`/network/path?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
            api(`/network/mutual?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
          ]).then(([path, mutual]) => ({ path, mutual }))
        : Promise.resolve(null),
    [ready, from, to]
  );

  const result = data ?? {};
  const path = result.path ?? null;
  const mutualList = result.mutual ?? [];

  return (
    <div>
      <div className="page-head">
        <h1>Find the shortest path</h1>
        <p className="sub">
          Degrees of separation through the KNOWS network — a shortest-path traversal a relational database can&rsquo;t
          express in one query.
        </p>
      </div>

      <div className="card" style={{ maxWidth: 760 }}>
        <div className="grid cols-2">
          <PersonPicker label="From" value={from} onChange={setFrom} placeholder="Start person…" />
          <PersonPicker label="To" value={to} onChange={setTo} placeholder="Target person…" />
        </div>
      </div>

      <div style={{ height: 18 }} />

      {!ready ? (
        <EmptyState
          emoji="🧭"
          title="Pick two people"
          detail="Choose a start and a target to trace the shortest connection path between them."
        />
      ) : loading ? (
        <Loading label="Tracing the shortest path…" />
      ) : error ? (
        <ErrorState
          title={error.payload?.error === "database_unavailable" ? "Database unreachable" : "Couldn't trace path"}
          message={error.message}
          onRetry={reload}
        />
      ) : path ? (
        <>
          <div className="card" style={{ marginBottom: 22 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 6 }}>
              <h3 style={{ marginBottom: 0 }}>
                {path.degrees === 1 ? "Directly connected" : `${path.degrees} degrees apart`}
              </h3>
              <span className="badge">
                <IconHop style={{ width: 12, height: 12 }} /> {path.path.length - 1} hop{path.path.length - 1 > 1 ? "s" : ""}
              </span>
            </div>
            <p className="muted" style={{ marginBottom: 10 }}>
              Shortest chain found via <code>shortestPath((a)-[:KNOWS*..6]-(b))</code>.
            </p>
            <PathChain path={path.path} />
          </div>

          <div className="card">
            <h3>Shared connections</h3>
            {mutualList.length === 0 ? (
              <EmptyState
                emoji="🤝"
                title={`No mutual connections between ${path.path[0].name} and ${path.path[path.path.length - 1].name}`}
                detail="They connect only through longer chains."
              />
            ) : (
              <div className="grid cols-2">
                {mutualList.map((m) => (
                  <PersonCard
                    key={m.id}
                    person={{ ...m, avatarColor: undefined }}
                    right={<span className="badge green">mutual</span>}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <EmptyState
          emoji="🛰️"
          title="No path within 6 hops"
          detail="These two people aren't connected through 6 or fewer steps in the current data."
        />
      )}
    </div>
  );
}