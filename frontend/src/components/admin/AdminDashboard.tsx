"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  LayoutGrid, MessageSquare, ShoppingBag, Sparkles, ChevronDown,
  Package, User, Mail, Phone, Building2, Clock, CheckCircle2,
  Archive, Circle, Search, RefreshCw, Send, CornerDownRight,
  X, Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import AddProductPanel from "@/components/admin/AddProductPanel"
import { BASE_URL } from "@/lib/config"
import { authHeaders } from "@/lib/auth"

// ── Types ─────────────────────────────────────────────────────────────────────

type InquiryStatus = "unread" | "open" | "closed" | "archived"

interface Inquiry {
  _id:          string
  name?:        string
  email?:       string
  phone?:       string
  company?:     string
  // backend may return product info in several shapes
  productName?: string
  productId?:   string | { _id?: string; name?: string }
  product?:     { _id?: string; name?: string }
  message?:     string
  status?:      InquiryStatus
  createdAt?:   string
  [key: string]: unknown
}

// Resolve product name regardless of how the backend shapes the field
function getProductName(inq: Inquiry): string | undefined {
  if (inq.productName) return inq.productName
  if (typeof inq.productId === "object" && inq.productId?.name) return inq.productId.name
  if (inq.product?.name) return inq.product.name
  // fall back to any other string field the backend might use
  const raw = (inq as Record<string, unknown>)
  if (typeof raw.product_name === "string" && raw.product_name) return raw.product_name
  return undefined
}

function getProductId(inq: Inquiry): string | undefined {
  if (typeof inq.productId === "string" && inq.productId) return inq.productId
  if (typeof inq.productId === "object" && inq.productId?._id) return inq.productId._id
  if (inq.product?._id) return inq.product._id
  return undefined
}

// ── Status config ──────────────────────────────────────────────────────────────

const S: Record<InquiryStatus, {
  label: string; color: string; bg: string; border: string; glow: string;
  icon: React.ReactNode
}> = {
  unread: {
    label: "Unread", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE",
    glow: "rgba(37,99,235,0.12)",
    icon: <Circle className="h-3 w-3 fill-current" />,
  },
  open: {
    label: "Open", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A",
    glow: "rgba(217,119,6,0.12)",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  closed: {
    label: "Closed", color: "#16A34A", bg: "#F0FDF4", border: "#BBF7D0",
    glow: "rgba(22,163,74,0.12)",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  archived: {
    label: "Archived", color: "#94A3B8", bg: "#F8FAFC", border: "#E2E8F0",
    glow: "rgba(0,0,0,0.04)",
    icon: <Archive className="h-3.5 w-3.5" />,
  },
}

const resolveStatus = (s?: string): InquiryStatus => {
  if (s === "open" || s === "closed" || s === "archived") return s
  return "unread"
}

const fmtDate = (s?: string) =>
  s ? new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"

// ── Root component ─────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [tab, setTab] = useState<"add" | "inquiries">("add")

  return (
    <div>
      {/* ── Glassmorphism nav ── */}
      <div
        className="sticky top-0 z-20 border-b border-white/50 bg-white/75 backdrop-blur-xl"
        style={{ boxShadow: "0 1px 0 rgba(99,102,241,0.07), 0 4px 24px rgba(0,0,0,0.04)" }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center gap-3 py-3">

            {/* Brand mark */}
            <div className="flex items-center gap-2.5 border-r border-gray-200/70 pr-5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{
                  background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)",
                  boxShadow: "0 2px 10px rgba(79,70,229,0.4)",
                }}
              >
                <Sparkles className="h-4 w-4 text-white" strokeWidth={2} />
              </div>
              <div>
                <p className="text-[0.72rem] font-black uppercase tracking-[0.15em] text-gray-700">Admin</p>
                <p className="text-[0.58rem] font-semibold uppercase tracking-[0.1em] text-gray-300 leading-none">Console</p>
              </div>
            </div>

            {/* Tabs */}
            <nav className="flex items-center gap-1 ml-1">
              {([
                { key: "add",       label: "Products",  Icon: LayoutGrid    },
                { key: "inquiries", label: "Inquiries", Icon: MessageSquare },
              ] as const).map(({ key, label, Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3.5 py-2 text-[0.78rem] font-semibold transition-all duration-200",
                    tab === key
                      ? "text-white"
                      : "text-gray-400 hover:bg-white/80 hover:text-gray-700 hover:shadow-sm",
                  )}
                  style={tab === key ? {
                    background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)",
                    boxShadow: "0 2px 12px rgba(79,70,229,0.32), inset 0 1px 0 rgba(255,255,255,0.15)",
                  } : {}}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}

              <Link
                href="/admin/orders"
                className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-[0.78rem] font-semibold text-gray-400 transition-all duration-200 hover:bg-white/80 hover:text-gray-700 hover:shadow-sm"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                Orders
              </Link>
            </nav>

          </div>
        </div>
      </div>

      {/* Panels */}
      {tab === "add"       && <AddProductPanel />}
      {tab === "inquiries" && <InquiriesPanel />}
    </div>
  )
}

// ── Inquiries Panel ───────────────────────────────────────────────────────────

function InquiriesPanel() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState<InquiryStatus | "all">("all")
  const [search,    setSearch]    = useState("")

  const fetchInquiries = () => {
    setLoading(true)
    fetch(`${BASE_URL}/api/inquiries`, { headers: authHeaders() })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: Inquiry[]) => { setInquiries(data); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchInquiries() }, [])

  const updateStatus = async (id: string, status: InquiryStatus) => {
    setInquiries((prev) =>
      prev.map((inq) => (inq._id === id ? { ...inq, status } : inq)),
    )
    await fetch(`${BASE_URL}/api/inquiries/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body:    JSON.stringify({ status }),
    }).catch(() => {/* silent */})
  }

  const counts = {
    all:      inquiries.length,
    unread:   inquiries.filter((i) => resolveStatus(i.status) === "unread").length,
    open:     inquiries.filter((i) => resolveStatus(i.status) === "open").length,
    closed:   inquiries.filter((i) => resolveStatus(i.status) === "closed").length,
    archived: inquiries.filter((i) => resolveStatus(i.status) === "archived").length,
  }

  const TABS: { key: InquiryStatus | "all"; label: string; count: number; color: string }[] = [
    { key: "all",      label: "All",      count: counts.all,      color: "#6366F1" },
    { key: "unread",   label: "Unread",   count: counts.unread,   color: S.unread.color },
    { key: "open",     label: "Open",     count: counts.open,     color: S.open.color },
    { key: "closed",   label: "Closed",   count: counts.closed,   color: S.closed.color },
    { key: "archived", label: "Archived", count: counts.archived, color: S.archived.color },
  ]

  const q = search.trim().toLowerCase()
  const visible = inquiries.filter((inq) => {
    if (filter !== "all" && resolveStatus(inq.status) !== filter) return false
    if (q) {
      const haystack = [inq.name, inq.email, inq.company, getProductName(inq)].join(" ").toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })

  return (
    <div className="min-h-screen" style={{ background: "#F8FAFC" }}>
      <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between">
          <div>
            <p className="mb-1 text-[0.65rem] font-bold uppercase tracking-[0.2em]" style={{ color: "#6366F1" }}>
              Admin · Inquiries
            </p>
            <h1 className="text-[1.6rem] font-extrabold tracking-[-0.025em]" style={{ color: "#0F172A" }}>
              Customer Inquiries
            </h1>
            <p className="mt-1 text-sm" style={{ color: "#94A3B8" }}>
              {counts.all} total · {counts.unread} unread
            </p>
          </div>
          <button
            onClick={fetchInquiries}
            className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-xs font-medium transition-all hover:border-slate-300 hover:shadow-sm active:scale-95"
            style={{ borderColor: "#E2E8F0", color: "#64748B" }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        {/* ── Stat tabs ── */}
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {TABS.map(({ key, label, count, color }) => {
            const active = filter === key
            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="group rounded-xl border bg-white p-3.5 text-left transition-all duration-150 hover:shadow-md active:scale-[0.98]"
                style={{
                  borderColor:     active ? color : "#E2E8F0",
                  boxShadow:       active ? `0 0 0 1px ${color}30, 0 4px 16px ${color}18` : "0 1px 2px rgba(0,0,0,0.04)",
                  borderLeftWidth: active ? "3px" : "1px",
                  borderLeftColor: active ? color : "#E2E8F0",
                }}
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-wider" style={{ color: active ? color : "#94A3B8" }}>
                  {label}
                </p>
                <p className="mt-1 text-2xl font-bold leading-none" style={{ color: active ? color : "#0F172A" }}>
                  {count}
                </p>
              </button>
            )
          })}
        </div>

        {/* ── Search ── */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "#CBD5E1" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, company, or product…"
            className="h-9 w-full rounded-lg border bg-white pl-9 pr-8 text-sm outline-none transition-all"
            style={{ borderColor: "#E2E8F0", color: "#0F172A" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#6366F1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.12)" }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none" }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 text-base leading-none transition-colors">×</button>
          )}
        </div>

        {/* ── Skeleton ── */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[72px] animate-pulse rounded-xl border bg-white" style={{ borderColor: "#E2E8F0" }} />
            ))}
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && visible.length === 0 && (
          <div className="flex flex-col items-center gap-4 rounded-xl border bg-white py-20 text-center" style={{ borderColor: "#E2E8F0" }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ background: "#F1F5F9" }}>
              <MessageSquare className="h-5 w-5" style={{ color: "#CBD5E1" }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#475569" }}>
                {q ? `No results for "${search}"` : filter === "all" ? "No inquiries yet" : `No ${filter} inquiries`}
              </p>
              <p className="mt-1 text-xs" style={{ color: "#94A3B8" }}>
                {q ? "Try a different search term" : "Customer inquiries will appear here"}
              </p>
            </div>
          </div>
        )}

        {/* ── List ── */}
        {!loading && visible.length > 0 && (
          <div className="space-y-3">
            {visible.map((inq) => (
              <InquiryCard
                key={inq._id}
                inq={inq}
                updateStatus={updateStatus}
              />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

// ── Inquiry Card ───────────────────────────────────────────────────────────────

function InquiryCard({
  inq,
  updateStatus,
}: {
  inq:          Inquiry
  updateStatus: (id: string, status: InquiryStatus) => void
}) {
  const [expanded,   setExpanded]   = useState(false)
  const [replying,   setReplying]   = useState(false)
  const [replyText,  setReplyText]  = useState("")
  const [replyState, setReplyState] = useState<"idle" | "sending" | "sent" | "error">("idle")

  const statusKey  = resolveStatus(inq.status)
  const cfg        = S[statusKey]
  const productName = getProductName(inq)
  const productId   = getProductId(inq)

  const TRANSITIONS: { key: InquiryStatus; label: string }[] = (
    [
      { key: "open",     label: "Mark Open"     },
      { key: "closed",   label: "Mark Closed"   },
      { key: "archived", label: "Archive"        },
    ] as { key: InquiryStatus; label: string }[]
  ).filter((t) => t.key !== statusKey)

  async function sendReply() {
    if (!replyText.trim()) return
    setReplyState("sending")
    try {
      const res = await fetch(`${BASE_URL}/api/inquiries/${inq._id}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body:    JSON.stringify({ reply: replyText, email: inq.email }),
      })
      if (!res.ok) throw new Error()
      setReplyState("sent")
      updateStatus(inq._id, "closed")
      setTimeout(() => {
        setReplying(false)
        setReplyText("")
        setReplyState("idle")
      }, 2000)
    } catch {
      setReplyState("error")
      setTimeout(() => setReplyState("idle"), 3000)
    }
  }

  return (
    <div
      className="overflow-hidden rounded-xl border bg-white transition-all duration-200"
      style={{
        borderColor: expanded ? cfg.color + "50" : "#E2E8F0",
        boxShadow:   expanded
          ? `0 0 0 1px ${cfg.color}20, 0 4px 20px ${cfg.glow}`
          : "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      {/* ── Collapsed row ── */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left transition-colors hover:bg-slate-50/60"
      >
        <div className="flex items-center gap-4 px-5 py-4">

          {/* Status dot + customer */}
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: cfg.color, boxShadow: statusKey === "unread" ? `0 0 0 3px ${cfg.color}25` : "none" }}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-none" style={{ color: "#0F172A" }}>
                {inq.name ?? "—"}
              </p>
              {inq.company && (
                <p className="mt-0.5 text-xs" style={{ color: "#94A3B8" }}>{inq.company}</p>
              )}
            </div>
          </div>

          {/* Product pill */}
          {productName && (
            <div
              className="hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 sm:flex"
              style={{ background: "#F1F5F9", border: "1px solid #E2E8F0" }}
            >
              <Package className="h-3 w-3 shrink-0" style={{ color: "#94A3B8" }} />
              <span className="max-w-[160px] truncate text-[0.72rem] font-medium" style={{ color: "#475569" }}>
                {productName}
              </span>
            </div>
          )}

          {/* Status badge */}
          <span
            className="hidden shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold sm:inline-flex"
            style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
          >
            {cfg.icon}
            {cfg.label}
          </span>

          {/* Date */}
          <p className="hidden shrink-0 text-xs md:block" style={{ color: "#94A3B8" }}>
            {fmtDate(inq.createdAt)}
          </p>

          <ChevronDown
            className="h-4 w-4 shrink-0 transition-transform duration-200"
            style={{ color: "#CBD5E1", transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </div>
      </button>

      {/* ── Expanded panel ── */}
      {expanded && (
        <div className="border-t" style={{ borderColor: "#F1F5F9" }}>

          {/* ── 3-column detail grid ── */}
          <div
            className="grid grid-cols-1 divide-y sm:grid-cols-3 sm:divide-x sm:divide-y-0"
            style={{ borderColor: "#F1F5F9" }}
          >
            {/* Col 1 — Customer */}
            <div className="px-5 py-5">
              <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-widest" style={{ color: "#CBD5E1" }}>
                Customer
              </p>
              <div className="space-y-2.5">
                {[
                  { icon: <User      className="h-3.5 w-3.5" />, val: inq.name    ?? "—", field: "name"    },
                  { icon: <Mail      className="h-3.5 w-3.5" />, val: inq.email   ?? "—", field: "email"   },
                  { icon: <Phone     className="h-3.5 w-3.5" />, val: inq.phone   ?? "—", field: "phone"   },
                  { icon: <Building2 className="h-3.5 w-3.5" />, val: inq.company ?? "—", field: "company" },
                ].map(({ icon, val, field }) => (
                  <div key={field} className="flex items-start gap-2.5">
                    <span className="mt-0.5 shrink-0" style={{ color: "#94A3B8" }}>{icon}</span>
                    <span className="text-sm break-all" style={{ color: field === "name" ? "#1E293B" : "#475569", fontWeight: field === "name" ? 500 : 400 }}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 2 — Product context */}
            <div className="px-5 py-5">
              <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-widest" style={{ color: "#CBD5E1" }}>
                Regarding
              </p>
              {productName ? (
                <div
                  className="flex items-start gap-3 rounded-xl p-3.5"
                  style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
                >
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                    style={{ background: "#EFF6FF" }}
                  >
                    <Package className="h-4 w-4" style={{ color: "#2563EB" }} strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug" style={{ color: "#1E293B" }}>
                      {productName}
                    </p>
                    {productId && (
                      <p className="mt-1 font-mono text-[0.68rem]" style={{ color: "#94A3B8" }}>
                        SKU · {productId.toUpperCase().slice(0, 10)}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm" style={{ color: "#CBD5E1" }}>No product specified</p>
              )}

              {/* Date + received */}
              <div className="mt-4 flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 shrink-0" style={{ color: "#CBD5E1" }} />
                <span className="text-xs" style={{ color: "#94A3B8" }}>Received {fmtDate(inq.createdAt)}</span>
              </div>
            </div>

            {/* Col 3 — Message */}
            <div className="px-5 py-5">
              <p className="mb-3 text-[0.65rem] font-semibold uppercase tracking-widest" style={{ color: "#CBD5E1" }}>
                Message
              </p>
              {inq.message ? (
                <div
                  className="rounded-xl p-3.5"
                  style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "#334155" }}>
                    {inq.message}
                  </p>
                </div>
              ) : (
                <p className="text-sm" style={{ color: "#CBD5E1" }}>No message provided</p>
              )}
            </div>
          </div>

          {/* ── Reply compose area ── */}
          {replying && (
            <div className="border-t px-5 py-4" style={{ borderColor: "#F1F5F9", background: "#FAFBFC" }}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CornerDownRight className="h-3.5 w-3.5" style={{ color: "#6366F1" }} />
                  <span className="text-[0.72rem] font-semibold uppercase tracking-[0.1em]" style={{ color: "#6366F1" }}>
                    Reply to {inq.email ?? inq.name ?? "customer"}
                  </span>
                </div>
                <button onClick={() => { setReplying(false); setReplyText("") }} className="rounded p-0.5 text-slate-300 hover:text-slate-500 transition-colors">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {replyState === "sent" ? (
                <div className="flex items-center gap-2 rounded-lg px-4 py-3" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                  <CheckCircle2 className="h-4 w-4 shrink-0" style={{ color: "#16A34A" }} />
                  <span className="text-sm font-medium" style={{ color: "#15803D" }}>Reply sent — inquiry marked as closed</span>
                </div>
              ) : (
                <>
                  <textarea
                    rows={4}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={`Write your reply to ${inq.name ?? "the customer"}…`}
                    className="w-full resize-none rounded-lg border bg-white px-3.5 py-2.5 text-sm outline-none transition-all"
                    style={{ borderColor: "#E2E8F0", color: "#334155" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "#6366F1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.1)" }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none" }}
                  />
                  {replyState === "error" && (
                    <p className="mt-1.5 text-xs" style={{ color: "#EF4444" }}>Failed to send — please try again.</p>
                  )}
                  <div className="mt-2.5 flex items-center justify-end gap-2">
                    <button
                      onClick={() => { setReplying(false); setReplyText("") }}
                      className="rounded-lg px-4 py-2 text-xs font-semibold transition-colors hover:bg-slate-100"
                      style={{ color: "#64748B" }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={sendReply}
                      disabled={replyState === "sending" || !replyText.trim()}
                      className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-all active:scale-95 disabled:opacity-60"
                      style={{ background: "#4F46E5", boxShadow: "0 1px 4px rgba(79,70,229,0.28)" }}
                    >
                      {replyState === "sending"
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Send className="h-3.5 w-3.5" />
                      }
                      {replyState === "sending" ? "Sending…" : "Send Reply"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Footer actions ── */}
          <div
            className="flex flex-wrap items-center justify-between gap-2 border-t px-5 py-3"
            style={{ borderColor: "#F1F5F9", background: "#FAFBFC" }}
          >
            {/* Status transitions */}
            <div className="flex flex-wrap items-center gap-1.5">
              {TRANSITIONS.map((t) => {
                const tcfg = S[t.key]
                return (
                  <button
                    key={t.key}
                    onClick={(e) => { e.stopPropagation(); updateStatus(inq._id, t.key) }}
                    className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all hover:shadow-sm active:scale-95"
                    style={{ background: tcfg.bg, color: tcfg.color, borderColor: tcfg.border }}
                  >
                    {tcfg.icon}
                    {t.label}
                  </button>
                )
              })}
            </div>

            {/* Reply button */}
            <button
              onClick={(e) => { e.stopPropagation(); setReplying((v) => !v) }}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold text-white transition-all active:scale-95"
              style={{ background: "#4F46E5", boxShadow: "0 1px 4px rgba(79,70,229,0.28)" }}
            >
              <CornerDownRight className="h-3.5 w-3.5" />
              Reply
            </button>
          </div>

        </div>
      )}
    </div>
  )
}
