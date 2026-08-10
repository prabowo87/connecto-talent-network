import { useCallback, useEffect, useRef, useState } from "react";
import { checkDbHealth } from "./api.js";

/**
 * Small data-fetching hook: returns { data, loading, error, reload }.
 * `fn` must be a stable or memoised function that returns a Promise.
 */
export function useFetch(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [tick, setTick] = useState(0);
  const fnRef = useRef(fn);

  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fnRef
      .current()
      .then((data) => !cancelled && setState({ data, loading: false, error: null }))
      .catch((error) => !cancelled && setState({ data: null, loading: false, error }));
    return () => {
      cancelled = true;
    };
  }, [...deps, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { ...state, reload };
}

/**
 * Tracks whether the CognoDB instance is reachable, polling lightly so the
 * banner recovers automatically when the instance comes back online.
 */
export function useDbHealth(intervalMs = 15000) {
  const [ok, setOk] = useState(null); // null = checking

  useEffect(() => {
    let mounted = true;

    const poll = async () => {
      const healthy = await checkDbHealth();
      if (mounted) setOk(healthy);
    };

    poll();
    const id = setInterval(poll, intervalMs);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [intervalMs]);

  return ok;
}