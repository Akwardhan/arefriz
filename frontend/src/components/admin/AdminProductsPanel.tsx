"use client"

import { useEffect, useState, useCallback } from "react"
import { ChevronDown, RefreshCw, EyeOff, Eye, Package, AlertCircle } from "lucide-react"
import { BASE_URL } from "@/lib/config"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Product {
  _id:        string
  name:       string
  brand:      string
  category:   string
  price:      number
  image?:     string | null
  status:     string
  dealerName?: string
  createdAt?: string
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { value: "latest",     label: "Latest"           },
  { value: "oldest",     label: "Oldest"           },
  { value: "price_high", label: "Price: High → Low" },
  { value: "price_low",  label: "Price: Low → High" },
]

const STATUS_OPTIONS = [
  { value: "all",      label: "All Statuses" },
  { value: "approved", label: "Approved"     },
  { value: "pending",  label: "Pending"      },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminProductsPanel() {
  const [products,   setProducts]   = useState<Product[]>([])
  const [companies,  setCompanies]  = useState<string[]>([])
  const [company,    setCompany]    = useState("all")
  const [status,     setStatus]     = useState("all")
  const [sort,       setSort]       = useState("latest")
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState("")
  const [toggling,   setToggling]   = useState<string | null>(null)
  const [page,       setPage]       = useState(1)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const token = sessionStorage.getItem("adminToken")
      const params = new URLSearchParams()
      if (company !== "all") params.set("company", company)
      if (status  !== "all") params.set("status",  status)
      params.set("sort", sort)

      const res = await fetch(`${BASE_URL}/api/admin/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      setProducts(data.products ?? [])
      // Preserve selected company if it still exists
      setCompanies(data.companies ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [company, status, sort])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => { setPage(1) }, [company, status, sort])

  async function toggleStatus(id: string) {
    setToggling(id)
    try {
      const token = sessionStorage.getItem("adminToken")
      const res = await fetch(`${BASE_URL}/api/admin/products/${id}/status`, {
        method:  "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to update")
      const updated = await res.json()
      setProducts(prev => prev.map(p => p._id === id ? { ...p, status: updated.status } : p))
    } catch {
      // silent — the button re-enables
    } finally {
      setToggling(null)
    }
  }

  const ADMIN_PAGE_SIZE = 10
  const totalPages      = Math.max(1, Math.ceil(products.length / ADMIN_PAGE_SIZE))
  const paginated       = products.slice((page - 1) * ADMIN_PAGE_SIZE, page * ADMIN_PAGE_SIZE)

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">

      {/* ── Header ── */}
      <div className="mb-8">
        <p className="mb-1.5 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-blue-500">
          Admin · Products
        </p>
        <h1 className="text-[1.75rem] font-extrabold tracking-[-0.025em] text-gray-900">
          Product Management
        </h1>
        <p className="mt-1.5 text-[0.83rem] text-gray-400">
          Monitor and manage product visibility across all dealers.
        </p>
      </div>

      {/* ── Filters ── */}
      <div className="mb-6 flex flex-wrap items-center gap-3">

        {/* Company */}
        <div className="relative">
          <select
            value={company}
            onChange={e => setCompany(e.target.value)}
            className="appearance-none h-9 rounded-lg border border-gray-200 bg-white pl-3 pr-8 text-[0.83rem] text-gray-700 outline-none cursor-pointer hover:border-gray-300 transition-colors"
          >
            <option value="all">All Companies</option>
            {companies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        </div>

        {/* Status */}
        <div className="relative">
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="appearance-none h-9 rounded-lg border border-gray-200 bg-white pl-3 pr-8 text-[0.83rem] text-gray-700 outline-none cursor-pointer hover:border-gray-300 transition-colors"
          >
            {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="appearance-none h-9 rounded-lg border border-gray-200 bg-white pl-3 pr-8 text-[0.83rem] text-gray-700 outline-none cursor-pointer hover:border-gray-300 transition-colors"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
        </div>

        <button
          onClick={fetchProducts}
          className="flex items-center gap-1.5 h-9 rounded-lg border border-gray-200 px-3 text-[0.83rem] text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>

        <span className="ml-auto text-[0.78rem] text-gray-400">
          {products.length} product{products.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={fetchProducts} className="ml-auto text-[0.78rem] font-semibold text-red-500 hover:underline">Retry</button>
        </div>
      )}

      {/* ── Skeleton ── */}
      {loading && products.length === 0 && (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-4 border-b border-gray-50 px-5 py-3.5 last:border-0">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-gray-100" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-48 animate-pulse rounded-full bg-gray-100" />
                <div className="h-2.5 w-24 animate-pulse rounded-full bg-gray-100" />
              </div>
              <div className="h-3 w-16 animate-pulse rounded-full bg-gray-100" />
              <div className="h-3 w-12 animate-pulse rounded-full bg-gray-100" />
              <div className="h-3 w-20 animate-pulse rounded-full bg-gray-100" />
              <div className="h-3 w-20 animate-pulse rounded-full bg-gray-100" />
              <div className="h-3 w-16 animate-pulse rounded-full bg-gray-100" />
            </div>
          ))}
        </div>
      )}

      {/* ── Empty ── */}
      {!loading && products.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50 px-6 py-20 text-center">
          <Package className="mb-3 h-10 w-10 text-gray-200" strokeWidth={1.25} />
          <p className="text-sm font-semibold text-gray-600">No products found</p>
          <p className="mt-1 text-xs text-gray-400">Try adjusting your filters</p>
        </div>
      )}

      {/* ── Product Table ── */}
      {products.length > 0 && (
          <>
            <div className="overflow-hidden rounded-xl border border-gray-100 bg-white" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              {/* Header */}
              <div
                className="grid items-center border-b border-gray-100 bg-gray-50/70 px-5 py-3"
                style={{ gridTemplateColumns: "2.5fr 1fr 1fr 1fr 1fr 1fr 80px" }}
              >
                {["Product", "Category", "Sub-Type", "Price", "Dealer", "Date", ""].map(h => (
                  <span key={h} className="text-[0.63rem] font-bold uppercase tracking-[0.12em] text-gray-400">{h}</span>
                ))}
              </div>

              {paginated.map(product => {
                const isApproved = product.status === "approved"
                return (
                  <div
                    key={product._id}
                    className={`grid items-center border-b border-gray-50 px-5 py-3.5 last:border-0 hover:bg-gray-50/60 transition-colors ${!isApproved ? "opacity-60" : ""}`}
                    style={{ gridTemplateColumns: "2.5fr 1fr 1fr 1fr 1fr 1fr 80px" }}
                  >
                    {/* Product */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                        {product.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`${BASE_URL}${product.image}`}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-4 w-4 text-gray-200" strokeWidth={1} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[0.85rem] font-semibold text-gray-900 truncate">{product.name}</p>
                          <span className={`shrink-0 inline-block h-1.5 w-1.5 rounded-full ${isApproved ? "bg-emerald-400" : "bg-amber-400"}`}
                            title={isApproved ? "Visible" : "Hidden"} />
                        </div>
                        <p className="text-[0.72rem] text-gray-400 truncate">{product.brand}</p>
                      </div>
                    </div>

                    {/* Category */}
                    <span className="text-[0.78rem] text-gray-600 capitalize">{product.category}</span>

                    {/* Sub-Type — uses brand as fallback if no type field */}
                    <span className="text-[0.78rem] text-gray-500">—</span>

                    {/* Price */}
                    <span className="text-[0.85rem] font-bold text-gray-900">
                      ₹{product.price?.toLocaleString("en-IN")}
                    </span>

                    {/* Dealer */}
                    <span className="text-[0.78rem] text-gray-500 truncate">
                      {product.dealerName ?? "—"}
                    </span>

                    {/* Date */}
                    <span className="text-[0.75rem] text-gray-400">
                      {product.createdAt
                        ? new Date(product.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                        : "—"}
                    </span>

                    {/* Action */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => toggleStatus(product._id)}
                        disabled={toggling === product._id}
                        className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[0.72rem] font-semibold transition-all disabled:opacity-50 ${
                          isApproved
                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        {toggling === product._id ? (
                          <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        ) : isApproved ? (
                          <><EyeOff className="h-3 w-3" /> Hide</>
                        ) : (
                          <><Eye className="h-3 w-3" /> Show</>
                        )}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-5 flex items-center justify-center gap-1">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 rounded-md text-[0.78rem] text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-default transition-colors"
                >
                  ← Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`h-7 w-7 rounded-md text-[0.78rem] font-medium transition-colors ${
                      page === n ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 rounded-md text-[0.78rem] text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-default transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
      )}

    </div>
  )
}
