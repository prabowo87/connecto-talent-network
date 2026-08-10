import { useParams } from "react-router-dom";
import { api } from "../api.js";
import { useFetch } from "../hooks.js";
import { PersonCard } from "../components/PersonCard.jsx";
import { Loading, EmptyState, ErrorState } from "../components/States.jsx";
import { usePersona } from "../App.jsx";
import { IconHop } from "../components/Icons.jsx";

export default function Company() {
  const { id } = useParams();
  const { persona } = usePersona();

  const company = useFetch(() => api(`/companies/${encodeURIComponent(id)}`), [id]);
  const inNetwork = useFetch(
    () => api(`/network/company?me=${encodeURIComponent(persona)}&companyId=${encodeURIComponent(id)}`),
    [id, persona]
  );

  if (company.loading) return <Loading label="Loading company…" />;
  if (company.error)
    return (
      <ErrorState
        title={company.error.status === 404 ? "Company not found" : "Couldn't load company"}
        message={company.error.message}
        onRetry={company.reload}
      />
    );

  const c = company.data;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 2 }}>{c.name}</h1>
        <div className="muted">
          {[c.industry, c.location].filter(Boolean).join(" · ")} · {c.currentEmployees} employees · {c.alumni} alumni in
          network
        </div>
        {c.about ? (
          <p style={{ color: "var(--text-soft)", marginTop: 10, maxWidth: 680 }}>{c.about}</p>
        ) : null}
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <h3>
          People in my network who work here
          <span className="muted" style={{ fontWeight: 500, fontSize: "0.82rem" }}>
            {" "}
            (within 4 hops of {persona})
          </span>
        </h3>
        {inNetwork.loading ? (
          <Loading label="Mapping your reach…" />
        ) : inNetwork.error ? (
          <ErrorState message={inNetwork.error.message} onRetry={inNetwork.reload} />
        ) : inNetwork.data.length === 0 ? (
          <EmptyState
            emoji="🛰️"
            title="No one you know works here (yet)"
            detail="Nobody at this company sits within four hops of your network."
          />
        ) : (
          <>
            <div className="hops-legend" style={{ marginBottom: 14 }}>
              {[1, 2, 3, 4].map((h) => (
                <span key={h}>
                  <IconHop style={{ width: 13, height: 13, verticalAlign: "middle" }} /> {h} hop{h > 1 ? "s" : ""}
                </span>
              ))}
            </div>
            <div className="grid cols-2">
              {inNetwork.data.map((p) => (
                <PersonCard
                  key={p.id}
                  person={{ ...p, avatarColor: undefined }}
                  right={<span className="badge">{p.hops} hop{p.hops > 1 ? "s" : ""}</span>}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h3>Everyone here ({c.people.length})</h3>
        {c.people.length === 0 ? (
          <EmptyState emoji="🏢" title="No current employees listed" />
        ) : (
          <div className="grid cols-2">
            {c.people.map((p) => (
              <PersonCard key={p.id} person={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}