"use client"

import { useEffect, useState } from "react"
import { BASE_URL } from "@/lib/config"

interface OrderProduct {
  name:     string
  quantity: number
  price:    number
}

interface Order {
  _id:              string
  status:           string
  createdAt:        string
  totalAmount?:     number
  shippingDetails?: { name?: string; phone?: string; address?: string }
  products?:        OrderProduct[]
}

type StatusKey = "processing" | "shipped" | "delivered" | "cancelled"

const STATUS_BUTTONS: { key: StatusKey; label: string; bg: string; color: string; border: string }[] = [
  { key: "processing", label: "Processing", bg: "#F5F3FF", color: "#6D28D9", border: "#C4B5FD" },
  { key: "shipped",    label: "Shipped",    bg: "#F0FDF4", color: "#15803D", border: "#86EFAC" },
  { key: "delivered",  label: "Delivered",  bg: "#EFF6FF", color: "#1D4ED8", border: "#93C5FD" },
  { key: "cancelled",  label: "Cancelled",  bg: "#FFF5F5", color: "#DC2626", border: "#FCA5A5" },
]

const STATUS_BADGE: Record<string, { bg: string; color: string }> = {
  pending:    { bg: "#FEF9C3", color: "#854D0E" },
  processing: { bg: "#F5F3FF", color: "#6D28D9" },
  shipped:    { bg: "#DCFCE7", color: "#15803D" },
  delivered:  { bg: "#DBEAFE", color: "#1D4ED8" },
  cancelled:  { bg: "#FEE2E2", color: "#DC2626" },
}

export default function DealerOrdersPage() {
  const [orders,   setOrders]   = useState<Order[]>([])
  const [loading,  setLoading]  = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

  useEffect(() => {
    async function fetchOrders() {
      const token = sessionStorage.getItem("dealerToken")
      if (!token) return
      try {
        const res  = await fetch(`${BASE_URL}/api/dealer/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok || res.status === 204) { setLoading(false); return }
        const data = await res.json()
        setOrders(data?.orders || data || [])
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  async function updateStatus(orderId: string, status: StatusKey) {
    setUpdating(`${orderId}-${status}`)
    try {
      const token = sessionStorage.getItem("dealerToken")
      if (!token) return
      await fetch(`${BASE_URL}/api/dealer/orders/${orderId}/status`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ status }),
      })
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o))
    } finally {
      setUpdating(null)
    }
  }

  const totalQty = (products?: OrderProduct[]) =>
    (products ?? []).reduce((s, p) => s + p.quantity, 0)

  const productLabel = (products?: OrderProduct[]) => {
    if (!products || products.length === 0) return "—"
    if (products.length === 1) return products[0].name
    return `${products[0].name} +${products.length - 1} more`
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", padding: "36px 40px", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#94A3B8", marginBottom: "4px" }}>
          Dealer Portal
        </p>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#0F172A", letterSpacing: "-0.025em", margin: 0 }}>
          Orders
        </h1>
        <p style={{ marginTop: "4px", fontSize: "14px", color: "#64748B" }}>
          {loading ? "Loading…" : `${orders.length} order${orders.length !== 1 ? "s" : ""} assigned to you`}
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
            Loading orders…
          </div>
        ) : orders.length === 0 ? (
          <div style={{ padding: "80px", textAlign: "center" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "14px", background: "#F1F5F9",
              margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="#94A3B8" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p style={{ fontSize: "14px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>No orders yet</p>
            <p style={{ fontSize: "13px", color: "#94A3B8" }}>Orders assigned to you will appear here.</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                {["Order ID", "Product", "Buyer", "Qty", "Amount", "Status", "Actions"].map(h => (
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
              {orders.map((order, i) => {
                const badge   = STATUS_BADGE[order.status?.toLowerCase()] ?? { bg: "#F3F4F6", color: "#374151" }
                const isFinal = order.status === "delivered" || order.status === "cancelled"

                return (
                  <tr
                    key={order._id}
                    style={{ borderTop: i > 0 ? "1px solid #F8FAFC" : undefined }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FAFBFF" }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                  >
                    {/* Order ID */}
                    <td style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>
                      <p style={{ fontSize: "13px", fontWeight: 700, color: "#0F172A", fontFamily: "monospace", margin: 0 }}>
                        #{order._id.slice(-8).toUpperCase()}
                      </p>
                      <p style={{ fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </p>
                    </td>

                    {/* Product */}
                    <td style={{ padding: "16px 20px", maxWidth: "200px" }}>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "#334155", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {productLabel(order.products)}
                      </p>
                    </td>

                    {/* Buyer */}
                    <td style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>
                      <p style={{ fontSize: "13px", color: "#475569", margin: 0 }}>
                        {order.shippingDetails?.name || "—"}
                      </p>
                      {order.shippingDetails?.phone && (
                        <p style={{ fontSize: "11px", color: "#94A3B8", marginTop: "2px" }}>
                          {order.shippingDetails.phone}
                        </p>
                      )}
                    </td>

                    {/* Qty */}
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{
                        display: "inline-block", minWidth: "28px", textAlign: "center",
                        padding: "2px 8px", borderRadius: "6px",
                        background: "#F1F5F9", color: "#475569",
                        fontSize: "13px", fontWeight: 600,
                      }}>
                        {totalQty(order.products)}
                      </span>
                    </td>

                    {/* Amount */}
                    <td style={{ padding: "16px 20px", whiteSpace: "nowrap" }}>
                      <p style={{ fontSize: "14px", fontWeight: 700, color: "#0F172A", margin: 0 }}>
                        {order.totalAmount ? fmt(order.totalAmount) : "—"}
                      </p>
                    </td>

                    {/* Status badge */}
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{
                        display: "inline-block", padding: "4px 12px", borderRadius: "999px",
                        fontSize: "12px", fontWeight: 600,
                        background: badge.bg, color: badge.color,
                        whiteSpace: "nowrap",
                      }}>
                        {order.status
                          ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                          : "—"}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td style={{ padding: "16px 20px" }}>
                      {isFinal ? (
                        <span style={{ fontSize: "12px", color: "#CBD5E1" }}>—</span>
                      ) : (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {STATUS_BUTTONS.filter(b => b.key !== order.status).map(btn => {
                            const key  = `${order._id}-${btn.key}`
                            const busy = updating === key
                            return (
                              <button
                                key={btn.key}
                                disabled={busy}
                                onClick={() => updateStatus(order._id, btn.key)}
                                style={{
                                  height: "30px", padding: "0 12px",
                                  borderRadius: "8px", border: `1px solid ${btn.border}`,
                                  background: btn.bg, color: btn.color,
                                  fontSize: "12px", fontWeight: 600,
                                  cursor: busy ? "not-allowed" : "pointer",
                                  opacity: busy ? 0.6 : 1,
                                  transition: "opacity 0.15s, filter 0.15s",
                                  whiteSpace: "nowrap",
                                  display: "inline-flex", alignItems: "center", gap: "4px",
                                }}
                                onMouseEnter={e => { if (!busy) e.currentTarget.style.filter = "brightness(0.94)" }}
                                onMouseLeave={e => { e.currentTarget.style.filter = "none" }}
                              >
                                {busy && (
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                    style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }}>
                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                                  </svg>
                                )}
                                {btn.label}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </td>
                  </tr>
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
