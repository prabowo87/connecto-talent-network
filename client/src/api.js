export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

/** Thin fetch wrapper for the backend. Throws ApiError with a friendly message. */
export async function api(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let payload = null;
    try {
      payload = await res.json();
    } catch {
      /* not json */
    }
    throw new ApiError(
      (payload && payload.message) || `Request failed (HTTP ${res.status}).`,
      res.status,
      payload
    );
  }

  if (res.status === 204) return null;
  return res.json();
}

export async function checkDbHealth() {
  try {
    const res = await api("/health");
    return res.ok;
  } catch {
    return false;
  }
}