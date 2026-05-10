"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { BASE_URL } from "@/lib/config"

interface Order {
  _id:       string
  status:    string
  createdAt: string
  totalAmount?: number
  shippingDetails?: { name?: string }
}

export default function DealerDashboardPage() {
  const [orders,  setOrders]  = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      const token = sessionStorage.getItem("dealerToken")
      if (!token) return
      try {
        const res  = await fetch(`${BASE_URL}/api/dealer/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok || res.status === 204) return
        const data = await res.json()
        setOrders(data.orders ?? data ?? [])
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  const total    = orders.length
  const pending  = orders.filter(o => o.status?.toLowerCase() === "pending").length
  const shipped  = orders.filter(o => o.status?.toLowerCase() === "shipped").length
  const dealer   = (() => { try { return JSON.parse(sessionStorage.getItem("dealer") ?? "{}") } catch { return {} } })()

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

  const statusColor = (s: string) => {
    switch (s?.toLowerCase()) {
      case "pending":    return { bg: "#FEF3C7", color: "#92400E" }
      case "shipped":    return { bg: "#D1FAE5", color: "#065F46" }
      case "delivered":  return { bg: "#DBEAFE", color: "#1E40AF" }
      case "cancelled":  return { bg: "#FEE2E2", color: "#991B1B" }
      default:           return { bg: "#F3F4F6", color: "#374151" }
    }
  }

  return (
    <div style={{ padding: "32px 36px", fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <p style={{ fontSize: "12px", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6B7280", marginBottom: "6px" }}>
          Dealer Portal
        </p>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111827", letterSpacing: "-0.025em", margin: 0 }}>
          Welcome back{dealer?.name ? `, ${dealer.name.split(" ")[0]}` : ""}
        </h1>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "Total Orders",   value: total,   color: "#10b981" },
          { label: "Pending",        value: pending,  color: "#F59E0B" },
          { label: "Shipped",        value: shipped,  color: "#3B82F6" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: "white", borderRadius: "16px",
            border: "1px solid #E5E7EB", padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}>
            <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "8px" }}>{label}</p>
            <p style={{ fontSize: "32px", fontWeight: 800, color, margin: 0 }}>{loading ? "—" : value}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div style={{
        background: "white", borderRadius: "16px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)", overflow: "hidden",
      }}>
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid #F3F4F6",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, color: "#111827", margin: 0 }}>Recent Orders</h2>
          <Link href="/dealer/orders" style={{ fontSize: "13px", color: "#10b981", textDecoration: "none", fontWeight: 500 }}>
            View all →
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#9CA3AF", fontSize: "14px" }}>Loading…</div>
        ) : orders.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "#9CA3AF", fontSize: "14px" }}>No orders assigned yet.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                {["Order ID", "Customer", "Amount", "Status", "Date"].map(h => (
                  <th key={h} style={{
                    padding: "12px 24px", textAlign: "left",
                    fontSize: "11px", fontWeight: 600, color: "#6B7280",
                    letterSpacing: "0.08em", textTransform: "uppercase",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order, i) => {
                const sc = statusColor(order.status)
                return (
                  <tr key={order._id} style={{ borderTop: i > 0 ? "1px solid #F3F4F6" : undefined }}>
                    <td style={{ padding: "14px 24px", fontSize: "13px", fontWeight: 600, color: "#111827", fontFamily: "monospace" }}>
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td style={{ padding: "14px 24px", fontSize: "13px", color: "#374151" }}>
                      {order.shippingDetails?.name ?? "—"}
                    </td>
                    <td style={{ padding: "14px 24px", fontSize: "13px", fontWeight: 600, color: "#111827" }}>
                      {order.totalAmount ? fmt(order.totalAmount) : "—"}
                    </td>
                    <td style={{ padding: "14px 24px" }}>
                      <span style={{
                        display: "inline-block", padding: "3px 10px", borderRadius: "999px",
                        fontSize: "12px", fontWeight: 600,
                        background: sc.bg, color: sc.color,
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 24px", fontSize: "13px", color: "#6B7280" }}>
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
