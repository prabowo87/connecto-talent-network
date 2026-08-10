import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import { api } from "./api.js";
import { useDbHealth } from "./hooks.js";
import {
  IconCompany,
  IconDashboard,
  IconHandshake,
  IconPath,
  IconPeople,
  IconSearch,
  IconSpark,
} from "./components/Icons.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import People from "./pages/People.jsx";
import Person from "./pages/Person.jsx";
import Paths from "./pages/Paths.jsx";
import Introductions from "./pages/Introductions.jsx";
import Recommendations from "./pages/Recommendations.jsx";
import Companies from "./pages/Companies.jsx";
import Company from "./pages/Company.jsx";

const PersonaContext = createContext({ persona: null, setPersona: () => {} });
export const usePersona = () => useContext(PersonaContext);

const DEFAULT_PERSONA = "aisha-rahman";

const NAV = [
  { to: "/", label: "Overview", icon: IconDashboard, end: true },
  { to: "/people", label: "People", icon: IconPeople },
  { to: "/paths", label: "Find a path", icon: IconPath },
  { to: "/introductions", label: "Get introduced", icon: IconHandshake },
  { to: "/recommendations", label: "Candidate search", icon: IconSearch },
  { to: "/companies", label: "Companies", icon: IconCompany },
];

function Sidebar({ personaName }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round">
            <circle cx="5" cy="19" r="2.4" />
            <circle cx="19" cy="6" r="2.4" />
            <circle cx="12" cy="12" r="2.4" />
            <path d="M12 12 5 19M12 12 19 6" />
          </svg>
        </div>
        <div>
          <div className="brand-name">Connecto</div>
          <div className="brand-tag">Talent network · graph</div>
        </div>
      </div>

      <nav className="nav">
        <div className="nav-label">Explore</div>
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? "active" : "")}>
            <Icon className="icon" />
            {label}
          </NavLink>
        ))}
        <div className="nav-label">Tools</div>
        <NavLink to="/recommendations" className={({ isActive }) => (isActive ? "active" : "")}>
          <IconSpark className="icon" />
          Hire smarter
        </NavLink>
      </nav>

      <div className="sidebar-foot">
        You appear as <strong>{personaName || "…"}</strong> across the app.
      </div>
    </aside>
  );
}

export default function App() {
  const [persona, setPersona] = useState(
    () => localStorage.getItem("connecto-persona") || DEFAULT_PERSONA
  );
  const [personaPeople, setPersonaPeople] = useState([]);
  const health = useDbHealth();

  useEffect(() => {
    localStorage.setItem("connecto-persona", persona);
  }, [persona]);

  useEffect(() => {
    api("/people?limit=300")
      .then(setPersonaPeople)
      .catch(() => {});
  }, []);

  const personaName = personaPeople.find((p) => p.id === persona)?.name || persona;

  const value = useMemo(
    () => ({ persona, setPersona, personaPeople, setPersonaPeople }),
    [persona, personaPeople]
  );

  return (
    <PersonaContext.Provider value={value}>
      <div className="app">
        <Sidebar personaName={personaName} />

        <div className="main">
          {health === false ? (
            <div className="health-banner down" role="alert">
              <span className="dot warn" />
              <strong>Database offline.</strong>
              <span>
                The graph database isn&rsquo;t reachable — pages will show errors until the instance is back. Check
                your .env connection details and that the CognoDB instance is running.
              </span>
            </div>
          ) : health === null ? (
            <div className="health-banner down">
              <span className="dot warn" /> Checking connection…
            </div>
          ) : (
            <div className="health-banner ok">
              <span className="dot ok" />
              Connected to the graph database.
            </div>
          )}

          <div className="main-inner">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/people" element={<People />} />
              <Route path="/people/:id" element={<Person />} />
              <Route path="/paths" element={<Paths />} />
              <Route path="/introductions" element={<Introductions />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="/companies" element={<Companies />} />
              <Route path="/companies/:id" element={<Company />} />
              <Route path="*" element={<div className="state">Page not found.</div>} />
            </Routes>
          </div>
        </div>
      </div>
    </PersonaContext.Provider>
  );
}