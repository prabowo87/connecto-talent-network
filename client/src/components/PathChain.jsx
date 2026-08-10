import { Link } from "react-router-dom";
import { Avatar } from "./Avatar.jsx";

function NodeChip({ node }) {
  return (
    <div className="path-node">
      <Link to={`/people/${encodeURIComponent(node.id)}`}>
        <Avatar name={node.name} color={node.avatarColor} size="lg" />
      </Link>
      <div style={{ fontWeight: 600, fontSize: "0.84rem", marginTop: 6 }}>
        <Link to={`/people/${encodeURIComponent(node.id)}`}>{node.name}</Link>
      </div>
      <div className="sub" style={{ fontSize: "0.72rem", color: "var(--muted)", lineHeight: 1.3 }}>
        {node.title || ""}
      </div>
    </div>
  );
}

function Connector({ degree }) {
  return (
    <div className="path-connector" style={{ marginTop: 34 }}>
      <div className="step-badge">
        Hop {degree}
      </div>
      <div
        style={{
          width: "46px",
          height: "2px",
          background: "var(--accent)",
          opacity: 0.5,
          margin: "0 6px",
        }}
      />
    </div>
  );
}

/** Visualise a shortest-path chain of people as nodes joined by edges. */
export function PathChain({ path }) {
  if (!path || path.length === 0) return null;
  return (
    <div className="path-wrap">
      <div className="path-box">
        {path.map((node, i) => (
          <div key={node.id} style={{ display: "flex", alignItems: "flex-start" }}>
            {i > 0 ? <Connector degree={i} /> : null}
            <NodeChip node={node} />
          </div>
        ))}
      </div>
    </div>
  );
}