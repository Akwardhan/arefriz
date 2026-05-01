"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

function decodeAdminRole(): string | null {
  try {
    const token = sessionStorage.getItem("adminToken")
    if (!token) return null
    const payload = JSON.parse(atob(token.split(".")[1]))
    if (payload.role)             return String(payload.role)
    if (payload.userType)         return String(payload.userType)
    if (payload.type)             return String(payload.type)
    if (payload.isAdmin === true) return "admin"
    return null
  } catch {
    return null
  }
}

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<"checking" | "allowed" | "denied">("checking")

  useEffect(() => {
    const token = sessionStorage.getItem("adminToken")

    if (!token) {
      setState("denied")
      router.replace("/admin/login")
      return
    }

    const role = decodeAdminRole()
    if (role?.toLowerCase() !== "admin") {
      sessionStorage.removeItem("adminToken")
      setState("denied")
      router.replace("/admin/login")
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
