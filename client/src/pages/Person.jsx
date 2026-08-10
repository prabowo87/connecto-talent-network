import { Link, useParams } from "react-router-dom";
import { api } from "../api.js";
import { useFetch } from "../hooks.js";
import { usePersona } from "../App.jsx";
import { Avatar } from "../components/Avatar.jsx";
import { PersonCard } from "../components/PersonCard.jsx";
import { Loading, ErrorState } from "../components/States.jsx";
import { IconHop } from "../components/Icons.jsx";

export default function Person() {
  const { id } = useParams();
  const { persona } = usePersona();

  const { data, loading, error, reload } = useFetch(
    () => api(`/people/${encodeURIComponent(id)}`),
    [id]
  );

  if (loading) return <Loading label="Loading profile…" />;
  if (error)
    return (
      <ErrorState
        title={error.status === 404 ? "Person not found" : "Couldn't load profile"}
        message={error.message}
        onRetry={reload}
      />
    );

  const p = data;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 18, marginBottom: 24 }}>
        <Avatar name={p.name} color={p.avatarColor} size="xl" />
        <div style={{ flex: 1 }}>
          <h1 style={{ marginBottom: 2 }}>{p.name}</h1>
          <div style={{ color: "var(--text-soft)" }}>
            {p.title}
            {p.company ? (
              <>
                {" · "}
                <Link to={`/companies/${encodeURIComponent(p.companyId)}`}>{p.company}</Link>
              </>
            ) : null}
          </div>
          <div className="muted" style={{ marginTop: 6 }}>
            {[p.location, `${p.yearsExperience ?? 0} yrs experience`].filter(Boolean).join(" · ")}
            {" · "}
            <span className="badge neutral">
              <IconHop style={{ width: 12, height: 12 }} /> {p.connectionCount} direct connections
            </span>
          </div>
        </div>
        <Link
          className="btn"
          to={`/paths?from=${encodeURIComponent(id)}&to=${encodeURIComponent(persona)}`}
          style={{ flexShrink: 0 }}
        >
          Path to my network
        </Link>
      </div>

      {p.summary ? <p style={{ color: "var(--text-soft)", maxWidth: 720 }}>{p.summary}</p> : null}

      <div className="grid cols-2" style={{ marginTop: 22 }}>
        <div className="card">
          <h3>Skills</h3>
          {p.skills.length === 0 ? (
            <div className="muted">No skills recorded.</div>
          ) : (
            p.skills.map((s) => {
              const pct = Math.round((s.proficiency / 5) * 100);
              return (
                <div className="skill-bar-wrap" key={s.skill}>
                  <div className="skill-row">
                    <span className="skill-name">{s.skill}</span>
                    <span className="muted">{s.proficiency}/5</span>
                  </div>
                  <div className="skill-bar">
                    <span style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="card">
          <h3>Career history</h3>
          {p.history.length === 0 ? (
            <div className="muted">No past roles recorded. {p.company ? "Currently at " + p.company + "." : ""}</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {p.company ? (
                <div>
                  <div style={{ fontWeight: 650 }}>{p.title}</div>
                  <div style={{ color: "var(--text-soft)", fontSize: "0.88rem" }}>
                    <Link to={`/companies/${encodeURIComponent(p.companyId)}`}>{p.company}</Link> · present
                  </div>
                </div>
              ) : null}
              {p.history.map((h) => (
                <div key={`${h.companyId}-${h.from}-${h.to}`}>
                  <div style={{ fontWeight: 600, fontSize: "0.92rem" }}>{h.role}</div>
                  <div style={{ color: "var(--text-soft)", fontSize: "0.88rem" }}>
                    <Link to={`/companies/${encodeURIComponent(h.companyId)}`}>{h.company}</Link> · {h.from}–{h.to}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 22 }}>
        <h3>Direct connections ({p.connections.length})</h3>
        {p.connections.length === 0 ? (
          <div className="muted">No direct connections yet.</div>
        ) : (
          <div className="grid cols-2">
            {p.connections.map((c) => (
              <PersonCard
                key={c.id}
                person={{ ...c, avatarColor: undefined }}
                subtitle={`strength ${c.strength}/5`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}