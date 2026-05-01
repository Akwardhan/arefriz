export function userAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {}
  const token = localStorage.getItem("userToken")
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export function adminAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {}
  const token = sessionStorage.getItem("adminToken")
  return token ? { Authorization: `Bearer ${token}` } : {}
}
