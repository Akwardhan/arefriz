"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState("")
  const [password, setPassword] = useState("")
  const [error,    setError]    = useState("")
  const [loading,  setLoading]  = useState(false)
  const [showPw,   setShowPw]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res  = await fetch("http://localhost:5001/api/admin/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message ?? "Login failed")
        return
      }

      localStorage.removeItem("userToken")
      sessionStorage.setItem("adminToken", data.token)
      router.replace("/admin")
    } catch {
      setError("Could not connect to server")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>

      {/* Left panel */}
      <div style={{
        display: "none",
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        padding: "64px",
        position: "relative",
        overflow: "hidden",
      }}
        className="left-panel"
      >
        {/* Glow orbs */}
        <div style={{
          position: "absolute", top: "-80px", left: "-80px",
          width: "360px", height: "360px", borderRadius: "50%",
          background: "rgba(99,102,241,0.15)", filter: "blur(80px)",
        }} />
        <div style={{
          position: "absolute", bottom: "-60px", right: "-60px",
          width: "280px", height: "280px", borderRadius: "50%",
          background: "rgba(139,92,246,0.12)", filter: "blur(60px)",
        }} />

        <div style={{ position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            marginBottom: "48px",
          }}>
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <span style={{ color: "white", fontWeight: 700, fontSize: "18px", letterSpacing: "-0.3px" }}>
              ARefriz Admin
            </span>
          </div>

          <h1 style={{
            fontSize: "42px", fontWeight: 800, color: "white",
            lineHeight: 1.1, letterSpacing: "-1px", marginBottom: "20px",
          }}>
            Control centre<br />
            <span style={{
              background: "linear-gradient(90deg, #818cf8, #c084fc)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              for your platform.
            </span>
          </h1>

          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "16px", lineHeight: 1.7, maxWidth: "340px" }}>
            Manage products, orders, and customer inquiries from one place.
          </p>

          <div style={{ marginTop: "48px", display: "flex", flexDirection: "column", gap: "16px" }}>
            {["Product & inventory management", "Order fulfilment & tracking", "Customer inquiry handling"].map(item => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "20px", height: "20px", borderRadius: "50%",
                  background: "rgba(99,102,241,0.25)", border: "1px solid rgba(99,102,241,0.5)",
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="#818cf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div style={{
        width: "100%",
        maxWidth: "460px",
        margin: "auto",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}>
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "24px",
          padding: "48px 40px",
          backdropFilter: "blur(20px)",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5)",
        }}>

          {/* Logo mark */}
          <div style={{ marginBottom: "36px", textAlign: "center" }}>
            <div style={{
              width: "52px", height: "52px", borderRadius: "16px",
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              marginBottom: "20px",
            }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <p style={{ color: "white", fontWeight: 700, fontSize: "22px", letterSpacing: "-0.4px", margin: 0 }}>
              Admin Console
            </p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "14px", marginTop: "6px" }}>
              Sign in to manage ARefriz
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Email */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{
                color: "rgba(255,255,255,0.5)", fontSize: "12px",
                fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@example.com"
                style={{
                  height: "48px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  padding: "0 16px",
                  color: "white",
                  fontSize: "15px",
                  outline: "none",
                  transition: "border-color 0.2s, box-shadow 0.2s",
                  width: "100%",
                  boxSizing: "border-box",
                }}
                onFocus={e => {
                  e.target.style.borderColor = "rgba(99,102,241,0.7)"
                  e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"
                }}
                onBlur={e => {
                  e.target.style.borderColor = "rgba(255,255,255,0.1)"
                  e.target.style.boxShadow = "none"
                }}
              />
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{
                color: "rgba(255,255,255,0.5)", fontSize: "12px",
                fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
              }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  style={{
                    height: "48px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "0 48px 0 16px",
                    color: "white",
                    fontSize: "15px",
                    outline: "none",
                    transition: "border-color 0.2s, box-shadow 0.2s",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = "rgba(99,102,241,0.7)"
                    e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = "rgba(255,255,255,0.1)"
                    e.target.style.boxShadow = "none"
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position: "absolute", right: "14px", top: "50%",
                    transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(255,255,255,0.3)", padding: "4px",
                    display: "flex", alignItems: "center",
                  }}
                >
                  {showPw ? (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: "10px", padding: "12px 14px",
              }}>
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#f87171" strokeWidth="2" style={{ flexShrink: 0 }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span style={{ color: "#f87171", fontSize: "14px" }}>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "8px",
                height: "50px",
                background: loading
                  ? "rgba(99,102,241,0.5)"
                  : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                border: "none",
                borderRadius: "12px",
                color: "white",
                fontSize: "15px",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                transition: "opacity 0.2s, transform 0.1s",
                boxShadow: loading ? "none" : "0 4px 20px rgba(99,102,241,0.4)",
                width: "100%",
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.9" }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1" }}
              onMouseDown={e => { if (!loading) e.currentTarget.style.transform = "scale(0.98)" }}
              onMouseUp={e => { e.currentTarget.style.transform = "scale(1)" }}
            >
              {loading && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"
                  style={{ animation: "spin 0.8s linear infinite" }}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                </svg>
              )}
              {loading ? "Signing in…" : "Sign in"}
            </button>

          </form>

          <p style={{
            textAlign: "center", marginTop: "28px",
            color: "rgba(255,255,255,0.2)", fontSize: "12px",
          }}>
            Restricted access · Authorised personnel only
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.2); }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (min-width: 900px) {
          .left-panel { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
