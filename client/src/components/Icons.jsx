/** Minimal inline icon set — stroke-based, inherits currentColor. */

const S = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const IconDashboard = (p) => (
  <svg {...S} viewBox="0 0 24 24" {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

export const IconPeople = (p) => (
  <svg {...S} viewBox="0 0 24 24" {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.4a3.2 3.2 0 0 1 0 5.2" />
    <path d="M17.5 14.3a5.5 5.5 0 0 1 3 5.7" />
  </svg>
);

export const IconPath = (p) => (
  <svg {...S} viewBox="0 0 24 24" {...p}>
    <circle cx="5" cy="18" r="2.1" />
    <circle cx="19" cy="6" r="2.1" />
    <circle cx="12" cy="12" r="2.1" />
    <path d="M12 12 5 18M12 12 19 6" />
  </svg>
);

export const IconHandshake = (p) => (
  <svg {...S} viewBox="0 0 24 24" {...p}>
    <path d="m11 7-5.7 5.7c-.6.6-.6 1.6 0 2.2l3.6 3.6c.6.6 1.6.6 2.2 0l2.2-2.2" />
    <path d="M6.5 17 3 20.5M17.5 7l3.2-1.8-2.4-2.4L16.4 6M12.6 14.6l1.4 1.4 5.4-5.4c.6-.6.6-1.6 0-2.2L17.9 7" />
  </svg>
);

export const IconSearch = (p) => (
  <svg {...S} viewBox="0 0 24 24" {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-3.8-3.8" />
  </svg>
);

export const IconCompany = (p) => (
  <svg {...S} viewBox="0 0 24 24" {...p}>
    <path d="M3 21h18M5 21V7l7-4 7 4v14" />
    <path d="M9 9h.01M9 13h.01M9 17h.01M15 9h.01M15 13h.01M15 17h.01" />
  </svg>
);

export const IconWallet = (p) => (
  <svg {...S} viewBox="0 0 24 24" {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
    <path d="M16 12h1" />
  </svg>
);

export const IconStrength = (p) => (
  <svg {...S} viewBox="0 0 24 24" {...p}>
    <path d="M12 3v18M12 3 8 7M12 3l4 4M12 21l-4-4M12 21l4-4" />
  </svg>
);

export const IconHop = (p) => (
  <svg {...S} viewBox="0 0 24 24" {...p}>
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="6" r="2" />
    <path d="M18 6v5a3 3 0 0 1-3 3h-6a3 3 0 0 0-3 3" />
  </svg>
);

export const IconSpark = (p) => (
  <svg {...S} viewBox="0 0 24 24" {...p}>
    <path d="M12 3l1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9Z" />
    <path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8Z" />
  </svg>
);

export const IconLink = (p) => (
  <svg {...S} viewBox="0 0 24 24" {...p}>
    <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
    <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
  </svg>
);