import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useFetch } from "../hooks.js";
import { PersonPicker } from "../components/PersonPicker.jsx";
import { Loading, EmptyState, ErrorState } from "../components/States.jsx";
import { Avatar } from "../components/Avatar.jsx";
import { usePersona } from "../App.jsx";

const ROLES = [
  {
    id: "fullstack",
    name: "Senior Full-Stack Engineer",
    skills: ["React", "Node.js", "TypeScript"],
    desc: "Owns features end-to-end and can chop it down the middle.",
  },
  {
    id: "platform",
    name: "Platform / DevOps Engineer",
    skills: ["Kubernetes", "Terraform", "AWS", "CI/CD"],
    desc: "Keeps the platform boring so the product can be exciting.",
  },
  {
    id: "data",
    name: "Data Engineer",
    skills: ["Python", "Data Engineering", "PostgreSQL"],
    desc: "Builds the pipelines everyone else depends on.",
  },
  {
    id: "ml",
    name: "ML Engineer",
    skills: ["Python", "Machine Learning", "Data Engineering"],
    desc: "Turns models into products that stay honest offline.",
  },
];

function SkillChips({ skills }) {
  return (
    <span style={{ display: "inline-flex", gap: 4, flexWrap: "wrap" }}>
      {skills.map((s) => (
        <span className="chip" key={s}>
          {s}
        </span>
      ))}
    </span>
  );
}

export default function Recommendations() {
  const { persona } = usePersona();
  const [manager, setManager] = useState(persona);
  const [role, setRole] = useState(ROLES[0]);

  const ready = Boolean(manager) && Boolean(role);
  const { data, loading, error, reload } = useFetch(
    () =>
      ready
        ? api(
            `/recommendations?managerId=${encodeURIComponent(manager)}&skills=${encodeURIComponent(role.skills.join(","))}`
          )
        : Promise.resolve([]),
    [ready, manager, role && role.id, role && role.skills.join(",")]
  );

  return (
    <div>
      <div className="page-head">
        <h1>Candidate search</h1>
        <p className="sub">
          Rank people for an open role by how well their skills match <strong>and</strong> how close they sit to the
          hiring manager&rsquo;s network. The two-closest-to-you candidate is worth a lot more than an identical CV
          sitting outside your reach — that&rsquo;s the graph working.
        </p>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="grid cols-2" style={{ marginBottom: 18 }}>
          <PersonPicker label="Hiring manager" value={manager} onChange={setManager} placeholder="Manager…" />
          <div>
            <span className="label">Open role</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ROLES.map((r) => (
                <div
                  key={r.id}
                  className={`job-card ${role && role.id === r.id ? "active" : ""}`}
                  onClick={() => setRole(r)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setRole(r)}
                >
                  <div>
                    <div style={{ fontWeight: 650, fontSize: "0.92rem" }}>{r.name}</div>
                    <div className="muted" style={{ fontSize: "0.8rem" }}>{r.desc}</div>
                  </div>
                  <SkillChips skills={r.skills} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <p className="muted" style={{ marginBottom: 0 }}>
          Required skills: <b>{role.skills.join(", ")}</b>. Candidates are ranked by skill matches, then by hops of
          separation to the manager.
        </p>
      </div>

      {loading ? (
        <Loading label="Scanning the network for candidates…" />
      ) : error ? (
        <ErrorState
          title={error.payload?.error === "database_unavailable" ? "Database unreachable" : "Couldn't search candidates"}
          message={error.message}
          onRetry={reload}
        />
      ) : !data || data.length === 0 ? (
        <EmptyState
          emoji="🎯"
          title="No candidates matched"
          detail={`Nobody in the graph holds ${role.skills.join(", ")}. Try a broader role.`}
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {data.map((c) => {
            const reachable = c.hops !== null && c.hops !== undefined;
            return (
              <div className="card" key={c.id} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <Avatar name={c.name} color="#6366f1" size="lg" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <Link to={`/people/${encodeURIComponent(c.id)}`} style={{ fontWeight: 700 }}>
                      {c.name}
                    </Link>
                    <span className="badge">{c.matchedSkills} skill{c.matchedSkills > 1 ? "s" : ""} matched</span>
                    {reachable ? (
                      <span className="badge green">in reach · {c.hops} hop{c.hops > 1 ? "s" : ""} from manager</span>
                    ) : (
                      <span className="badge grey">outside manager&rsquo;s 4-hop network</span>
                    )}
                  </div>
                  <div className="muted" style={{ fontSize: "0.85rem", marginTop: 4 }}>
                    {[c.title, c.company, c.location].filter(Boolean).join(" · ")}
                  </div>
                  <div style={{ marginTop: 10 }}>
                    <SkillChips skills={c.has} />
                  </div>
                  {reachable && c.route && c.route.length > 0 ? (
                    <div style={{ marginTop: 10 }}>
                      {c.route.map((n) => (
                        <span className="route-pill" key={n.id}>
                          {n.name}
                        </span>
                      ))}
                    </div>
                  ) : reachable ? (
                    <div className="muted" style={{ marginTop: 10, fontSize: "0.82rem" }}>
                      Directly connected to the manager.
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}