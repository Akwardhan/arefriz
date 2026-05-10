"use client"

import { useEffect, useState } from "react"
import { BASE_URL } from "@/lib/config"

interface Dealer {
  _id:         string
  name:        string
  companyName: string
  email:       string
  phone?:      string
  createdAt?:  string
}

const EMPTY = { name: "", companyName: "", email: "", password: "", phone: "" }

export default function AdminDealersPage() {
  const [dealers,  setDealers]  = useState<Dealer[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form,     setForm]     = useState({ ...EMPTY })
  const [saving,   setSaving]   = useState(false)
  const [success,  setSuccess]  = useState("")
  const [error,    setError]    = useState("")
  const [showPw,   setShowPw]   = useState(false)

  useEffect(() => { fetchDealers() }, [])

  async function fetchDealers() {
    const token = sessionStorage.getItem("adminToken")
    if (!token) return
    try {
      const res  = await fetch(`${BASE_URL}/api/admin/dealers`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok || res.status === 204) return
      const data = await res.json()
      setDealers(data?.dealers || data || [])
    } finally {
      setLoading(false)
    }
  }

  function setField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function openForm() {
    setForm({ ...EMPTY })
    setError(""); setSuccess("")
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setError("")
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(""); setSuccess("")

    if (!form.name.trim())        { setError("Name is required.");                        return }
    if (!form.companyName.trim()) { setError("Company name is required.");                return }
    if (!form.email.trim())       { setError("Email is required.");                       return }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return }

    const token = sessionStorage.getItem("adminToken")
    if (!token) return

    setSaving(true)
    try {
      const res  = await fetch(`${BASE_URL}/api/admin/dealers`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({
          name:        form.name.trim(),
          companyName: form.companyName.trim(),
          email:       form.email.trim(),
          password:    form.password,
          phone:       form.phone.trim() || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message ?? "Failed to create dealer."); return }

      const created: Dealer = data.dealer ?? data
      setDealers(prev => [created, ...prev])
      setSuccess(`Dealer "${created.name}" created successfully.`)
      setForm({ ...EMPTY })
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove dealer "${name}"? This cannot be undone.`)) return
    const token = sessionStorage.getItem("adminToken")
    if (!token) return
    await fetch(`${BASE_URL}/api/admin/dealers/${id}`, {
      method:  "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    setDealers(prev => prev.filter(d => d._id !== id))
  }

  const inputCls: React.CSSProperties = {
    height: "42px", width: "100%", padding: "0 12px",
    borderRadius: "10px", border: "1px solid #E2E8F0",
    background: "#F1F5F9", color: "#0F172A",
    fontSize: "14px", outline: "none", boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s",
  }
  const labelCls: React.CSSProperties = {
    display: "block", fontSize: "13px", fontWeight: 600,
    color: "#374151", marginBottom: "6px",
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", padding: "36px 40px", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "32px" }}>
        <div>
          <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94A3B8", marginBottom: "4px" }}>
            Admin Console
          </p>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.025em", margin: 0 }}>
            Dealers
          </h1>
          <p style={{ marginTop: "4px", fontSize: "14px", color: "#64748B" }}>
            Manage supplier companies and their portal access.
          </p>
        </div>

        <button
          onClick={openForm}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            height: "44px", padding: "0 22px", borderRadius: "12px",
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            border: "none", color: "white", fontSize: "14px", fontWeight: 600,
            cursor: "pointer", boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
            transition: "opacity 0.15s",
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "0.88" }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1" }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Dealer
        </button>
      </div>

      {/* ── Dealer list card ─────────────────────────────────────────────────── */}
      <div style={{
        background: "white", borderRadius: "16px", padding: "0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)",
        border: "1px solid #F1F5F9", overflow: "hidden",
      }}>

        {/* Card header */}
        <div style={{
          padding: "20px 28px", borderBottom: "1px solid #F1F5F9",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <h2 style={{ fontSize: "15px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
            Dealer Accounts
          </h2>
          <span style={{
            background: "#EEF2FF", color: "#4F46E5",
            fontSize: "12px", fontWeight: 700, padding: "3px 12px",
            borderRadius: "999px",
          }}>
            {dealers.length} {dealers.length === 1 ? "dealer" : "dealers"}
          </span>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#94A3B8", fontSize: "14px" }}>
            Loading dealers…
          </div>
        ) : dealers.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "14px",
              background: "#F1F5F9", margin: "0 auto 16px",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#94A3B8" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>No dealers yet</p>
            <p style={{ fontSize: "13px", color: "#94A3B8" }}>Click "Add Dealer" to create the first account.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {["Dealer", "Company", "Email", "Phone", "Joined", ""].map(h => (
                  <th key={h} style={{
                    padding: "11px 28px", textAlign: "left",
                    fontSize: "11px", fontWeight: 700, color: "#94A3B8",
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    borderBottom: "1px solid #F1F5F9",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dealers.map((dealer, i) => (
                <tr
                  key={dealer._id}
                  style={{ borderTop: i > 0 ? "1px solid #F8FAFC" : undefined }}
                  onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = "#FAFBFF" }}
                  onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent" }}
                >
                  {/* Name + avatar */}
                  <td style={{ padding: "16px 28px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                        background: "linear-gradient(135deg, #EEF2FF, #E0E7FF)",
                        border: "1px solid #C7D2FE",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#4F46E5", fontSize: "14px", fontWeight: 700,
                      }}>
                        {dealer?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <p style={{ fontSize: "14px", fontWeight: 600, color: "#0F172A", margin: 0 }}>
                        {dealer.name || "Unknown"}
                      </p>
                    </div>
                  </td>

                  {/* Company */}
                  <td style={{ padding: "16px 28px" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: "6px",
                      background: "#F0FDF4", color: "#15803D",
                      fontSize: "12px", fontWeight: 600, padding: "3px 10px",
                      borderRadius: "999px", border: "1px solid #BBF7D0",
                    }}>
                      <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16" />
                      </svg>
                      {dealer.companyName || "No Company"}
                    </span>
                  </td>

                  {/* Email */}
                  <td style={{ padding: "16px 28px", fontSize: "13px", color: "#475569" }}>
                    {dealer.email || "—"}
                  </td>

                  {/* Phone */}
                  <td style={{ padding: "16px 28px", fontSize: "13px", color: "#94A3B8" }}>
                    {dealer.phone ?? "—"}
                  </td>

                  {/* Joined */}
                  <td style={{ padding: "16px 28px", fontSize: "12px", color: "#94A3B8", whiteSpace: "nowrap" }}>
                    {dealer.createdAt
                      ? new Date(dealer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      : "—"}
                  </td>

                  {/* Delete */}
                  <td style={{ padding: "16px 28px", textAlign: "right" }}>
                    <button
                      onClick={() => handleDelete(dealer._id, dealer.name || "this dealer")}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "6px",
                        height: "32px", padding: "0 12px", borderRadius: "8px",
                        border: "1px solid #FCA5A5", background: "#FFF5F5",
                        color: "#EF4444", fontSize: "12px", fontWeight: 600,
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#FEE2E2"; e.currentTarget.style.borderColor = "#EF4444" }}
                      onMouseLeave={e => { e.currentTarget.style.background = "#FFF5F5"; e.currentTarget.style.borderColor = "#FCA5A5" }}
                    >
                      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modal ───────────────────────────────────────────────────────────── */}
      {showForm && (
        <div
          style={{
            position: "fixed", inset: 0, zIndex: 50,
            background: "rgba(15,23,42,0.45)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px",
          }}
          onClick={closeForm}
        >
          <div
            style={{
              background: "white", borderRadius: "20px", padding: "36px",
              width: "100%", maxWidth: "480px",
              boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
              maxHeight: "90vh", overflowY: "auto",
            }}
            onClick={e => e.stopPropagation()}
          >

            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#0F172A", margin: 0 }}>Add Dealer</h2>
                <p style={{ fontSize: "13px", color: "#64748B", marginTop: "3px" }}>
                  Dealer can sign in at <span style={{ color: "#4F46E5", fontWeight: 500 }}>/dealer/login</span>
                </p>
              </div>
              <button
                onClick={closeForm}
                style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  background: "#F1F5F9", border: "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "#64748B", flexShrink: 0,
                }}
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={labelCls}>Full Name *</label>
                  <input
                    style={inputCls} value={form.name}
                    onChange={e => setField("name", e.target.value)}
                    placeholder="John Smith"
                    onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)" }}
                    onBlur={e =>  { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none" }}
                  />
                </div>
                <div>
                  <label style={labelCls}>Phone</label>
                  <input
                    style={inputCls} type="tel" value={form.phone}
                    onChange={e => setField("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                    onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)" }}
                    onBlur={e =>  { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none" }}
                  />
                </div>
              </div>

              <div>
                <label style={labelCls}>Company Name *</label>
                <input
                  style={inputCls} value={form.companyName}
                  onChange={e => setField("companyName", e.target.value)}
                  placeholder="Acme Refrigeration Pvt. Ltd."
                  onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)" }}
                  onBlur={e =>  { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none" }}
                />
              </div>

              <div>
                <label style={labelCls}>Email Address *</label>
                <input
                  style={inputCls} type="email" value={form.email}
                  onChange={e => setField("email", e.target.value)}
                  placeholder="dealer@company.com"
                  onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)" }}
                  onBlur={e =>  { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none" }}
                />
              </div>

              <div>
                <label style={labelCls}>Password *</label>
                <div style={{ position: "relative" }}>
                  <input
                    style={{ ...inputCls, paddingRight: "44px" }}
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={e => setField("password", e.target.value)}
                    placeholder="Min. 6 characters"
                    onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)" }}
                    onBlur={e =>  { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none" }}
                  />
                  <button
                    type="button" onClick={() => setShowPw(v => !v)}
                    style={{
                      position: "absolute", right: "12px", top: "50%",
                      transform: "translateY(-50%)", background: "none",
                      border: "none", cursor: "pointer",
                      color: "#94A3B8", display: "flex", alignItems: "center", padding: "4px",
                    }}
                  >
                    {showPw ? (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "#FFF5F5", border: "1px solid #FCA5A5",
                  borderRadius: "10px", padding: "12px 14px",
                }}>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#EF4444" strokeWidth="2" style={{ flexShrink: 0 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span style={{ color: "#DC2626", fontSize: "13px" }}>{error}</span>
                </div>
              )}

              {success && (
                <div style={{
                  display: "flex", alignItems: "flex-start", gap: "8px",
                  background: "#F0FDF4", border: "1px solid #86EFAC",
                  borderRadius: "10px", padding: "12px 14px",
                }}>
                  <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#16A34A" strokeWidth="2" style={{ flexShrink: 0, marginTop: "1px" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span style={{ color: "#15803D", fontSize: "13px" }}>{success}</span>
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", paddingTop: "4px" }}>
                <button
                  type="button" onClick={closeForm}
                  style={{
                    flex: 1, height: "44px", borderRadius: "10px",
                    border: "1px solid #E2E8F0", background: "white",
                    fontSize: "14px", fontWeight: 500, color: "#475569", cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "#F8FAFC" }}
                  onMouseLeave={e => { e.currentTarget.style.background = "white" }}
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={saving}
                  style={{
                    flex: 2, height: "44px", borderRadius: "10px",
                    background: saving
                      ? "rgba(99,102,241,0.5)"
                      : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                    border: "none", color: "white",
                    fontSize: "14px", fontWeight: 600,
                    cursor: saving ? "not-allowed" : "pointer",
                    boxShadow: saving ? "none" : "0 4px 14px rgba(99,102,241,0.35)",
                  }}
                >
                  {saving ? "Creating account…" : "Create Dealer Account"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      <style>{`* { box-sizing: border-box; } input::placeholder { color: #CBD5E1; }`}</style>
    </div>
  )
}
