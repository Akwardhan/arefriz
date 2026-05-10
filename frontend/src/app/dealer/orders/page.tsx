"use client"

import { useEffect, useMemo, useState } from "react"
import { BASE_URL } from "@/lib/config"

// ── Types ─────────────────────────────────────────────────────────────────────

interface OrderProduct { name: string; quantity: number; price: number }

interface Order {
  _id:              string
  orderId?:         string
  orderStatus:      string
  createdAt:        string
  totalAmount?:     number
  shippingDetails?: { name?: string; phone?: string; address?: string }
  products?:        OrderProduct[]
}

type StatusKey = "processing" | "shipped" | "delivered" | "cancelled"
type SortKey   = "latest" | "oldest"

// ── Constants ─────────────────────────────────────────────────────────────────

const META: Record<string, { bg: string; color: string; border: string; dot: string }> = {
  processing: { bg: "#FEF3C7", color: "#92400E", border: "#FDE68A", dot: "#D97706" },
  shipped:    { bg: "#DBEAFE", color: "#1E40AF", border: "#BFDBFE", dot: "#3B82F6" },
  delivered:  { bg: "#D1FAE5", color: "#065F46", border: "#A7F3D0", dot: "#10B981" },
  cancelled:  { bg: "#FEE2E2", color: "#991B1B", border: "#FECACA", dot: "#EF4444" },
}

const STATUS_KEYS: StatusKey[] = ["processing", "shipped", "delivered", "cancelled"]

const TIMELINE = [
  { key: "processing", label: "Processing" },
  { key: "shipped",    label: "Shipped"    },
  { key: "delivered",  label: "Delivered"  },
]

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DealerOrdersPage() {
  const [orders,       setOrders]       = useState<Order[]>([])
  const [loading,      setLoading]      = useState(true)
  const [updating,     setUpdating]     = useState<string | null>(null)
  const [expandedId,   setExpandedId]   = useState<string | null>(null)
  const [search,       setSearch]       = useState("")
  const [sort,         setSort]         = useState<SortKey>("latest")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    async function load() {
      const token = sessionStorage.getItem("dealerToken")
      if (!token) return
      try {
        const res = await fetch(`${BASE_URL}/api/dealer/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok && res.status !== 204) {
          const data = await res.json()
          setOrders(data?.orders ?? data ?? [])
        }
      } finally { setLoading(false) }
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const c: Record<string, number> = { processing: 0, shipped: 0, delivered: 0, cancelled: 0 }
    for (const o of orders) { const s = o.orderStatus?.toLowerCase(); if (s in c) c[s]++ }
    return c
  }, [orders])

  const displayed = useMemo(() => {
    let list = [...orders]
    if (statusFilter !== "all") list = list.filter(o => o.orderStatus?.toLowerCase() === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(o => o.products?.some(p => p.name.toLowerCase().includes(q)))
    }
    list.sort((a, b) => {
      const d = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return sort === "latest" ? -d : d
    })
    return list
  }, [orders, statusFilter, search, sort])

  async function updateStatus(orderId: string, status: StatusKey) {
    setUpdating(`${orderId}-${status}`)
    try {
      const token = sessionStorage.getItem("dealerToken")
      if (!token) return
      const res = await fetch(`${BASE_URL}/api/dealer/orders/${orderId}/status`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ status }),
      })
      if (res.ok) setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: status } : o))
    } finally { setUpdating(null) }
  }

  return (
    <div style={{ padding: "28px 32px", fontFamily: "'Inter', system-ui, sans-serif", background: "#F8FAFC", minHeight: "100vh" }}>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "22px" }}>
        {STATUS_KEYS.map(key => {
          const m = META[key]; const active = statusFilter === key
          return (
            <button key={key} onClick={() => setStatusFilter(active ? "all" : key)}
              style={{ background: active ? m.bg : "white", border: `1.5px solid ${active ? m.border : "#E2E8F0"}`, borderRadius: "12px", padding: "16px 18px", textAlign: "left", cursor: "pointer", transition: "all 0.15s", boxShadow: active ? `0 4px 12px ${m.border}55` : "0 1px 3px rgba(0,0,0,0.05)" }}
            >
              <p style={{ fontSize: "26px", fontWeight: 800, color: active ? m.color : "#0F172A", margin: "0 0 3px" }}>{loading ? "—" : stats[key]}</p>
              <p style={{ fontSize: "12px", color: active ? m.color : "#94A3B8", margin: 0, fontWeight: 600, textTransform: "capitalize" }}>{key}</p>
            </button>
          )
        })}
      </div>

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #E2E8F0", padding: "10px 14px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "180px" }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#94A3B8" strokeWidth="2"
            style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search product name…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", height: "34px", paddingLeft: "30px", paddingRight: "10px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "13px", color: "#334155", background: "#F8FAFC", outline: "none", boxSizing: "border-box" }} />
        </div>
        <select value={sort} onChange={e => setSort(e.target.value as SortKey)}
          style={{ height: "34px", padding: "0 10px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "13px", color: "#334155", background: "#F8FAFC", outline: "none", cursor: "pointer" }}>
          <option value="latest">Latest first</option>
          <option value="oldest">Oldest first</option>
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ height: "34px", padding: "0 10px", border: "1px solid #E2E8F0", borderRadius: "8px", fontSize: "13px", color: "#334155", background: "#F8FAFC", outline: "none", cursor: "pointer" }}>
          <option value="all">All statuses</option>
          {STATUS_KEYS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <span style={{ fontSize: "12px", color: "#94A3B8", marginLeft: "auto" }}>
          {loading ? "…" : `${displayed.length} order${displayed.length !== 1 ? "s" : ""}`}
        </span>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────── */}
      <div style={{ background: "white", borderRadius: "12px", border: "1px solid #E2E8F0", overflow: "hidden" }}>

        {loading ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <div style={{ width: "26px", height: "26px", borderRadius: "50%", border: "2px solid #D1FAE5", borderTopColor: "#10b981", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
            <p style={{ fontSize: "13px", color: "#94A3B8" }}>Loading orders…</p>
          </div>
        ) : displayed.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>
              {orders.length === 0 ? "No orders yet" : "No orders match your filters"}
            </p>
            <p style={{ fontSize: "13px", color: "#94A3B8" }}>
              {orders.length === 0 ? "Orders assigned to you will appear here." : "Try clearing the filters."}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 110px 155px 28px", padding: "10px 20px", background: "#F8FAFC", borderBottom: "1px solid #E2E8F0", gap: "16px", alignItems: "center" }}>
              {["Order", "Buyer", "Amount", "Status", ""].map(h => (
                <span key={h} style={{ fontSize: "10px", fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase" }}>{h}</span>
              ))}
            </div>

            {/* Rows */}
            {displayed.map((order, i) => {
              const sk       = order.orderStatus?.toLowerCase() ?? "processing"
              const m        = META[sk] ?? META.processing
              const expanded = expandedId === order._id
              const isFinal  = sk === "delivered" || sk === "cancelled"

              return (
                <div key={order._id} style={{ borderTop: i > 0 ? "1px solid #F1F5F9" : undefined }}>

                  {/* ── Row ──────────────────────────────────────────── */}
                  <div
                    onClick={() => setExpandedId(expanded ? null : order._id)}
                    style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 110px 155px 28px", padding: "14px 20px", gap: "16px", alignItems: "center", cursor: "pointer", background: expanded ? "#F8FAFF" : "transparent", transition: "background 0.1s" }}
                    onMouseEnter={e => { if (!expanded) (e.currentTarget as HTMLElement).style.background = "#FAFBFF" }}
                    onMouseLeave={e => { if (!expanded) (e.currentTarget as HTMLElement).style.background = "transparent" }}
                  >
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", fontFamily: "monospace", margin: 0 }}>
                        #{order.orderId ?? order._id.slice(-8).toUpperCase()}
                      </p>
                      <p style={{ fontSize: "11px", color: "#94A3B8", margin: "2px 0 0" }}>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>

                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "#334155", margin: 0 }}>
                        {order.shippingDetails?.name ?? "—"}
                      </p>
                      <p style={{ fontSize: "11px", color: "#94A3B8", margin: "2px 0 0" }}>
                        {order.products?.length ?? 0} item{(order.products?.length ?? 0) !== 1 ? "s" : ""}
                      </p>
                    </div>

                    <p style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                      {order.totalAmount ? fmt(order.totalAmount) : "—"}
                    </p>

                    <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", padding: "4px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: 600, background: m.bg, color: m.color, border: `1px solid ${m.border}` }}>
                      <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: m.dot }} />
                      {sk.charAt(0).toUpperCase() + sk.slice(1)}
                    </span>

                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#CBD5E1" strokeWidth="2.5"
                      style={{ transform: expanded ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s", flexShrink: 0 }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* ── Expanded detail ───────────────────────────── */}
                  {expanded && (
                    <div style={{ borderTop: "1px solid #F1F5F9", background: "#F8FAFF", padding: "18px 20px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>

                        {/* Buyer */}
                        <div style={{ background: "white", borderRadius: "10px", border: "1px solid #E2E8F0", padding: "14px" }}>
                          <p style={{ fontSize: "10px", fontWeight: 700, color: "#94A3B8", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 10px" }}>Buyer Details</p>
                          {[
                            { label: "Name",    value: order.shippingDetails?.name    ?? "—" },
                            { label: "Phone",   value: order.shippingDetails?.phone   ?? "—" },
                            { label: "Address", value: order.shippingDetails?.address ?? "—" },
                          ].map(({ label, value }) => (
                            <div key={label} style={{ display: "flex", gap: "8px", marginBottom: "7px" }}>
                              <span style={{ fontSize: "11px", color: "#94A3B8", minWidth: "52px", fontWeight: 600 }}>{label}</span>
                              <span style={{ fontSize: "13px", color: "#334155", lineHeight: 1.4 }}>{value}</span>
                            </div>
                          ))}
                        </div>

                        {/* Products */}
                        <div style={{ background: "white", borderRadius: "10px", border: "1px solid #E2E8F0", overflow: "hidden" }}>
                          <p style={{ fontSize: "10px", fontWeight: 700, color: "#94A3B8", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 14px 8px", margin: 0 }}>Products</p>
                          {(order.products ?? []).length === 0 ? (
                            <p style={{ fontSize: "13px", color: "#94A3B8", padding: "8px 14px" }}>No products</p>
                          ) : (order.products ?? []).map((p, idx) => (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", borderTop: "1px solid #F1F5F9" }}>
                              <div>
                                <p style={{ fontSize: "13px", fontWeight: 500, color: "#334155", margin: 0 }}>{p.name}</p>
                                <p style={{ fontSize: "11px", color: "#94A3B8", margin: "1px 0 0" }}>×{p.quantity} @ {fmt(p.price)}</p>
                              </div>
                              <p style={{ fontSize: "13px", fontWeight: 600, color: "#0F172A", margin: 0 }}>{fmt(p.price * p.quantity)}</p>
                            </div>
                          ))}
                          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", borderTop: "1px solid #F1F5F9", background: "#F8FAFC" }}>
                            <span style={{ fontSize: "12px", fontWeight: 700, color: "#475569" }}>Total</span>
                            <span style={{ fontSize: "14px", fontWeight: 800, color: "#0F172A" }}>{order.totalAmount ? fmt(order.totalAmount) : "—"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Timeline + actions */}
                      <div style={{ background: "white", borderRadius: "10px", border: "1px solid #E2E8F0", padding: "14px" }}>
                        <p style={{ fontSize: "10px", fontWeight: 700, color: "#94A3B8", letterSpacing: "0.1em", textTransform: "uppercase", margin: "0 0 14px" }}>Order Timeline</p>

                        {sk !== "cancelled" ? (
                          <div style={{ display: "flex", alignItems: "flex-start", marginBottom: isFinal ? 0 : "16px" }}>
                            {TIMELINE.map((step, idx) => {
                              const stepIdx    = TIMELINE.findIndex(s => s.key === sk)
                              const completed  = idx < stepIdx || sk === "delivered"
                              const current    = step.key === sk
                              const sm         = META[step.key] ?? META.processing
                              const isLast     = idx === TIMELINE.length - 1
                              return (
                                <div key={step.key} style={{ display: "flex", alignItems: "center", flex: isLast ? "none" : 1 }}>
                                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: completed ? "#10B981" : current ? sm.bg : "#F1F5F9", border: `2px solid ${completed ? "#10B981" : current ? sm.border : "#E2E8F0"}` }}>
                                      {completed
                                        ? <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        : <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: current ? sm.dot : "#D1D5DB" }} />
                                      }
                                    </div>
                                    <span style={{ fontSize: "11px", fontWeight: current ? 700 : 500, color: completed ? "#10B981" : current ? sm.color : "#94A3B8", whiteSpace: "nowrap" }}>
                                      {step.label}
                                    </span>
                                  </div>
                                  {!isLast && (
                                    <div style={{ flex: 1, height: "2px", background: completed ? "#10B981" : "#E2E8F0", margin: "0 8px 20px" }} />
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        ) : (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 14px", borderRadius: "8px", background: META.cancelled.bg, border: `1px solid ${META.cancelled.border}`, marginBottom: isFinal ? 0 : "16px" }}>
                            <span style={{ fontSize: "13px", fontWeight: 600, color: META.cancelled.color }}>Order Cancelled</span>
                          </div>
                        )}

                        {!isFinal && (
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                            <span style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600 }}>Move to:</span>
                            {STATUS_KEYS.filter(s => s !== sk).map(btnKey => {
                              const bm   = META[btnKey]
                              const busy = updating === `${order._id}-${btnKey}`
                              return (
                                <button key={btnKey} disabled={busy}
                                  onClick={e => { e.stopPropagation(); updateStatus(order._id, btnKey) }}
                                  style={{ height: "30px", padding: "0 13px", borderRadius: "8px", border: `1px solid ${bm.border}`, background: bm.bg, color: bm.color, fontSize: "12px", fontWeight: 600, cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1, display: "inline-flex", alignItems: "center", gap: "5px" }}
                                  onMouseEnter={e => { if (!busy) e.currentTarget.style.filter = "brightness(0.93)" }}
                                  onMouseLeave={e => { e.currentTarget.style.filter = "none" }}
                                >
                                  {busy && <span style={{ width: "10px", height: "10px", borderRadius: "50%", border: "1.5px solid currentColor", borderTopColor: "transparent", animation: "spin 0.7s linear infinite" }} />}
                                  {btnKey.charAt(0).toUpperCase() + btnKey.slice(1)}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
