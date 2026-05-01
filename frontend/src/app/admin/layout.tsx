"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (pathname === "/admin/login") {
      setReady(true)
      return
    }

    try {
      const user = JSON.parse(localStorage.getItem("user") ?? "null")
      if (!user || user.role?.toLowerCase() !== "admin") {
        router.push("/")
        return
      }
    } catch {
      router.push("/")
      return
    }

    setReady(true)
  }, [router, pathname])

  if (!ready) {
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

  return <>{children}</>
}
