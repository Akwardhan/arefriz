"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

function decodeDealerRole(): string | null {
  try {
    const token = sessionStorage.getItem("dealerToken")
    if (!token) return null
    const payload = JSON.parse(atob(token.split(".")[1]))
    return payload.role ?? payload.userType ?? payload.type ?? null
  } catch {
    return null
  }
}

export default function DealerProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<"checking" | "allowed" | "denied">("checking")

  useEffect(() => {
    const token = sessionStorage.getItem("dealerToken")

    if (!token) {
      setState("denied")
      router.replace("/dealer/login")
      return
    }

    const role = decodeDealerRole()
    if (role?.toLowerCase() !== "dealer") {
      sessionStorage.removeItem("dealerToken")
      sessionStorage.removeItem("dealer")
      setState("denied")
      router.replace("/dealer/login")
      return
    }

    setState("allowed")
  }, [router])

  if (state === "checking") {
    return (
      <div style={{
        display: "flex", minHeight: "100vh",
        alignItems: "center", justifyContent: "center",
        background: "#F0FDF4",
      }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            border: "2px solid #D1FAE5", borderTopColor: "#10b981",
            animation: "spin 0.8s linear infinite",
          }} />
          <p style={{ fontSize: "14px", color: "#6B7280" }}>Verifying access…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (state === "denied") return null

  return <>{children}</>
}
