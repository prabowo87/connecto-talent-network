import { Link } from "react-router-dom";
import { Avatar } from "./Avatar.jsx";

export function PersonCard({ person, subtitle, right }) {
  const name = person.name || person.id;
  return (
    <div className="person-card">
      <Avatar name={name} color={person.avatarColor} />
      <div className="who">
        <Link className="name" to={`/people/${encodeURIComponent(person.id)}`}>
          {name}
        </Link>
        <div className="title">{person.title || "\u00a0"}</div>
        <div className="meta">
          {person.company ? <span>{person.company}</span> : person.location ? <span>{person.location}</span> : null}
          {subtitle ? ` · ${subtitle}` : ""}
        </div>
      </div>
      {right ? <div className="kv" style={{ marginLeft: "auto" }}>{right}</div> : null}
    </div>
  );
}