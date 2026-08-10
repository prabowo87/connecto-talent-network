export function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({ name, color, size, className = "" }) {
  return (
    <span
      className={`avatar ${size || ""} ${className}`}
      style={{ background: color || "#6366f1" }}
      aria-hidden="true"
    >
      {initials(name || "?")}
    </span>
  );
}