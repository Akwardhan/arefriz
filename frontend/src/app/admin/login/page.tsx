"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Sparkles } from "lucide-react"
import { BASE_URL } from "@/lib/config"

function decodeRole(token: string): string | null {
  try {
    const base64url = token.split(".")[1]
    const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/")
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4)
    const payload = JSON.parse(atob(padded))
    return payload.role ?? null
  } catch {
    return null
  }
}

export default function AdminLoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res  = await fetch(`${BASE_URL}/api/auth/login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message ?? "Login failed")
        return
      }

      const role = decodeRole(data.token) ?? data.user?.role
      if (role?.toLowerCase() !== "admin") {
        setError("Access denied — not an admin account")
        return
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("user",  JSON.stringify(data.user))
      router.replace("/admin")
    } catch {
      setError("Could not connect to server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)",
              boxShadow: "0 4px 20px rgba(79,70,229,0.5)",
            }}
          >
            <Sparkles className="h-6 w-6 text-white" strokeWidth={2} />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold tracking-tight text-white">Admin Console</p>
            <p className="text-sm text-slate-400">ARefriz</p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <form onSubmit={handleLogin} className="space-y-4">

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="h-11 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 h-11 w-full rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)",
                boxShadow: "0 2px 12px rgba(79,70,229,0.4)",
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

          </form>
        </div>

      </div>
    </div>
  )
}
