export const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

// auth_time is signed by Firebase and does not advance when an ID token refreshes.
export function sessionRemainingMs(authTime, now = Date.now()) {
  if (typeof authTime !== 'number' || !Number.isFinite(authTime) || authTime <= 0 || authTime * 1000 > now + 60_000) return 0;
  return Math.max(0, Math.min(SESSION_MAX_AGE_MS, authTime * 1000 + SESSION_MAX_AGE_MS - now));
}
