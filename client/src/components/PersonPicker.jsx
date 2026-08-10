import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api.js";
import { Avatar } from "./Avatar.jsx";

/**
 * Combobox for picking a person. Loads the full (small) people list once and
 * filters locally, so the graph stays snappy even when typing.
 */
export function PersonPicker({ value, onChange, placeholder = "Search people…", label }) {
  const [people, setPeople] = useState([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [hl, setHl] = useState(0);
  const rootRef = useRef(null);

  useEffect(() => {
    api("/people?limit=300")
      .then(setPeople)
      .catch(() => {});
  }, []);

  const selected = value ? people.find((p) => p.id === value) : null;

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return people.slice(0, 50);
    return people
      .filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.title || "").toLowerCase().includes(q) ||
          (p.company || "").toLowerCase().includes(q) ||
          (p.location || "").toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [people, query]);

  useEffect(() => {
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const pick = (p) => {
    onChange(p.id);
    setQuery("");
    setOpen(false);
  };

  return (
    <div className="field" style={{ marginBottom: 0 }}>
      {label ? (
        <span className="label" style={{ marginBottom: 6 }}>{label}</span>
      ) : null}
      <div className="picker" ref={rootRef}>
        {selected ? (
          <div className="picker-option" onClick={() => setOpen((o) => !o)}>
            <Avatar name={selected.name} color={selected.avatarColor} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: "0.93rem" }}>{selected.name}</div>
              <div className="sub" style={{ width: "190px" }}>
                {selected.title}
              </div>
            </div>
            <span className="caret">▾</span>
          </div>
        ) : (
          <input
            className="input"
            placeholder={placeholder}
            value={query}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (!open) setOpen(true);
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setHl((h) => Math.min(h + 1, matches.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setHl((h) => Math.max(h - 1, 0));
              } else if (e.key === "Enter" && matches[hl]) {
                e.preventDefault();
                pick(matches[hl]);
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              setHl(0);
              setOpen(true);
            }}
          />
        )}

        {open ? (
          <div className="picker-menu">
            {matches.length === 0 ? (
              <div className="picker-empty">No matching people.</div>
            ) : (
              matches.map((p, i) => (
                <div
                  key={p.id}
                  className={`picker-option ${i === hl ? "hl" : ""}`}
                  onMouseEnter={() => setHl(i)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(p);
                  }}
                >
                  <Avatar name={p.name} color={p.avatarColor} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 550, fontSize: "0.9rem" }}>{p.name}</div>
                    <div className="sub">
                      {[p.title, p.company, p.location].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}