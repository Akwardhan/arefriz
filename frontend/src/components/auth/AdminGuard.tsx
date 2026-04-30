"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

function getRole(): string | null {
  // 1. Explicit "role" key saved by login page
  const role = localStorage.getItem("role")
  if (role) return role

  // 2. Serialised user object {"role":"admin",...}
  try {
    const user = JSON.parse(localStorage.getItem("user") ?? "null")
    if (user?.role) return String(user.role)
  } catch { /* ignore */ }

  // 3. Decode JWT payload — handles role / userType / type / isAdmin
  try {
    const token = localStorage.getItem("token")
    if (token) {
      const payload = JSON.parse(atob(token.split(".")[1]))
      if (payload.role)     return String(payload.role)
      if (payload.userType) return String(payload.userType)
      if (payload.type)     return String(payload.type)
      if (payload.isAdmin === true) return "admin"
    }
  } catch { /* ignore */ }

  return null
}

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<"checking" | "allowed" | "denied">("checking")

  useEffect(() => {
    const token = localStorage.getItem("token")

    if (!token) {
      setState("denied")
      router.replace("/login?redirect=/admin")
      return
    }

    const role = getRole()
    if (role?.toLowerCase() !== "admin") {
      localStorage.removeItem("token")
      localStorage.removeItem("role")
      setState("denied")
      router.replace("/login?redirect=/admin")
      return
    }

    setState("allowed")
  }, [router])

  if (state === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#F8FAFC" }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: "#E2E8F0", borderTopColor: "#4F46E5" }}
          />
          <p className="text-sm" style={{ color: "#94A3B8" }}>Verifying access…</p>
        </div>
      </div>
    )
  }

  if (state === "denied") return null

  return <>{children}</>
}
