import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api.js";
import { useFetch } from "../hooks.js";
import { PersonPicker } from "../components/PersonPicker.jsx";
import { PersonCard } from "../components/PersonCard.jsx";
import { Loading, EmptyState, ErrorState } from "../components/States.jsx";
import { usePersona } from "../App.jsx";
import { IconStrength } from "../components/Icons.jsx";

export default function Introductions() {
  const [params] = useSearchParams();
  const { persona } = usePersona();

  const [me, setMe] = useState(params.get("me") || persona);
  const [target, setTarget] = useState(params.get("target") || "");

  useEffect(() => {
    if (!params.get("me")) setMe(persona);
  }, [params, persona]);

  const ready = Boolean(me && target && me !== target);
  const { data, loading, error, reload } = useFetch(
    () =>
      ready
        ? api(`/network/introducers?from=${encodeURIComponent(me)}&to=${encodeURIComponent(target)}`)
        : Promise.resolve([]),
    [ready, me, target]
  );

  return (
    <div>
      <div className="page-head">
        <h1>Get introduced</h1>
        <p className="sub">
          A two-hop pattern match: people <em>you</em> know who also know your target. In SQL this is a self-join on a
          friendship table twice — here it&rsquo;s one line of Cypher.
        </p>
      </div>

      <div className="card" style={{ maxWidth: 760 }}>
        <div className="grid cols-2">
          <PersonPicker label="You" value={me} onChange={setMe} placeholder="Yourself…" />
          <PersonPicker label="You want to reach" value={target} onChange={setTarget} placeholder="Target person…" />
        </div>
      </div>

      <div style={{ height: 18 }} />

      {!ready ? (
        <EmptyState
          emoji="🤝"
          title="Who do you want to reach?"
          detail="Pick yourself and a target, and Connecto will list everyone who can make the warm intro."
        />
      ) : loading ? (
        <Loading label="Finding introductions…" />
      ) : error ? (
        <ErrorState
          title={error.payload?.error === "database_unavailable" ? "Database unreachable" : "Couldn't find introductions"}
          message={error.message}
          onRetry={reload}
        />
      ) : data.length === 0 ? (
        <EmptyState
          emoji="🧊"
          title="No direct introducer found"
          detail="Nobody you know directly also knows them — try the path explorer for a longer chain."
        />
      ) : (
        <div className="card">
          <h3>
            {data.length} possible introducer{data.length > 1 ? "s" : ""}
          </h3>
          <p className="muted" style={{ marginBottom: 14 }}>
            Ranked by combined relationship strength (how well they know you + how well they know the target).
          </p>
          <div className="grid cols-2">
            {data.map((i) => (
              <PersonCard
                key={i.id}
                person={{ ...i, avatarColor: undefined }}
                right={
                  <span className="badge neutral" title="Combined strength">
                    <IconStrength style={{ width: 12, height: 12 }} />
                    {i.strengthToMe} + {i.strengthToTarget}
                  </span>
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}