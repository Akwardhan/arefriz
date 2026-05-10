"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Plus, Trash2, Package, CheckCircle2, AlertCircle, Upload, X, Sparkles, ChevronDown, Pencil, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { BASE_URL } from "@/lib/config"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Spec { label: string; value: string }

interface DealerProduct {
  _id: string
  name: string
  brand: string
  category: string
  type?: string
  price: number
  image?: string | null
  status: string
  stock?: number
  shortDescription?: string
  description?: string
  createdAt?: string
}

const CATEGORIES = ["valves", "compressors", "controls", "piping", "electrical"] as const

const SORT_OPTIONS = [
  { value: "latest",     label: "Latest"           },
  { value: "oldest",     label: "Oldest"           },
  { value: "price_high", label: "Price: High → Low" },
  { value: "price_low",  label: "Price: Low → High" },
]

const SECTIONS = [
  { id: "basic",       label: "Basic Information"   },
  { id: "pricing",     label: "Pricing & Inventory" },
  { id: "media",       label: "Media"               },
  { id: "description", label: "Description"         },
  { id: "specs",       label: "Specifications"      },
] as const

const EMPTY_FORM = {
  name:             "",
  sku:              "",
  brand:            "",
  category:         "valves" as typeof CATEGORIES[number],
  type:             "",
  price:            "",
  shortDescription: "",
  description:      "",
}

// ── My Products Section ───────────────────────────────────────────────────────

function sortProducts(products: DealerProduct[], sort: string): DealerProduct[] {
  return [...products].sort((a, b) => {
    if (sort === "oldest")     return new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime()
    if (sort === "price_high") return b.price - a.price
    if (sort === "price_low")  return a.price - b.price
    return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
  })
}

// ── Edit Modal ────────────────────────────────────────────────────────────────

interface EditForm {
  name: string; brand: string; category: string; type: string
  price: string; stock: boolean; shortDescription: string; description: string
}

function EditModal({
  product,
  onClose,
  onSaved,
}: {
  product: DealerProduct
  onClose: () => void
  onSaved: (updated: DealerProduct) => void
}) {
  const [form, setForm] = useState<EditForm>({
    name:             product.name,
    brand:            product.brand,
    category:         product.category,
    type:             product.type ?? "",
    price:            String(product.price),
    stock:            (product.stock ?? 1) > 0,
    shortDescription: product.shortDescription ?? "",
    description:      product.description ?? "",
  })
  const [saving,  setSaving]  = useState(false)
  const [errMsg,  setErrMsg]  = useState("")

  function set(field: keyof EditForm, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErrMsg("")
    const token = sessionStorage.getItem("dealerToken")
    if (!token) { setErrMsg("Not authenticated."); setSaving(false); return }

    const fd = new FormData()
    fd.append("name",             form.name)
    fd.append("brand",            form.brand)
    fd.append("category",         form.category)
    fd.append("type",             form.type)
    fd.append("price",            form.price)
    fd.append("stock",            form.stock ? "1" : "0")
    fd.append("shortDescription", form.shortDescription)
    fd.append("description",      form.description)

    try {
      const res = await fetch(`${BASE_URL}/api/dealer/products/${product._id}`, {
        method:  "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body:    fd,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { message?: string }).message ?? `Error ${res.status}`)
      }
      const updated = await res.json()
      onSaved(updated)
    } catch (err) {
      setErrMsg(err instanceof Error ? err.message : "Save failed")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.4)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="h-[3px] w-full rounded-t-2xl" style={{ background: "linear-gradient(90deg,#10b981,#059669)" }} />

        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[1rem] font-bold text-gray-900">Edit Product</h2>
            <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className={labelCls}>Product Name <span className="text-red-400">*</span></label>
                <input required value={form.name} onChange={e => set("name", e.target.value)} className={inputCls} placeholder="Product name" />
              </div>
              <div>
                <label className={labelCls}>Brand <span className="text-red-400">*</span></label>
                <input required value={form.brand} onChange={e => set("brand", e.target.value)} className={inputCls} placeholder="Brand" />
              </div>
              <div>
                <label className={labelCls}>Category <span className="text-red-400">*</span></label>
                <select required value={form.category} onChange={e => set("category", e.target.value)} className={inputCls}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Type</label>
                <input value={form.type} onChange={e => set("type", e.target.value)} className={inputCls} placeholder="e.g. Solenoid" />
              </div>
              <div>
                <label className={labelCls}>Price (₹) <span className="text-red-400">*</span></label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[0.82rem] font-semibold text-gray-400">₹</span>
                  <input required type="number" min={0} value={form.price} onChange={e => set("price", e.target.value)} className={cn(inputCls, "pl-7")} placeholder="0" />
                </div>
              </div>
              <div>
                <label className={labelCls}>Stock</label>
                <div className="flex h-10 overflow-hidden rounded-xl border border-gray-200 text-[0.82rem]">
                  <button type="button" onClick={() => set("stock", true)}
                    className={cn("flex-1 font-semibold transition-all", form.stock ? "text-white" : "bg-white text-gray-400 hover:bg-emerald-50")}
                    style={form.stock ? { background: "linear-gradient(135deg,#10b981,#059669)" } : {}}>
                    In Stock
                  </button>
                  <div className="w-px shrink-0 bg-gray-200" />
                  <button type="button" onClick={() => set("stock", false)}
                    className={cn("flex-1 font-semibold transition-all", !form.stock ? "text-white" : "bg-white text-gray-400 hover:bg-emerald-50")}
                    style={!form.stock ? { background: "linear-gradient(135deg,#10b981,#059669)" } : {}}>
                    Out of Stock
                  </button>
                </div>
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Short Description</label>
                <input value={form.shortDescription} onChange={e => set("shortDescription", e.target.value)} className={inputCls} placeholder="One-line summary" />
              </div>
              <div className="col-span-2">
                <label className={labelCls}>Description</label>
                <textarea rows={3} value={form.description} onChange={e => set("description", e.target.value)}
                  className={cn(inputCls, "h-auto resize-none py-2.5")} placeholder="Full description…" />
              </div>
            </div>

            {errMsg && (
              <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <p className="text-[0.82rem] text-red-600">{errMsg}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="h-9 rounded-xl border border-gray-200 px-4 text-[0.82rem] font-semibold text-gray-500 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex h-9 items-center gap-2 rounded-xl px-4 text-[0.82rem] font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#10b981,#059669)" }}>
                {saving ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : null}
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── My Products Section ───────────────────────────────────────────────────────

const PRODUCTS_PAGE_SIZE = 10

function MyProductsSection() {
  const [products,    setProducts]    = useState<DealerProduct[]>([])
  const [sort,        setSort]        = useState("latest")
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState("")
  const [editProduct, setEditProduct] = useState<DealerProduct | null>(null)
  const [deleting,    setDeleting]    = useState<string | null>(null)
  const [page,        setPage]        = useState(1)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const token = sessionStorage.getItem("dealerToken")
      const res = await fetch(`${BASE_URL}/api/dealer/products?limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      const data = await res.json()
      setProducts(Array.isArray(data) ? data : (data?.products ?? []))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProducts() }, [fetchProducts])
  useEffect(() => { setPage(1) }, [sort])

  async function handleDelete(id: string) {
    if (!confirm("Delete this product? This cannot be undone.")) return
    setDeleting(id)
    try {
      const token = sessionStorage.getItem("dealerToken")
      const res = await fetch(`${BASE_URL}/api/dealer/products/${id}`, {
        method:  "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      setProducts(prev => prev.filter(p => p._id !== id))
    } catch {
      alert("Failed to delete product. Please try again.")
    } finally {
      setDeleting(null)
    }
  }

  const sorted     = sortProducts(products, sort)
  const totalPages = Math.max(1, Math.ceil(sorted.length / PRODUCTS_PAGE_SIZE))
  const paginated  = sorted.slice((page - 1) * PRODUCTS_PAGE_SIZE, page * PRODUCTS_PAGE_SIZE)

  return (
    <section className="mb-12">
      {/* Section header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="mb-1 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-emerald-500">
            Dealer · Products
          </p>
          <h1 className="text-[1.75rem] font-extrabold tracking-[-0.025em] text-gray-900">
            My Listed Products
          </h1>
          {!loading && sorted.length > 0 && (
            <p className="mt-1 text-[0.78rem] text-gray-400">
              {sorted.length} product{sorted.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="appearance-none h-9 rounded-lg border border-gray-200 bg-white pl-3 pr-8 text-[0.82rem] text-gray-700 outline-none cursor-pointer hover:border-gray-300 transition-colors"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          </div>
          <button
            onClick={fetchProducts}
            className="flex items-center gap-1.5 h-9 rounded-lg border border-gray-200 px-3 text-[0.82rem] text-gray-500 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-4 border-b border-gray-50 px-5 py-3.5 last:border-0">
              <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-gray-100" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-48 animate-pulse rounded-full bg-gray-100" />
                <div className="h-2.5 w-24 animate-pulse rounded-full bg-gray-100" />
              </div>
              <div className="h-3 w-16 animate-pulse rounded-full bg-gray-100" />
              <div className="h-3 w-12 animate-pulse rounded-full bg-gray-100" />
              <div className="h-3 w-20 animate-pulse rounded-full bg-gray-100" />
              <div className="h-3 w-16 animate-pulse rounded-full bg-gray-100" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={fetchProducts} className="ml-auto text-[0.78rem] font-semibold text-red-500 hover:underline">Retry</button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && sorted.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-100 bg-gray-50 px-6 py-16 text-center">
          <Package className="mb-3 h-10 w-10 text-gray-200" strokeWidth={1} />
          <p className="text-sm font-semibold text-gray-500">No products yet</p>
          <p className="mt-1 text-xs text-gray-400">Add your first product using the form below.</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && sorted.length > 0 && (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-100 bg-white" style={{ boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            {/* Header row */}
            <div
              className="grid items-center border-b border-gray-100 bg-gray-50/70 px-5 py-3"
              style={{ gridTemplateColumns: "2.5fr 1fr 1fr 1fr 1fr 80px" }}
            >
              {["Product", "Category", "Sub-Type", "Price", "Date", ""].map(h => (
                <span key={h} className="text-[0.63rem] font-bold uppercase tracking-[0.12em] text-gray-400">{h}</span>
              ))}
            </div>

            {paginated.map(product => (
              <div
                key={product._id}
                className="grid items-center border-b border-gray-50 px-5 py-3.5 last:border-0 hover:bg-gray-50/60 transition-colors"
                style={{ gridTemplateColumns: "2.5fr 1fr 1fr 1fr 1fr 80px" }}
              >
                {/* Product */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                    {product.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`${BASE_URL}${product.image}`} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Package className="h-4 w-4 text-gray-200" strokeWidth={1} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[0.85rem] font-semibold text-gray-900 truncate">{product.name}</p>
                      <span
                        className={cn(
                          "shrink-0 inline-block h-1.5 w-1.5 rounded-full",
                          product.status === "approved" ? "bg-emerald-400" : "bg-amber-400"
                        )}
                        title={product.status === "approved" ? "Live" : "Pending"}
                      />
                    </div>
                    <p className="text-[0.72rem] text-gray-400 truncate">{product.brand}</p>
                  </div>
                </div>

                {/* Category */}
                <span className="text-[0.78rem] text-gray-600 capitalize">{product.category}</span>

                {/* Sub-Type */}
                <span className="text-[0.78rem] text-gray-500">{product.type || "—"}</span>

                {/* Price */}
                <span className="text-[0.85rem] font-bold text-gray-900">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>

                {/* Date */}
                <span className="text-[0.75rem] text-gray-400">
                  {product.createdAt
                    ? new Date(product.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                    : "—"}
                </span>

                {/* Actions */}
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => setEditProduct(product)}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                    aria-label="Edit"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    disabled={deleting === product._id}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 transition-colors disabled:opacity-40"
                    aria-label="Delete"
                  >
                    {deleting === product._id
                      ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      : <Trash2 className="h-3.5 w-3.5" />
                    }
                  </button>
                </div>
              </div>
            ))}
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
                  className={cn(
                    "h-7 w-7 rounded-md text-[0.78rem] font-medium transition-colors",
                    page === n ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-100"
                  )}
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

      {/* Edit Modal */}
      {editProduct && (
        <EditModal
          product={editProduct}
          onClose={() => setEditProduct(null)}
          onSaved={(updated) => {
            setProducts(prev => prev.map(p => p._id === updated._id ? { ...p, ...updated } : p))
            setEditProduct(null)
          }}
        />
      )}
    </section>
  )
}

// ── Add Product Page ───────────────────────────────────────────────────────────

export default function DealerProductsPage() {
  const [tab,           setTab]           = useState<"listed" | "add">("listed")
  const [form,          setForm]          = useState(EMPTY_FORM)
  const [specs,         setSpecs]         = useState<Spec[]>([{ label: "", value: "" }])
  const [inStock,       setInStock]       = useState(true)
  const [imageFiles,    setImageFiles]    = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [primaryIndex,  setPrimaryIndex]  = useState(0)
  const [status,        setStatus]        = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errMsg,        setErrMsg]        = useState("")
  const [refreshKey,    setRefreshKey]    = useState(0)

  const previewUrlsRef = useRef<string[]>([])
  useEffect(() => { previewUrlsRef.current = imagePreviews }, [imagePreviews])
  useEffect(() => () => { previewUrlsRef.current.forEach(URL.revokeObjectURL) }, [])

  function set(field: keyof typeof EMPTY_FORM, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files ?? [])
    if (!newFiles.length) return
    const newPreviews = newFiles.map(f => URL.createObjectURL(f))
    setImageFiles(prev => [...prev, ...newFiles])
    setImagePreviews(prev => [...prev, ...newPreviews])
    e.target.value = ""
  }

  function removeImage(i: number) {
    URL.revokeObjectURL(imagePreviews[i])
    setImageFiles(prev => prev.filter((_, idx) => idx !== i))
    setImagePreviews(prev => prev.filter((_, idx) => idx !== i))
    setPrimaryIndex(prev => {
      if (prev === i) return 0
      if (prev > i)  return prev - 1
      return prev
    })
  }

  function addSpec()                                                        { setSpecs(prev => [...prev, { label: "", value: "" }]) }
  function removeSpec(i: number)                                            { setSpecs(prev => prev.filter((_, idx) => idx !== i)) }
  function updateSpec(i: number, key: "label" | "value", val: string)      {
    setSpecs(prev => prev.map((s, idx) => idx === i ? { ...s, [key]: val } : s))
  }

  function reset() {
    setForm(EMPTY_FORM)
    setSpecs([{ label: "", value: "" }])
    setInStock(true)
    previewUrlsRef.current.forEach(URL.revokeObjectURL)
    setImageFiles([])
    setImagePreviews([])
    setPrimaryIndex(0)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setErrMsg("")

    const token = sessionStorage.getItem("dealerToken")
    if (!token) { setStatus("error"); setErrMsg("Not authenticated."); return }

    const fd = new FormData()
    fd.append("name",        form.name)
    fd.append("brand",       form.brand)
    fd.append("category",    form.category)
    fd.append("type",        form.type)
    fd.append("price",       form.price)
    fd.append("stock",       inStock ? "1" : "0")
    fd.append("description", [form.shortDescription, form.description].filter(Boolean).join("\n\n"))
    fd.append("specs",       JSON.stringify(
      specs.filter(s => s.label.trim() && s.value.trim()).map(s => ({ key: s.label, value: s.value }))
    ))
    if (imageFiles.length > 0) {
      const primary = imageFiles[primaryIndex]
      fd.append("image", primary, primary.name)
    }

    try {
      const res = await fetch(`${BASE_URL}/api/dealer/products`, {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
        body:    fd,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(
          (data as { message?: string; error?: string }).message ??
          (data as { error?: string }).error ??
          `Error ${res.status}`
        )
      }
      setStatus("success")
      reset()
      setRefreshKey(k => k + 1)
      setTab("listed")
      setTimeout(() => setStatus("idle"), 4000)
    } catch (err) {
      setStatus("error")
      setErrMsg(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">

      {/* ── Tab bar ── */}
      <div className="mb-8 flex items-center border-b border-gray-100">
        {([
          { key: "listed", label: "Listed Products" },
          { key: "add",    label: "Add Product"     },
        ] as const).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="relative px-5 py-3 text-[0.85rem] font-semibold transition-colors duration-150"
            style={{ color: tab === t.key ? "#111827" : "#9CA3AF" }}
          >
            {t.label}
            {tab === t.key && (
              <span
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                style={{ background: "linear-gradient(90deg,#10b981,#059669)" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Listed Products tab ── */}
      {tab === "listed" && <MyProductsSection key={refreshKey} />}

      {/* ── Add Product tab ── */}
      {tab === "add" && <>

      <div className="mb-8">
        <p className="mb-1.5 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-emerald-500">
          Add New
        </p>
        <h2 className="text-[1.4rem] font-extrabold tracking-[-0.025em] text-gray-900">
          List a New Product
        </h2>
        <p className="mt-1 text-[0.83rem] text-gray-400">
          Fill in all required fields before publishing.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">

        {/* ── Sticky sidebar ── */}
        <aside className="hidden lg:block">
          <div
            className="sticky top-[76px] overflow-hidden rounded-2xl border border-gray-100 bg-white"
            style={{ boxShadow: "0 4px 24px rgba(16,185,129,0.07), 0 0 0 1px rgba(0,0,0,0.03)" }}
          >
            <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, #10b981 0%, #059669 60%, #047857 100%)" }} />

            <div className="p-4">
              <p className="mb-3 px-1.5 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-gray-300">
                Sections
              </p>
              <nav className="space-y-0.5">
                {SECTIONS.map((s, i) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.78rem] font-medium text-gray-500 transition-all hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[0.6rem] font-black text-white"
                      style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)", opacity: 0.85 }}
                    >
                      {i + 1}
                    </span>
                    {s.label}
                  </a>
                ))}
              </nav>

              <div className="mt-5 border-t border-gray-50 pt-4">
                <button
                  type="submit"
                  form="dealer-product-form"
                  disabled={status === "loading"}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl text-[0.82rem] font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    boxShadow: status === "loading" ? "none" : "0 4px 14px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
                  }}
                >
                  {status === "loading"
                    ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    : <Sparkles className="h-3.5 w-3.5" />
                  }
                  {status === "loading" ? "Saving…" : "Publish"}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Form ── */}
        <form id="dealer-product-form" onSubmit={handleSubmit} className="space-y-5">

          {/* 1. Basic Information */}
          <Card id="basic" step={1} title="Basic Information" description="Core product details and categorization.">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Product Name" required>
                  <input required value={form.name} onChange={e => set("name", e.target.value)}
                    placeholder="e.g. Danfoss EVR 10 Solenoid Valve" className={inputCls} />
                </Field>
              </div>
              <Field label="SKU">
                <input value={form.sku} onChange={e => set("sku", e.target.value)}
                  placeholder="e.g. DAN-EVR-10-NC" className={inputCls} />
              </Field>
              <Field label="Brand" required>
                <input required value={form.brand} onChange={e => set("brand", e.target.value)}
                  placeholder="e.g. Danfoss" className={inputCls} />
              </Field>
              <Field label="Category" required>
                <select required value={form.category}
                  onChange={e => set("category", e.target.value as typeof CATEGORIES[number])}
                  className={inputCls}>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </Field>
              <Field label="Type">
                <input value={form.type} onChange={e => set("type", e.target.value)}
                  placeholder="e.g. Solenoid, PLC, VFD" className={inputCls} />
              </Field>
            </div>
          </Card>

          {/* 2. Pricing & Inventory */}
          <Card id="pricing" step={2} title="Pricing & Inventory" description="Set the unit price and current stock status.">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Price (₹)" required>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[0.82rem] font-semibold text-gray-400">₹</span>
                  <input required type="number" min={0} value={form.price}
                    onChange={e => set("price", e.target.value)}
                    placeholder="0" className={cn(inputCls, "pl-7")} />
                </div>
              </Field>
              <Field label="Stock Status">
                <div className="flex h-10 overflow-hidden rounded-lg border border-gray-200 text-[0.82rem]">
                  <button type="button" onClick={() => setInStock(true)}
                    className={cn("flex-1 font-semibold transition-all",
                      inStock ? "text-white" : "bg-white text-gray-400 hover:bg-emerald-50 hover:text-emerald-600")}
                    style={inStock ? { background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" } : {}}>
                    In Stock
                  </button>
                  <div className="w-px shrink-0 bg-gray-200" />
                  <button type="button" onClick={() => setInStock(false)}
                    className={cn("flex-1 font-semibold transition-all",
                      !inStock ? "text-white" : "bg-white text-gray-400 hover:bg-emerald-50 hover:text-emerald-600")}
                    style={!inStock ? { background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" } : {}}>
                    Out of Stock
                  </button>
                </div>
              </Field>
            </div>
          </Card>

          {/* 3. Media */}
          <Card id="media" step={3} title="Media" description="Upload multiple images and set the primary display image.">
            <Field label="Product Images">
              <div className="relative">
                <input type="file" accept="image/*" multiple id="dealer-image-upload"
                  className="sr-only" onChange={handleFileChange} />
                <label
                  htmlFor="dealer-image-upload"
                  className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-3 text-[0.82rem] text-gray-400 transition-all hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-500"
                >
                  <Upload className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {imagePreviews.length > 0
                      ? `${imagePreviews.length} image${imagePreviews.length !== 1 ? "s" : ""} selected — click to add more`
                      : "Choose image files… (select 5 or more)"}
                  </span>
                </label>
              </div>
            </Field>

            {imagePreviews.length > 0 ? (
              <div className="mt-5">
                <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-gray-400">
                  Click an image to set as display
                </p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative">
                      <button type="button" onClick={() => setPrimaryIndex(i)}
                        className={cn("relative aspect-square w-full overflow-hidden rounded-xl border-2 transition-all",
                          primaryIndex === i
                            ? "border-emerald-500 ring-4 ring-emerald-100"
                            : "border-gray-200 hover:border-emerald-300")}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`Image ${i + 1}`} className="h-full w-full object-cover" />
                        {primaryIndex === i && <div className="absolute inset-0 bg-emerald-600/10" />}
                      </button>
                      {primaryIndex === i && (
                        <div
                          className="absolute bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[0.58rem] font-black leading-none text-white"
                          style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
                        >
                          Display
                        </div>
                      )}
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition-colors hover:border-red-200 hover:text-red-500"
                        aria-label="Remove">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-5 flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-100 bg-gray-50/50">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)" }}
                >
                  <Package className="h-5 w-5 text-emerald-200" strokeWidth={1.25} />
                </div>
                <p className="text-[0.75rem] font-medium text-gray-300">Images will appear here</p>
              </div>
            )}
          </Card>

          {/* 4. Description */}
          <Card id="description" step={4} title="Description" description="Shown on the product detail page.">
            <div className="space-y-5">
              <Field label="Short Description">
                <input value={form.shortDescription} onChange={e => set("shortDescription", e.target.value)}
                  placeholder="One or two sentences summarising the product." className={inputCls} />
              </Field>
              <Field label="Full Description">
                <textarea rows={5} value={form.description} onChange={e => set("description", e.target.value)}
                  placeholder="Detailed product description, features, and applications…"
                  className={cn(inputCls, "h-auto resize-none py-2.5")} />
              </Field>
            </div>
          </Card>

          {/* 5. Specifications */}
          <Card id="specs" step={5} title="Technical Specifications" description="Key-value pairs shown in the specs table.">
            <div className="space-y-2.5">
              {specs.length > 0 && (
                <div className="grid grid-cols-[1fr_1fr_36px] gap-3 px-1">
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-gray-300">Attribute</span>
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-gray-300">Value</span>
                </div>
              )}
              {specs.map((spec, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_36px] items-center gap-3">
                  <input value={spec.label} onChange={e => updateSpec(i, "label", e.target.value)}
                    placeholder="e.g. Voltage" className={inputCls} />
                  <input value={spec.value} onChange={e => updateSpec(i, "value", e.target.value)}
                    placeholder="e.g. 220V" className={inputCls} />
                  <button type="button" onClick={() => removeSpec(i)} disabled={specs.length === 1}
                    className="flex h-10 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-300 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Remove">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button type="button" onClick={addSpec}
              className="mt-5 flex items-center gap-2 rounded-lg border border-dashed border-emerald-200 px-4 py-2.5 text-[0.82rem] font-medium text-emerald-400 transition-all hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-600">
              <Plus className="h-3.5 w-3.5" />
              Add Specification
            </button>
          </Card>

          {/* Status banners */}
          {status === "success" && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4"
              style={{ boxShadow: "0 2px 12px rgba(16,185,129,0.08)" }}>
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              <p className="text-[0.85rem] font-semibold text-emerald-700">Product published successfully.</p>
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4"
              style={{ boxShadow: "0 2px 12px rgba(239,68,68,0.08)" }}>
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
              <p className="text-[0.85rem] font-semibold text-red-600">{errMsg}</p>
            </div>
          )}

          {/* Mobile submit */}
          <div className="pb-10 lg:hidden">
            <button type="submit" disabled={status === "loading"}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                boxShadow: status === "loading" ? "none" : "0 4px 20px rgba(16,185,129,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
              }}>
              {status === "loading"
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                : <Sparkles className="h-4 w-4" />
              }
              {status === "loading" ? "Saving…" : "Publish Product"}
            </button>
          </div>

        </form>
      </div>
      </>}

    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Card({ id, step, title, description, children }: {
  id: string; step?: number; title: string; description: string; children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-gray-100 bg-white"
      style={{ boxShadow: "0 2px 16px rgba(16,185,129,0.06), 0 0 0 1px rgba(0,0,0,0.03)" }}
    >
      <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, #10b981 0%, #059669 55%, #047857 100%)" }} />
      <div className="p-8">
        <div className="mb-6 flex items-start gap-4 border-b border-gray-50 pb-5">
          {step !== undefined && (
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[0.72rem] font-black text-white"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                boxShadow: "0 2px 8px rgba(16,185,129,0.3)",
              }}
            >
              {step}
            </div>
          )}
          <div>
            <h2 className="text-[0.95rem] font-bold text-gray-900">{title}</h2>
            <p className="mt-0.5 text-[0.78rem] text-gray-400">{description}</p>
          </div>
        </div>
        {children}
      </div>
    </section>
  )
}

function Field({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-gray-400">
        {label}{required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {children}
    </div>
  )
}

const labelCls = "mb-1 block text-[0.7rem] font-bold uppercase tracking-[0.12em] text-gray-400"

const inputCls =
  "h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 text-[0.88rem] text-gray-900 outline-none transition-all placeholder:text-gray-300 focus:border-emerald-300 focus:bg-white focus:ring-3 focus:ring-emerald-50"
