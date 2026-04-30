"use client"

import { useEffect, useState, type Dispatch, type SetStateAction } from "react"
import { useRouter } from "next/navigation"
import {
  Truck, CheckCircle2, Clock, RefreshCw, ShoppingBag,
  MapPin, Phone, User, Wrench, Package, Search, ChevronDown, LogOut, Send,
} from "lucide-react"
import { BASE_URL } from "@/lib/config"
import { authHeaders } from "@/lib/auth"

// ── Types ──────────────────────────────────────────────────────────────────────

interface OrderProduct {
  productId: string | { _id: string; name: string; price?: number; image?: string }
  name:      string
  quantity:  number
  price:     number
}

interface Order {
  _id:              string
  orderId?:         string
  products:         OrderProduct[]
  shippingDetails?: { name?: string; phone?: string; address?: string }
  name?:            string
  phone?:           string
  address?:         string
  subtotal:         number
  logisticsCost:    number
  installationCost: number
  techSurcharge:    number
  taxes:            number
  totalAmount:      number
  orderStatus:      string
  createdAt:        string
}

type StatusKey = "processing" | "shipped" | "delivered" | "cancelled"

// ── Status config ──────────────────────────────────────────────────────────────

const S: Record<StatusKey, { label: string; color: string; bg: string; border: string; glow: string; icon: React.ReactNode }> = {
  processing: {
    label:  "Processing",
    color:  "#2563EB",
    bg:     "#EFF6FF",
    border: "#DBEAFE",
    glow:   "rgba(37,99,235,0.07)",
    icon:   <Clock className="h-3.5 w-3.5" />,
  },
  shipped: {
    label:  "Shipped",
    color:  "#92400E",
    bg:     "#FFFBEB",
    border: "#FDE68A",
    glow:   "rgba(146,64,14,0.07)",
    icon:   <Truck className="h-3.5 w-3.5" />,
  },
  delivered: {
    label:  "Delivered",
    color:  "#166534",
    bg:     "#F0FDF4",
    border: "#DCFCE7",
    glow:   "rgba(22,101,52,0.07)",
    icon:   <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  cancelled: {
    label:  "Cancelled",
    color:  "#991B1B",
    bg:     "#FEF2F2",
    border: "#FECACA",
    glow:   "rgba(153,27,27,0.07)",
    icon:   <RefreshCw className="h-3.5 w-3.5" />,
  },
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n ?? 0)

const fmtDate = (s: string) =>
  s ? new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"

const resolveStatus = (s: string): StatusKey => {
  const v = (s ?? "").toLowerCase()
  if (v === "shipped")   return "shipped"
  if (v === "delivered") return "delivered"
  if (v === "cancelled") return "cancelled"
  return "processing"
}

const getProductName = (item: OrderProduct): string =>
  item.name
  || (typeof item.productId === "object" && item.productId?.name ? item.productId.name : "")
  || "Product"

const getCustomer = (order: Order) => ({
  name:    order.shippingDetails?.name    || order.name    || "—",
  phone:   order.shippingDetails?.phone   || order.phone   || "—",
  address: order.shippingDetails?.address || order.address || "—",
})

// ── Root ───────────────────────────────────────────────────────────────────────

export default function OrdersPanel() {
  const router = useRouter()

  const [orders,  setOrders]  = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter,  setFilter]  = useState<StatusKey | "all">("all")
  const [search,  setSearch]  = useState("")

  function handleLogout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res   = await fetch(`${BASE_URL}/api/orders`, {
        headers: { "Content-Type": "application/json", ...authHeaders() },
      })
      const data = await res.json()
      if (res.ok) {
        const list = Array.isArray(data) ? data : Array.isArray(data.orders) ? data.orders : []
        setOrders(list)
      }
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  const updateStatus = async (orderId: string, status: string) => {
    await fetch(`${BASE_URL}/api/orders/${orderId}/status`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body:    JSON.stringify({ orderStatus: status }),
    })
  }

  useEffect(() => { fetchOrders() }, [])

  const q = search.trim().toLowerCase()

  const visible = orders.filter(o => {
    if (filter !== "all" && resolveStatus(o.orderStatus) !== filter) return false
    if (q) {
      const c = getCustomer(o)
      const id = (o.orderId ?? o._id).toLowerCase()
      if (!id.includes(q) && !c.name.toLowerCase().includes(q) && !c.phone.toLowerCase().includes(q)) return false
    }
    return true
  })

  const counts = {
    all:        orders.length,
    processing: orders.filter(o => resolveStatus(o.orderStatus) === "processing").length,
    shipped:    orders.filter(o => resolveStatus(o.orderStatus) === "shipped").length,
    delivered:  orders.filter(o => resolveStatus(o.orderStatus) === "delivered").length,
    cancelled:  orders.filter(o => resolveStatus(o.orderStatus) === "cancelled").length,
  }

  const TABS = [
    { key: "all"         as const, label: "All Orders",  count: counts.all,        color: "#6366F1" },
    { key: "processing"  as const, label: "Processing",  count: counts.processing, color: S.processing.color },
    { key: "shipped"     as const, label: "Shipped",     count: counts.shipped,    color: S.shipped.color },
    { key: "delivered"   as const, label: "Delivered",   count: counts.delivered,  color: S.delivered.color },
    { key: "cancelled"   as const, label: "Cancelled",   count: counts.cancelled,  color: S.cancelled.color },
  ]

  return (
    <div className="min-h-screen bg-white">

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-20 border-b bg-white"
        style={{ borderColor: "#F3F4F6", boxShadow: "0 1px 0 #F3F4F6" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: "#111827" }}
            >
              <ShoppingBag className="h-4 w-4 text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h1 className="text-sm font-semibold" style={{ color: "#111827" }}>Order Management</h1>
              <p className="text-xs" style={{ color: "#9CA3AF" }}>
                {counts.all} order{counts.all !== 1 ? "s" : ""} total
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium transition-colors duration-150 hover:bg-gray-50 hover:border-gray-300"
              style={{ borderColor: "#F3F4F6", color: "#6B7280" }}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium transition-colors duration-150 hover:bg-red-50 hover:border-red-200 hover:text-red-500"
              style={{ borderColor: "#F3F4F6", color: "#9CA3AF" }}
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">

        {/* ── Stat tabs ────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TABS.map(({ key, label, count, color }) => {
            const active = filter === key
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="group rounded-md border bg-white p-4 text-left transition-colors duration-150 hover:bg-gray-50"
                style={{
                  borderColor: active ? "#E5E7EB" : "#F3F4F6",
                  boxShadow:   active ? "0 1px 4px rgba(0,0,0,0.06)" : "none",
                  borderLeftWidth: active ? "3px" : "1px",
                  borderLeftColor: active ? "#111827" : "#F3F4F6",
                }}
              >
                <p className="text-[0.68rem] font-medium uppercase tracking-wider" style={{ color: active ? "#111827" : "#9CA3AF" }}>
                  {label}
                </p>
                <p className="mt-1.5 text-2xl font-semibold leading-none" style={{ color: "#111827" }}>
                  {count}
                </p>
              </button>
            )
          })}
        </div>

        {/* ── Search + filter ───────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "#D1D5DB" }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by order ID, customer name or phone…"
              className="h-9 w-full rounded-lg border bg-white pl-9 pr-8 text-sm outline-none transition-all"
              style={{ borderColor: "#F3F4F6", color: "#111827" }}
              onFocus={e => { e.currentTarget.style.borderColor = "#D1D5DB"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,0,0,0.04)" }}
              onBlur={e  => { e.currentTarget.style.borderColor = "#F3F4F6"; e.currentTarget.style.boxShadow = "none" }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors duration-150 text-base leading-none"
              >
                ×
              </button>
            )}
          </div>
          <div className="relative shrink-0">
            <select
              value={filter}
              onChange={e => setFilter(e.target.value as StatusKey | "all")}
              className="h-9 appearance-none rounded-lg border bg-white pl-3 pr-8 text-sm font-medium outline-none transition-all"
              style={{
                borderColor: "#F3F4F6",
                color:       "#6B7280",
                boxShadow:   "none",
              }}
            >
              <option value="all">All Statuses</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: "#9CA3AF" }} />
          </div>
        </div>

        {/* ── Skeleton ──────────────────────────────────────────────────────────── */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 animate-pulse rounded-md border bg-white" style={{ borderColor: "#F3F4F6" }} />
            ))}
          </div>
        )}

        {/* ── Empty state ───────────────────────────────────────────────────────── */}
        {!loading && visible.length === 0 && (
          <div className="flex flex-col items-center gap-4 rounded-md border bg-white py-20 text-center" style={{ borderColor: "#F3F4F6" }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-md" style={{ background: "#F9FAFB" }}>
              <ShoppingBag className="h-5 w-5" style={{ color: "#D1D5DB" }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#6B7280" }}>
                {q ? `No results for "${search}"` : filter === "all" ? "No orders yet" : `No ${filter} orders`}
              </p>
              <p className="mt-1 text-xs" style={{ color: "#9CA3AF" }}>
                {q ? "Try a different search term" : "Orders will appear here once placed"}
              </p>
            </div>
          </div>
        )}

        {/* ── Order table ───────────────────────────────────────────────────────── */}
        {!loading && visible.length > 0 && (
          <div className="rounded-md overflow-hidden border bg-white" style={{ borderColor: "#F3F4F6" }}>
            {/* Table header */}
            <div
              className="grid items-center gap-6 border-b px-6 py-3"
              style={{ gridTemplateColumns: "60px 180px 1fr 160px 120px 80px", borderColor: "#F3F4F6", background: "#FAFAFA" }}
            >
              <span />
              <span className="text-center text-[0.65rem] font-medium uppercase tracking-wider" style={{ color: "#9CA3AF" }}>Order</span>
              <span className="text-center text-[0.65rem] font-medium uppercase tracking-wider" style={{ color: "#9CA3AF" }}>Customer</span>
              <span className="text-center text-[0.65rem] font-medium uppercase tracking-wider" style={{ color: "#9CA3AF" }}>Status</span>
              <span className="text-center text-[0.65rem] font-medium uppercase tracking-wider" style={{ color: "#9CA3AF" }}>Amount</span>
              <span />
            </div>
            {/* Rows */}
            {visible.map(order => (
              <OrderCard key={order._id} order={order} updateStatus={updateStatus} setOrders={setOrders} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

// ── Order Card ─────────────────────────────────────────────────────────────────

function OrderCard({
  order,
  updateStatus,
  setOrders,
}: {
  order:        Order
  updateStatus: (id: string, status: string) => Promise<void>
  setOrders:    Dispatch<SetStateAction<Order[]>>
}) {
  const [busy,          setBusy]          = useState<StatusKey | null>(null)
  const [done,          setDone]          = useState<StatusKey | null>(null)
  const [expanded,      setExpanded]      = useState(false)
  const [sendingDealer, setSendingDealer] = useState(false)
  const [toast,         setToast]         = useState<string | null>(null)

  const handleSendToDealer = async (orderId: string) => {
    const dealerEmail = prompt("Enter dealer email:")
    if (!dealerEmail) return
    setSendingDealer(true)
    try {
      const res = await fetch(`${BASE_URL}/api/orders/send-to-dealer`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body:    JSON.stringify({ orderId, dealerEmail }),
      })
      const text = await res.text()
      const data = text ? (() => { try { return JSON.parse(text) } catch { return text } })() : {}
      if (!res.ok) throw new Error(data?.message ?? `Server error ${res.status}`)
      alert("Email sent successfully")
    } catch (error) {
      console.error("Error sending email:", error)
      alert("Failed to send email")
    } finally {
      setSendingDealer(false)
    }
  }

  const statusKey = resolveStatus(order.orderStatus)
  const cfg       = S[statusKey]
  const date      = fmtDate(order.createdAt)
  const customer  = getCustomer(order)

  const PIPELINE = [
    { key: "placed",     label: "Placed",     color: "#9CA3AF", icon: <Package      className="h-3.5 w-3.5" /> },
    { key: "processing", label: "Processing", color: S.processing.color, icon: <Clock        className="h-3.5 w-3.5" /> },
    { key: "shipped",    label: "Shipped",    color: S.shipped.color,    icon: <Truck        className="h-3.5 w-3.5" /> },
    { key: "delivered",  label: "Delivered",  color: S.delivered.color,  icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  ]

  const currentIdx = PIPELINE.findIndex(p => p.key === statusKey)

  const handle = async (s: StatusKey) => {
    if (s === statusKey || busy) return
    setBusy(s)
    setOrders(prev => prev.map(o => o._id === order._id ? { ...o, orderStatus: s } : o))
    try {
      await updateStatus(order._id, s)
      setToast("Status updated")
      setDone(s)
      setTimeout(() => setDone(null), 1800)
      setTimeout(() => setToast(null), 2500)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="border-b last:border-b-0" style={{ borderColor: "#F3F4F6" }}>

      {/* ── Table row ────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full text-left transition-colors duration-150 hover:bg-gray-50"
        style={{ background: expanded ? "#F8FAFF" : undefined }}
      >
        <div
          className="grid items-center gap-6 px-6 py-5"
          style={{ gridTemplateColumns: "60px 180px 1fr 160px 120px 80px", minHeight: 80 }}
        >

          {/* Col 1 — Product image stack */}
          {(() => {
            const products       = order.products ?? []
            const visibleImages  = products.slice(0, 2)
            const remainingCount = products.length - 2
            const tooltipText    = products.length === 0
              ? ""
              : products.length <= 3
                ? products.map(p => typeof p.productId === "object" ? p.productId?.name : p.name).filter(Boolean).join(", ")
                : `${products.length} items`
            return (
              <div className="flex items-center -space-x-2" title={tooltipText}>
                {visibleImages.map((item, i) => {
                  const img  = typeof item.productId === "object" ? item.productId?.image : undefined
                  const name = typeof item.productId === "object" ? item.productId?.name : item.name
                  return (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                      style={{
                        background: "#F3F4F6",
                        minWidth: 32, minHeight: 32,
                        position: "relative", zIndex: visibleImages.length - i,
                        border: "1.5px solid #E5E7EB",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.10), 0 0 0 1.5px #fff",
                      }}
                      title={name}
                    >
                      {img
                        ? <img src={img} alt={name ?? ""} className="w-full h-full object-cover" />
                        : <Package className="h-3 w-3" style={{ color: "#D1D5DB" }} />
                      }
                    </div>
                  )
                })}
                {remainingCount > 0 && (
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shadow-sm"
                    style={{ background: "#F3F4F6", color: "#64748B", position: "relative", zIndex: 0 }}
                    title={tooltipText}
                  >
                    +{remainingCount}
                  </div>
                )}
              </div>
            )
          })()}

          {/* Col 2 — Order ID + date */}
          <div className="min-w-0 text-center">
            <p className="text-sm font-semibold truncate" style={{ color: "#111827" }}>
              {order.orderId ?? `#${order._id.slice(-8).toUpperCase()}`}
            </p>
            <p className="mt-0.5 text-xs" style={{ color: "#9CA3AF" }}>{date}</p>
          </div>

          {/* Col 3 — Customer */}
          <div className="min-w-0 text-center">
            <p className="text-sm font-medium truncate" style={{ color: "#1F2937" }}>{customer.name}</p>
            <p className="mt-0.5 text-xs truncate" style={{ color: "#9CA3AF" }}>{customer.phone}</p>
          </div>

          {/* Col 4 — Status badge */}
          <div className="flex items-center justify-center">
            <span
              className="inline-flex items-center justify-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
            >
              {cfg.icon}
              {cfg.label}
            </span>
          </div>

          {/* Col 5 — Amount */}
          <div className="text-center">
            <p className="text-sm font-semibold tabular-nums" style={{ color: "#111827" }}>{fmt(order.totalAmount)}</p>
            <p className="mt-0.5 text-xs tabular-nums" style={{ color: "#9CA3AF" }}>
              {order.products?.length ?? 0} item{(order.products?.length ?? 0) !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Col 6 — Chevron */}
          <div className="flex justify-end">
            <ChevronDown
              className="h-4 w-4 shrink-0 transition-transform duration-200"
              style={{ color: "#D1D5DB", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </div>

        </div>
      </button>

      {/* ── Expanded detail panel ────────────────────────────────────────────── */}
      {expanded && (
        <div className="border-t" style={{ borderColor: "#F3F4F6", background: "#FAFAFA" }}>
          <div className="mx-auto max-w-5xl px-8 py-8 space-y-8">

            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-semibold" style={{ color: "#111827" }}>
                  {order.orderId ?? `#${order._id.slice(-8).toUpperCase()}`}
                </p>
                <p className="mt-1 text-sm" style={{ color: "#9CA3AF" }}>Placed on {date}</p>
              </div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
              >
                {cfg.icon}
                {cfg.label}
              </span>
            </div>

            {/* ── Section 1: Customer ────────────────────────────────────────────── */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-widest" style={{ color: "#D1D5DB" }}>Customer</p>
              <div className="bg-white rounded-md border divide-y" style={{ borderColor: "#F3F4F6" }}>
                {[
                  { icon: <User className="h-4 w-4" />,   label: "Name",    val: customer.name    },
                  { icon: <Phone className="h-4 w-4" />,  label: "Phone",   val: customer.phone   },
                  { icon: <MapPin className="h-4 w-4" />, label: "Address", val: customer.address },
                ].map(({ icon, label, val }) => (
                  <div key={label} className="flex items-center gap-4 px-5 py-3.5">
                    <span style={{ color: "#D1D5DB" }}>{icon}</span>
                    <div className="min-w-0">
                      <p className="text-[0.65rem] font-medium uppercase tracking-wider" style={{ color: "#9CA3AF" }}>{label}</p>
                      <p className="mt-0.5 text-sm font-medium truncate" style={{ color: "#111827" }}>{val}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Section 2: Products ────────────────────────────────────────────── */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-widest" style={{ color: "#D1D5DB" }}>Products</p>
              <div className="bg-white rounded-md border overflow-hidden" style={{ borderColor: "#F3F4F6" }}>
                {/* Products header */}
                <div
                  className="grid items-center gap-4 border-b px-5 py-3"
                  style={{ gridTemplateColumns: "64px minmax(0,1fr) 64px 100px 100px", borderColor: "#F3F4F6", background: "#FAFAFA" }}
                >
                  <span />
                  <span className="text-xs font-medium" style={{ color: "#9CA3AF" }}>Product</span>
                  <span className="text-center text-xs font-medium" style={{ color: "#9CA3AF" }}>Qty</span>
                  <span className="text-right text-xs font-medium" style={{ color: "#9CA3AF" }}>Unit Price</span>
                  <span className="text-right text-xs font-medium" style={{ color: "#9CA3AF" }}>Total</span>
                </div>
                {/* Product rows */}
                {order.products?.map((item, i) => {
                  const pid   = typeof item.productId === "object" ? item.productId : null
                  const name  = pid?.name ?? getProductName(item)
                  const img   = pid?.image
                  const price = pid?.price ?? item.price
                  const total = price * item.quantity
                  return (
                    <div
                      key={pid ? `${pid._id}-${i}` : `${String(item.productId)}-${i}`}
                      className="grid items-center gap-4 px-5 py-4 border-b transition-colors duration-150 hover:bg-gray-50 last:border-b-0"
                      style={{ gridTemplateColumns: "64px minmax(0,1fr) 64px 100px 100px", borderColor: "#F3F4F6" }}
                    >
                      {/* Image */}
                      <div style={{
                        width: 64, height: 64, minWidth: 64, minHeight: 64,
                        borderRadius: 6, overflow: "hidden",
                        background: "#F9FAFB",
                        border: "1px solid #E5E7EB",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {img
                          ? <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", objectPosition: "center" }} />
                          : <Package className="h-6 w-6" style={{ color: "#D1D5DB" }} />
                        }
                      </div>
                      {/* Name */}
                      <div style={{ minWidth: 0 }}>
                        <p className="text-sm font-medium truncate" style={{ color: "#111827" }}>{name}</p>
                      </div>
                      {/* Qty */}
                      <p className="text-sm tabular-nums text-center" style={{ color: "#6B7280" }}>{item.quantity}</p>
                      {/* Unit price */}
                      <p className="text-sm tabular-nums text-right" style={{ color: "#6B7280" }}>₹{price}</p>
                      {/* Total */}
                      <p className="text-sm font-semibold tabular-nums text-right" style={{ color: "#111827" }}>₹{total}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* ── Section 3: Payment ─────────────────────────────────────────────── */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-widest" style={{ color: "#D1D5DB" }}>Payment</p>
              <div className="bg-white rounded-md border overflow-hidden" style={{ borderColor: "#F3F4F6" }}>
                {[
                  { label: "Subtotal",     val: order.subtotal },
                  { label: "Logistics",    val: order.logisticsCost },
                  { label: "Installation", val: order.installationCost },
                  { label: "Surcharge",    val: order.techSurcharge },
                  { label: "GST (18%)",    val: order.taxes },
                ].filter(r => (r.val ?? 0) > 0).map(r => (
                  <div key={r.label} className="flex items-center justify-between border-b px-5 py-3" style={{ borderColor: "#F3F4F6" }}>
                    <span className="text-sm" style={{ color: "#6B7280" }}>{r.label}</span>
                    <span className="text-sm tabular-nums" style={{ color: "#374151" }}>{fmt(r.val)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-5 py-4" style={{ background: "#FAFAFA" }}>
                  <span className="text-sm font-semibold" style={{ color: "#111827" }}>Total</span>
                  <span className="text-base font-bold tabular-nums" style={{ color: "#111827" }}>{fmt(order.totalAmount)}</span>
                </div>
                {order.installationCost > 0 && (
                  <div className="flex items-center gap-2 border-t px-5 py-3" style={{ borderColor: "#F3F4F6", background: "#F0FDF4" }}>
                    <Wrench className="h-3.5 w-3.5 shrink-0" style={{ color: "#166534" }} />
                    <span className="text-xs font-medium" style={{ color: "#166534" }}>Installation included</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Section 4: Actions ─────────────────────────────────────────────── */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-widest" style={{ color: "#D1D5DB" }}>Actions</p>
              <div className="bg-white rounded-md border overflow-hidden" style={{ borderColor: "#F3F4F6" }}>

                {/* Status update row */}
                <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: "#F3F4F6" }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#111827" }}>Order Status</p>
                    <p className="mt-0.5 text-xs" style={{ color: "#9CA3AF" }}>Tap to update instantly</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(["processing", "shipped", "delivered", "cancelled"] as StatusKey[]).map(s => {
                      const isCurrent = statusKey === s
                      const isBusy    = busy === s
                      return (
                        <button
                          key={s}
                          onClick={e => { e.stopPropagation(); handle(s) }}
                          disabled={!!busy || isCurrent}
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 disabled:cursor-default"
                          style={{
                            background: isCurrent ? S[s].bg    : "#F9FAFB",
                            color:      isCurrent ? S[s].color : "#6B7280",
                            border:     isCurrent ? `1.5px solid ${S[s].border}` : "1.5px solid #E5E7EB",
                            opacity:    busy && !isCurrent ? 0.45 : 1,
                          }}
                        >
                          {isBusy
                            ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            : S[s].icon
                          }
                          {S[s].label}
                        </button>
                      )
                    })}
                    {toast && !busy && (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium"
                        style={{ background: "#F0FDF4", color: "#166534", border: "1px solid #DCFCE7" }}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Updated
                      </span>
                    )}
                  </div>
                </div>

                {/* Send to Dealer row */}
                <div className="flex items-center justify-between px-5 py-4">
                  <div>
                    <p className="text-sm font-medium" style={{ color: "#111827" }}>Send to Dealer</p>
                    <p className="mt-0.5 text-xs" style={{ color: "#9CA3AF" }}>Forward order details by email</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); handleSendToDealer(order._id) }}
                    disabled={sendingDealer}
                    className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150 hover:bg-gray-800 disabled:opacity-60"
                    style={{ background: "#111827", color: "#fff" }}
                  >
                    {sendingDealer
                      ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      : <Send className="h-3.5 w-3.5" />
                    }
                    Send
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
