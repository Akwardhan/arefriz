"use client"

import { useState } from "react"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useRedirectIfAuth } from "@/lib/useRedirectIfAuth"

const BULLETS = [
  "Genuine Parts Only",
  "Verified Suppliers",
  "Fast Procurement",
]

const inputCls = `
  h-12 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-900
  outline-none placeholder:text-gray-400
  transition-all duration-200
  hover:border-gray-300
  focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:scale-[1.01]
`.trim()

export default function RegisterPage() {
  useRedirectIfAuth()
  const [name,     setName]     = useState("")
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Register clicked")
    try {
      const res = await fetch("http://localhost:5001/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      console.log("Response:", data)
      if (res.ok) {
        alert("Registered successfully")
        window.location.href = "/login"
      } else {
        alert(data.message ?? "Registration failed")
      }
    } catch (err) {
      console.error(err)
      alert("Error registering")
    }
  }

  return (
    <div className="flex min-h-screen">

      {/* ── Left ── */}
      <div className="relative hidden w-[60%] flex-col justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-20 lg:flex">

        {/* Glow */}
        <div className="pointer-events-none absolute left-[-100px] top-[-100px] h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

        {/* Logo */}
        <div className="absolute left-20 top-10">
          <p className="text-lg font-semibold tracking-tight text-white">ARefriz</p>
          <p className="mt-0.5 text-xs text-slate-400">Industrial Parts Marketplace</p>
        </div>

        {/* Content */}
        <div className="relative max-w-lg" style={{ animation: "fadeUp 500ms ease both" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            ARefriZ Platform
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white">
            Find the Right Part,<br />Instantly.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-gray-300">
            A smarter way to source refrigeration and HVAC components — built for procurement teams that need speed and accuracy.
          </p>

          <div className="mt-6 space-y-2">
            {BULLETS.map((point, i) => (
              <div
                key={point}
                className="flex items-center gap-3"
                style={{ animation: "fadeUp 500ms ease both", animationDelay: `${200 + i * 100}ms` }}
              >
                <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-400" strokeWidth={2} />
                <span className="text-sm font-medium text-gray-400">{point}</span>
              </div>
            ))}
          </div>

          {/* Trust */}
          <div
            className="mt-10"
            style={{ animation: "fadeUp 500ms ease both", animationDelay: "600ms" }}
          >
            <div className="h-px w-16 bg-slate-700" />
            <p className="mt-4 text-sm font-medium text-slate-300">Trusted by industrial buyers</p>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400/60" />
              <p className="text-xs text-slate-500">Procurement teams across HVAC & refrigeration</p>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400/60" />
              <p className="text-xs text-slate-500">Verified supplier network</p>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0);    }
          }
        `}</style>
      </div>

      {/* ── Right ── */}
      <div className="flex w-full flex-col items-center justify-center bg-slate-50 px-6 lg:w-[40%]">
        <div
          className="w-full max-w-[400px] rounded-2xl bg-white p-8 shadow-xl"
          style={{ animation: "fadeUp 400ms ease both", animationDelay: "100ms" }}
        >

          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900">Create an account</h2>
            <p className="mt-1.5 text-sm text-gray-500">Join the ARefriz marketplace</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputCls}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputCls}
              />
            </div>

            <button
              type="submit"
              className="h-12 w-full rounded-lg bg-black text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.02] hover:bg-gray-900 hover:shadow-lg active:scale-[0.98]"
            >
              Register
            </button>

          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-gray-900 hover:underline">
              Login
            </Link>
          </p>

        </div>
      </div>

    </div>
  )
}
