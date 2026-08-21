/**
 * Simulated authentication layer for the Founder Portal.
 *
 * This is intentionally client-side and non-cryptographic — it exists to
 * demonstrate the protected-route pattern (guarded layout + redirect) that
 * a real deployment would back with NextAuth / Clerk / a session cookie
 * validated on the server.
 */

const SESSION_KEY = "aarga_portal_session";

export function signIn(email) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ email, signedInAt: Date.now() })
  );
}

export function signOut() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
