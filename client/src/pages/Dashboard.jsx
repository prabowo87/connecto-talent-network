import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useFetch } from "../hooks.js";
import { usePersona } from "../App.jsx";
import { PersonPicker } from "../components/PersonPicker.jsx";
import { Loading, ErrorState } from "../components/States.jsx";
import { Avatar } from "../components/Avatar.jsx";
import {
  IconCompany,
  IconHandshake,
  IconHop,
  IconPath,
  IconPeople,
  IconSearch,
  IconSpark,
} from "../components/Icons.jsx";

const STATS = [
  { key: "people", label: "People", icon: IconPeople },
  { key: "connections", label: "Connections", icon: IconHop },
  { key: "companies", label: "Companies", icon: IconCompany },
  { key: "skills", label: "Skills", icon: IconSpark },
];

export default function Dashboard() {
  const { persona, setPersona, personaPeople } = usePersona();
  const { data, loading, error, reload } = useFetch(() => api("/stats"), []);

  const stats = data?.counts;

  return (
    <div>
      <div className="page-head">
        <h1>Your talent network, as a graph</h1>
        <p className="sub">
          Connecto models professionals, their skills, employers and — most importantly — who knows whom. Answer
          questions that join-tables dread: who can introduce me to anyone, how close am I to someone, and whose
          network should I hire next.
        </p>
      </div>

      <div className="persona-bar">
        <div className="who">
          You&rsquo;re browsing as <strong>{personaPeople.find((p) => p.id === persona)?.name || persona}</strong>
        </div>
        <div style={{ width: 250 }}>
          <PersonPicker value={persona} onChange={setPersona} label="Switch persona" />
        </div>
      </div>

      {loading ? (
        <Loading label="Loading graph overview…" />
      ) : error ? (
        <ErrorState
          title={error.payload?.error === "database_unavailable" ? "Database unreachable" : "Couldn't load data"}
          message={error.message}
          onRetry={reload}
        />
      ) : (
        <>
          <div className="grid cols-4" style={{ marginBottom: 22 }}>
            {STATS.map(({ key, label, icon: Icon }) => (
              <div className="card stat-card" key={key}>
                <div className="stat-icon">
                  <Icon style={{ width: 20, height: 20 }} />
                </div>
                <div>
                  <div className="stat-value">{Number(stats?.[key] ?? 0).toLocaleString()}</div>
                  <div className="stat-label">{label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid cols-2" style={{ marginBottom: 22 }}>
            <div className="card">
              <h3>Most connected people</h3>
              <p className="muted" style={{ marginBottom: 14 }}>
                Degree centrality — the number of KNOWS relationships.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {data.topConnected.map((p, i) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ width: 18, fontWeight: 700, color: "var(--muted)" }}>{i + 1}</span>
                    <Avatar name={p.name} color="#6366f1" />
                    <Link to={`/people/${encodeURIComponent(p.id)}`} style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {p.name}
                      </div>
                      <div className="muted" style={{ fontSize: "0.78rem" }}>{p.title}</div>
                    </Link>
                    <span className="badge">{p.connections} connections</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3>Most in-demand skills</h3>
              <p className="muted" style={{ marginBottom: 14 }}>Shared across the most people in the network.</p>
              <div>
                {data.topSkills.map((s) => {
                  const max = data.topSkills[0].peopleWithSkill;
                  return (
                    <div className="skill-bar-wrap" key={s.skill}>
                      <div className="skill-row">
                        <span className="skill-name">{s.skill}</span>
                        <span className="muted">{s.peopleWithSkill} people</span>
                      </div>
                      <div className="skill-bar">
                        <span style={{ width: `${(s.peopleWithSkill / max) * 100}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Explore the network</h3>
            <div className="quick-nav">
              <Link to="/paths">
                <IconPath style={{ width: 22, height: 22, color: "var(--accent)" }} />
                <div>
                  <div className="t">Find the shortest path</div>
                  <div className="d">Degrees of separation between two people, up to 6 hops.</div>
                </div>
              </Link>
              <Link to="/introductions">
                <IconHandshake style={{ width: 22, height: 22, color: "var(--accent)" }} />
                <div>
                  <div className="t">Get introduced to anyone</div>
                  <div className="d">See which mutual contacts can make a warm intro in two hops.</div>
                </div>
              </Link>
              <Link to="/recommendations">
                <IconSearch style={{ width: 22, height: 22, color: "var(--accent)" }} />
                <div>
                  <div className="t">Search candidates for a role</div>
                  <div className="d">Rank candidates by skill match and their distance from the hiring manager.</div>
                </div>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}