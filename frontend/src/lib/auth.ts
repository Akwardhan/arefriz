/**
 * Returns an Authorization header object if a token is stored,
 * otherwise returns an empty object. Safe to spread into fetch headers.
 */
export function authHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {}
  const token = localStorage.getItem("token")
  return token ? { Authorization: `Bearer ${token}` } : {}
}
