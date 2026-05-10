"use client"

import { useEffect, useState } from "react"
import { BASE_URL } from "@/lib/config"

interface Inquiry {
  _id:       string
  name:      string
  email:     string
  phone?:    string
  message:   string
  product?:  string | { _id: string; name: string }
  status?:   string
  createdAt: string
}

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  new:         { bg: "#EFF6FF", color: "#1D4ED8" },
  open:        { bg: "#EFF6FF", color: "#1D4ED8" },
  inprogress:  { bg: "#F5F3FF", color: "#6D28D9" },
  "in-progress":{ bg: "#F5F3FF", color: "#6D28D9" },
  resolved:    { bg: "#F0FDF4", color: "#15803D" },
  closed:      { bg: "#F3F4F6", color: "#6B7280" },
}

export default function DealerInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading,   setLoading]   = useState(true)
  const [expanded,  setExpanded]  = useState<string | null>(null)

  useEffect(() => {
    async function fetchInquiries() {
      const token = sessionStorage.getItem("dealerToken")
      if (!token) return
      try {
        const res  = await fetch(`${BASE_URL}/api/dealer/inquiries`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok || res.status === 204) { setLoading(false); return }
        const data = await res.json()
        setInquiries(data.inquiries ?? data ?? [])
      } finally {
        setLoading(false)
      }
    }
    fetchInquiries()
  }, [])

  const productName = (inquiry: Inquiry) => {
    if (!inquiry.product) return null
    if (typeof inquiry.product === "object") return inquiry.product.name
    return inquiry.product
  }

  const badge = (status?: string) =>
    STATUS_BADGE[(status ?? "new").toLowerCase().replace(" ", "")] ?? { bg: "#EFF6FF", color: "#1D4ED8" }

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", padding: "36px 40px", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.025em", margin: 0 }}>
          Inquiries
        </h1>
        <p style={{ marginTop: "4px", fontSize: "14px", color: "#64748B" }}>
          {loading ? "Loading…" : `${inquiries.length} inquir${inquiries.length !== 1 ? "ies" : "y"} assigned to you`}
        </p>
      </div>

      {/* Card */}
      <div style={{
        background: "white", borderRadius: "16px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.04)",
        border: "1px solid #F1F5F9", overflow: "hidden",
      }}>

        {loading ? (
          <div style={{ padding: "80px", textAlign: "center", color: "#94A3B8", fontSize: "14px" }}>
            Loading inquiries…
          </div>
        ) : inquiries.length === 0 ? (
          <div style={{ padding: "80px", textAlign: "center" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "14px", background: "#F1F5F9",
              margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#94A3B8" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>No inquiries yet</p>
            <p style={{ fontSize: "13px", color: "#94A3B8" }}>Customer inquiries for your products will appear here.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                {["Customer", "Product", "Message", "Status", "Date"].map(h => (
                  <th key={h} style={{
                    padding: "12px 20px", textAlign: "left",
                    fontSize: "11px", fontWeight: 700, color: "#94A3B8",
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq, i) => {
                const b       = badge(inq.status)
                const isOpen  = expanded === inq._id
                const product = productName(inq)

                return (
                  <>
                    <tr
                      key={inq._id}
                      onClick={() => setExpanded(isOpen ? null : inq._id)}
                      style={{
                        borderTop: i > 0 ? "1px solid #F8FAFC" : undefined,
                        cursor: "pointer",
                        background: isOpen ? "#F8FAFF" : "transparent",
                      }}
                      onMouseEnter={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.background = "#FAFBFF" }}
                      onMouseLeave={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.background = "transparent" }}
                    >
                      {/* Customer */}
                      <td style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>
                        <p style={{ fontSize: "13px", fontWeight: 600, color: "#0F172A", margin: 0 }}>
                          {inq.name}
                        </p>
                        <p style={{ fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>
                          {inq.email}
                        </p>
                        {inq.phone && (
                          <p style={{ fontSize: "11px", color: "#94A3B8", marginTop: "1px" }}>
                            {inq.phone}
                          </p>
                        )}
                      </td>

                      {/* Product */}
                      <td style={{ padding: "16px 20px", maxWidth: "160px" }}>
                        <p style={{ fontSize: "13px", color: "#475569", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {product ?? "—"}
                        </p>
                      </td>

                      {/* Message preview */}
                      <td style={{ padding: "16px 20px", maxWidth: "260px" }}>
                        <p style={{ fontSize: "13px", color: "#475569", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {inq.message}
                        </p>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "16px 20px" }}>
                        <span style={{
                          display: "inline-block", padding: "4px 12px", borderRadius: "999px",
                          fontSize: "12px", fontWeight: 600, whiteSpace: "nowrap",
                          background: b.bg, color: b.color,
                        }}>
                          {inq.status
                            ? inq.status.charAt(0).toUpperCase() + inq.status.slice(1)
                            : "New"}
                        </span>
                      </td>

                      {/* Date */}
                      <td style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>
                        <p style={{ fontSize: "12px", color: "#94A3B8", margin: 0 }}>
                          {new Date(inq.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </td>
                    </tr>

                    {/* Expanded message row */}
                    {isOpen && (
                      <tr key={`${inq._id}-expanded`} style={{ background: "#F8FAFF" }}>
                        <td colSpan={5} style={{ padding: "0 20px 20px" }}>
                          <div style={{
                            background: "white", borderRadius: "12px",
                            border: "1px solid #E2E8F0", padding: "16px 20px",
                          }}>
                            <p style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
                              Full Message
                            </p>
                            <p style={{ fontSize: "14px", color: "#334155", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
                              {inq.message}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
