"use client"

import { useEffect, useState, useMemo } from "react"
import Navbar from "@/components/layout/Navbar"
import { useRequireAuth } from "@/lib/useRequireAuth"
import { Package, MoreHorizontal, ChevronDown, X, CheckCircle2 } from "lucide-react"
import { BASE_URL } from "@/lib/config"

// ── Types ─────────────────────────────────────────────────────────────────────

interface PopulatedProduct {
  _id?:   string
  name?:  string
  image?: string
  price?: number
}

interface OrderProduct {
  productId?: string | PopulatedProduct
  name?:      string
  price?:     number
  quantity?:  number
}

interface Order {
  _id:          string
  orderId?:     string           // → Order Number
  products?:    OrderProduct[]   // → products[0].image for thumbnail
  totalAmount?: number           // → Total Amount
  orderStatus?: string           // → Status
  createdAt?:   string           // → Date Placed
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  processing: { label: "Processing", className: "bg-orange-100 text-orange-600" },
  shipped:    { label: "Shipped",    className: "bg-blue-100 text-blue-600"     },
  delivered:  { label: "Delivered",  className: "bg-gray-200 text-gray-600"     },
  cancelled:  { label: "Cancelled",  className: "bg-red-100 text-red-600"       },
}

const ACTION: Record<string, { label: string; style: string } | null> = {
  processing: { label: "Manage Items", style: "border border-gray-200 text-gray-700 hover:bg-gray-100" },
  shipped:    { label: "Track Order",  style: "bg-blue-600 text-white hover:bg-blue-700"               },
  delivered:  { label: "View Invoice", style: "bg-gray-100 text-gray-700 hover:bg-gray-200"            },
  cancelled:  null,
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
}

function fmtYear(s: string) {
  return new Date(s).getFullYear()
}

function getFirstImage(order: Order): string | undefined {
  const first = order.products?.[0]
  if (!first) return undefined
  if (typeof first.productId === "object" && first.productId?.image) return first.productId.image
  return undefined
}

function getOrderNumber(order: Order): string {
  return order.orderId ?? `#${order._id.slice(-8).toUpperCase()}`
}

function getExtraCount(order: Order): number {
  return Math.max(0, (order.products?.length ?? 1) - 1)
}

const YEARS    = ["All Years", "2025", "2024", "2023"]
const STATUSES = ["All Statuses", "Processing", "Shipped", "Delivered", "Cancelled"]
const PAGE_SIZE = 5

// ── Track Order Modal ─────────────────────────────────────────────────────────

const TIMELINE = [
  { key: "processing", label: "Processing", description: "Order confirmed and being prepared" },
  { key: "shipped",    label: "Shipped",    description: "Order dispatched and on the way"    },
  { key: "delivered",  label: "Delivered",  description: "Order delivered successfully"       },
]

function TrackModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const status = (order.orderStatus ?? "processing").toLowerCase()
  const currentIdx = TIMELINE.findIndex(s => s.key === status)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Track Order</h2>
            <p className="mt-0.5 text-sm text-gray-400">{getOrderNumber(order)}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 transition-colors duration-150"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Timeline */}
        <div className="space-y-0">
          {TIMELINE.map((step, idx) => {
            const isCompleted = idx < currentIdx
            const isCurrent   = idx === currentIdx
            const isUpcoming  = idx > currentIdx
            const isLast      = idx === TIMELINE.length - 1

            return (
              <div key={step.key} className="flex gap-4">
                {/* Circle + connector line */}
                <div className="flex flex-col items-center">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                    style={{
                      background:  isCompleted ? "#16A34A" : isCurrent ? "#2563EB" : "#F9FAFB",
                      borderColor: isCompleted ? "#16A34A" : isCurrent ? "#2563EB" : "#E5E7EB",
                    }}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    ) : isCurrent ? (
                      <div className="h-2.5 w-2.5 rounded-full bg-white" />
                    ) : (
                      <div className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                    )}
                  </div>
                  {!isLast && (
                    <div
                      className="w-0.5 flex-1 my-1"
                      style={{
                        background: isCompleted ? "#16A34A" : "#E5E7EB",
                        minHeight: 28,
                      }}
                    />
                  )}
                </div>

                {/* Step info */}
                <div className="pb-6">
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: isCompleted ? "#16A34A" : isCurrent ? "#2563EB" : "#9CA3AF",
                    }}
                  >
                    {step.label}
                  </p>
                  <p
                    className="mt-0.5 text-xs"
                    style={{ color: isUpcoming ? "#D1D5DB" : "#6B7280" }}
                  >
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="mt-2 w-full rounded-md border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-150"
        >
          Close
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  useRequireAuth()

  const [orders,      setOrders]      = useState<Order[]>([])
  const [mounted,     setMounted]     = useState(false)
  const [yearFilter,  setYearFilter]  = useState("All Years")
  const [statusFilter,setStatusFilter]= useState("All Statuses")
  const [page,        setPage]        = useState(1)
  const [trackOrder,  setTrackOrder]  = useState<Order | null>(null)

  useEffect(() => {
    setMounted(true)

    const fetchOrders = () => {
      const token = localStorage.getItem("token")
      fetch(`${BASE_URL}/api/orders/my`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
        .then(res => res.json())
        .then(data => {
          const list = Array.isArray(data) ? data : Array.isArray(data?.orders) ? data.orders : []
          setOrders(list)
        })
        .catch(() => setOrders([]))
    }

    fetchOrders()
    const interval = setInterval(fetchOrders, 20000)
    return () => clearInterval(interval)
  }, [])

  const filtered = useMemo(() => {
    return orders.filter(o => {
      const status = (o.orderStatus ?? "processing").toLowerCase()
      const year   = o.createdAt ? String(fmtYear(o.createdAt)) : ""
      if (yearFilter !== "All Years" && year !== yearFilter) return false
      if (statusFilter !== "All Statuses" && status !== statusFilter.toLowerCase()) return false
      return true
    })
  }, [orders, yearFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Order History</h1>
            <p className="mt-2 text-sm text-gray-500 max-w-xl">
              Track your purchases, check delivery status, and manage your orders all in one place.
            </p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="relative">
              <select
                value={yearFilter}
                onChange={e => { setYearFilter(e.target.value); setPage(1) }}
                className="appearance-none rounded-md border border-gray-200 bg-white pl-3 pr-8 py-2 text-sm text-gray-700 outline-none cursor-pointer hover:border-gray-300 transition-colors"
              >
                {YEARS.map(y => <option key={y}>{y}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                className="appearance-none rounded-md border border-gray-200 bg-white pl-3 pr-8 py-2 text-sm text-gray-700 outline-none cursor-pointer hover:border-gray-300 transition-colors"
              >
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* ── Empty state ─────────────────────────────────────────────────────── */}
        {mounted && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
              <Package className="h-7 w-7 text-gray-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-gray-700">No orders found</p>
            <p className="mt-1 text-xs text-gray-400">Try adjusting your filters</p>
          </div>
        )}

        {/* ── Orders list ─────────────────────────────────────────────────────── */}
        {paginated.length > 0 && (
          <div className="space-y-6">
            {paginated.map(order => {
              const status  = (order.orderStatus ?? "processing").toLowerCase()
              const badge   = STATUS_BADGE[status] ?? STATUS_BADGE.processing
              const action  = ACTION[status]        ?? ACTION.processing
              const img        = getFirstImage(order)
              const displayId  = getOrderNumber(order)
              const extraCount = getExtraCount(order)

              return (
                <div
                  key={order._id}
                  className="grid w-full items-center rounded-xl bg-gray-50 p-6"
                  style={{ gridTemplateColumns: "96px 1fr 200px 220px", gap: "2rem", minHeight: 128 }}
                >
                  {/* Col 1 — Image (fixed 96×96) */}
                  <div
                    style={{ width: 96, height: 96, minWidth: 96, minHeight: 96 }}
                    className="self-center rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center"
                  >
                    {img ? (
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Package className="h-8 w-8 text-gray-300" strokeWidth={1.5} />
                    )}
                  </div>

                  {/* Col 2 — Order number */}
                  <div className="self-center" style={{ minWidth: 0 }}>
                    <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">Order Number</p>
                    <p className="font-semibold text-gray-900 truncate">{displayId}</p>
                    {extraCount > 0 && (
                      <p className="mt-1 text-xs text-gray-400">
                        +{extraCount} more item{extraCount > 1 ? "s" : ""}
                      </p>
                    )}
                  </div>

                  {/* Col 3 — Date + Amount (stacked, fixed width) */}
                  <div className="self-center space-y-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">Date Placed</p>
                      <p className="text-sm font-medium text-gray-900 whitespace-nowrap">
                        {order.createdAt ? fmtDate(order.createdAt) : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-1">Total Amount</p>
                      <p className="text-sm font-semibold text-gray-900 tabular-nums whitespace-nowrap">
                        {order.totalAmount != null ? `₹${order.totalAmount.toLocaleString("en-IN")}` : "—"}
                      </p>
                    </div>
                  </div>

                  {/* Col 4 — Status + Action + Menu (right-aligned column) */}
                  <div className="self-center flex flex-col items-end gap-3">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${badge.className}`}>
                      {badge.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => status === "shipped" && setTrackOrder(order)}
                        className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors duration-150 ${action.style}`}
                      >
                        {action.label}
                      </button>
                      <button className="flex items-center justify-center h-9 w-9 rounded-md text-gray-400 hover:bg-gray-200 transition-colors duration-150">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-md text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-default transition-colors"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-8 w-8 rounded-md text-sm font-medium transition-colors ${
                  page === n
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-md text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-default transition-colors"
            >
              Next →
            </button>
          </div>
        )}

      </div>

      {/* ── Track Order modal ─────────────────────────────────────────────────── */}
      {trackOrder && (
        <TrackModal order={trackOrder} onClose={() => setTrackOrder(null)} />
      )}

    </div>
  )
}
