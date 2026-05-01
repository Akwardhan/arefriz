"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Minus, Plus, Package, CheckCircle2, AlertCircle } from "lucide-react"
import { BASE_URL } from "@/lib/config"
import { userAuthHeaders } from "@/lib/auth"
import { getImageUrl } from "@/lib/imageUrl"
import { useRequireAuth } from "@/lib/useRequireAuth"

// ── Types ─────────────────────────────────────────────────────────────────────

interface PopulatedProduct {
  _id:   string
  name:  string
  image: string
  price: number
  sku?:  string
  stock?: boolean
}

interface CartItem {
  productId: PopulatedProduct | string
  name?:     string   // backend may store name directly on the item
  quantity:  number
  price:     number
}

function pid(item: CartItem): string {
  return typeof item.productId === "object" ? item.productId._id : item.productId
}

function pfield<K extends keyof PopulatedProduct>(item: CartItem, key: K): PopulatedProduct[K] | undefined {
  return typeof item.productId === "object" ? item.productId[key] : undefined
}

function pname(item: CartItem): string {
  return pfield(item, "name") ?? item.name ?? "—"
}

interface CartData {
  products:    CartItem[]
  totalAmount: number
}

// ── Static config ─────────────────────────────────────────────────────────────

const WAREHOUSES = [
  "Mumbai – Andheri",
  "Delhi – Okhla",
  "Bangalore – Whitefield",
  "Chennai – Ambattur",
  "Hyderabad – Nacharam",
] as const

const SHIPPING = {
  standard: { label: "Standard",  price: 500,  time: "5–7 business days" },
  priority: { label: "Priority",  price: 1500, time: "1–2 business days" },
} as const

const TECH_SURCHARGE    = 250
const INSTALLATION_COST = 4000
const GST_RATE          = 0.18

// ── Format helper ─────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

// ── Checkmark SVG ─────────────────────────────────────────────────────────────

function Checkmark() {
  return (
    <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 10 10">
      <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.8"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CheckoutView() {
  useRequireAuth()
  const router = useRouter()

  // Cart
  const [cart,    setCart]    = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Form
  const [name,     setName]     = useState("")
  const [phone,    setPhone]    = useState("")
  const [address,  setAddress]  = useState("")
  const [warehouse, setWarehouse] = useState<typeof WAREHOUSES[number]>(WAREHOUSES[0])
  const [shipping,  setShipping]  = useState<keyof typeof SHIPPING>("standard")
  const [installation, setInstallation] = useState(false)

  // Submit
  const [status, setStatus] = useState<"idle" | "placing" | "success" | "error">("idle")
  const [errMsg, setErrMsg] = useState("")
  const [isPlacingOrder, setIsPlacingOrder] = useState(false)

  // ── Fetch cart ──────────────────────────────────────────────────────────────

  async function fetchCart() {
    try {
      const res = await fetch(`${BASE_URL}/api/cart`, {
        headers: { ...userAuthHeaders() },
        cache: "no-store",
      })
      const data = res.ok ? await res.json().catch(() => ({})) : {}
      const products: CartItem[] = await Promise.all(
        (data.products || []).map(async (item: CartItem) => {
          if (typeof item.productId !== "string") return item
          try {
            const r = await fetch(`${BASE_URL}/api/products/${item.productId}`, { headers: userAuthHeaders() })
            if (r.ok) return { ...item, productId: await r.json() }
          } catch {}
          return item
        })
      )
      setCart({ products, totalAmount: data.totalAmount || 0 })
      // Select all items by default
      setSelectedIds(new Set(products.map((p) => pid(p))))
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchCart() }, [])

  // ── Selection helpers ───────────────────────────────────────────────────────

  const items = cart?.products ?? []
  const allSelected  = items.length > 0 && items.every((i) => selectedIds.has(pid(i)))
  const someSelected = items.some((i) => selectedIds.has(pid(i)))

  function toggleItem(productId: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      next.has(productId) ? next.delete(productId) : next.add(productId)
      return next
    })
  }

  function toggleAll() {
    setSelectedIds(
      allSelected
        ? new Set()
        : new Set(items.map((i) => pid(i)))
    )
  }

  // ── Quantity update ─────────────────────────────────────────────────────────

  async function handleQty(productId: string, name: string, currentQty: number, itemPrice: number, delta: number) {
    const newQty = currentQty + delta
    if (newQty < 1) {
      await fetch(`${BASE_URL}/api/cart/${productId}`, { method: "DELETE", headers: userAuthHeaders() })
    } else {
      await fetch(`${BASE_URL}/api/cart/${productId}`, { method: "DELETE", headers: userAuthHeaders() })
      await fetch(`${BASE_URL}/api/cart/add`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", ...userAuthHeaders() },
        body:    JSON.stringify({ productId, name, quantity: newQty, price: itemPrice }),
      })
    }
    fetchCart()
  }

  // ── Pricing (based on selected items only) ──────────────────────────────────

  const selectedItems      = items.filter((i) => selectedIds.has(pid(i)))
  const subtotal           = selectedItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const logisticsCost      = SHIPPING[shipping].price
  const taxes              = Math.round(subtotal * GST_RATE)
  const installationCost   = installation ? INSTALLATION_COST : 0
  const techSurcharge      = TECH_SURCHARGE
  const total              = subtotal + logisticsCost + installationCost + techSurcharge + taxes

  // ── Snapshot locked when order placement begins ────────────────────────────

  const [finalOrder, setFinalOrder] = useState<{
    products:         { productId: string; name: string; price: number; quantity: number; image: string }[]
    shippingDetails:  { name: string; phone: string; address: string }
    subtotal:         number
    logisticsCost:    number
    installationCost: number
    techSurcharge:    number
    taxes:            number
    totalAmount:      number
  } | null>(null)

  const display = {
    subtotal:         finalOrder?.subtotal         ?? subtotal,
    logisticsCost:    finalOrder?.logisticsCost     ?? logisticsCost,
    taxes:            finalOrder?.taxes             ?? taxes,
    installationCost: finalOrder?.installationCost  ?? installationCost,
    techSurcharge:    finalOrder?.techSurcharge     ?? techSurcharge,
    total:            finalOrder?.totalAmount       ?? total,
  }

  // ── Place order ─────────────────────────────────────────────────────────────

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault()
    if (!cart || selectedItems.length === 0) return

    if (!name.trim() || !phone.trim() || !address.trim()) {
      setStatus("error")
      setErrMsg("Please fill in your name, phone number, and delivery address.")
      return
    }

    // Snapshot everything before any async state mutation
    const snapshot = {
      products: selectedItems.map((i) => ({
        productId: pid(i),
        name:      pname(i),
        price:     i.price,
        quantity:  i.quantity,
        image:     pfield(i, "image") ?? "",
      })),
      shippingDetails: { name, phone, address },
      subtotal,
      logisticsCost,
      installationCost,
      techSurcharge,
      taxes,
      totalAmount: total,
    }

    setFinalOrder(snapshot)
    setIsPlacingOrder(true)
    setStatus("placing")
    setErrMsg("")

    try {
      const res = await fetch(`${BASE_URL}/api/orders`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", ...userAuthHeaders() },
        body:    JSON.stringify(snapshot),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error((d as { message?: string }).message ?? `Error ${res.status}`)
      }
      const data = await res.json().catch(() => ({})) as { _id?: string; order?: { _id?: string }; orderId?: string; id?: string }
      const orderId = data._id ?? data.order?._id ?? data.orderId ?? data.id ?? ""

      setStatus("success")
      const params = new URLSearchParams({
        orderId,
        total:    String(snapshot.totalAmount),
        items:    String(snapshot.products.length),
        products: snapshot.products.map(p => p.name).join(","),
      })

      setTimeout(() => {
        // Navigate first
        router.push(`/order-success?${params}`)

        // Clear cart ONLY after navigation is triggered
        setCart({ products: [], totalAmount: 0 })
        setSelectedIds(new Set())
        window.dispatchEvent(new CustomEvent("cart-updated", { detail: { count: 0 } }))
        fetch(`${BASE_URL}/api/cart/clear`, { method: "DELETE", headers: userAuthHeaders() })
      }, 2500)
    } catch (err) {
      setStatus("error")
      setErrMsg(err instanceof Error ? err.message : "Something went wrong")
      setFinalOrder(null)
      setIsPlacingOrder(false)
    }
  }

  if (loading) return null

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <p className="mb-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gray-400">
          Place order
        </p>
        <h1 className="text-[1.75rem] font-extrabold tracking-[-0.025em] text-gray-900">
          Checkout
        </h1>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">

          {/* ════════════════════════════════════════
              LEFT COLUMN
          ════════════════════════════════════════ */}
          <div className="space-y-6">

            {/* ── 1. Cart Review ─────────────────── */}
            <Card
              title="Cart Review"
              headerExtra={
                items.length > 0 ? (
                  <button
                    type="button"
                    onClick={toggleAll}
                    className="flex items-center gap-2 text-[0.75rem] font-medium text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    <span className={[
                      "flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all",
                      allSelected
                        ? "border-indigo-600 bg-indigo-600"
                        : someSelected
                          ? "border-indigo-400 bg-indigo-100"
                          : "border-gray-300 bg-white hover:border-gray-400",
                    ].join(" ")}>
                      {allSelected && <Checkmark />}
                      {someSelected && !allSelected && (
                        <span className="h-0.5 w-2 rounded bg-indigo-500" />
                      )}
                    </span>
                    Select All
                  </button>
                ) : null
              }
            >
              {items.length === 0 ? (
                <p className="py-6 text-center text-[0.82rem] text-gray-400">Your cart is empty.</p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {items.map((item) => {
                    const isSelected = selectedIds.has(pid(item))
                    const imgSrc = getImageUrl(pfield(item, "image") ?? null)
                    return (
                      <div
                        key={pid(item)}
                        className={[
                          "flex gap-4 py-4 transition-opacity",
                          isSelected ? "opacity-100" : "opacity-40",
                        ].join(" ")}
                      >

                        {/* Checkbox */}
                        <div className="flex items-start pt-1">
                          <button
                            type="button"
                            onClick={() => toggleItem(pid(item))}
                            className={[
                              "flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all",
                              isSelected
                                ? "border-indigo-600 bg-indigo-600"
                                : "border-gray-300 bg-white hover:border-indigo-400",
                            ].join(" ")}
                            aria-label={isSelected ? "Deselect item" : "Select item"}
                          >
                            {isSelected && <Checkmark />}
                          </button>
                        </div>

                        {/* Image */}
                        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                          {imgSrc ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={imgSrc} alt={pname(item)}
                              className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="h-6 w-6 text-gray-300" strokeWidth={1.25} />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex flex-1 flex-col gap-1 min-w-0">
                          <p className="truncate text-[0.88rem] font-semibold text-gray-900">
                            {pname(item)}
                          </p>
                          <div className="flex items-center gap-3">
                            <span className="text-[0.72rem] text-gray-400">
                              SKU: <span className="font-mono">{pfield(item, "sku") ?? "—"}</span>
                            </span>
                            <span className={[
                              "rounded-full px-2 py-0.5 text-[0.65rem] font-semibold",
                              pfield(item, "stock") === false
                                ? "bg-red-50 text-red-500"
                                : "bg-green-50 text-green-600",
                            ].join(" ")}>
                              {pfield(item, "stock") === false ? "Out of Stock" : "In Stock"}
                            </span>
                          </div>
                        </div>

                        {/* Qty + Price */}
                        <div className="flex shrink-0 flex-col items-end gap-2">
                          <p className="text-[0.88rem] font-bold text-gray-900">
                            {fmt(item.price * item.quantity)}
                          </p>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleQty(pid(item), pname(item), item.quantity, item.price, -1)}
                              className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 text-gray-400 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white"
                              aria-label="Decrease"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-5 text-center text-[0.82rem] font-semibold text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQty(pid(item), pname(item), item.quantity, item.price, 1)}
                              className="flex h-6 w-6 items-center justify-center rounded border border-gray-200 text-gray-400 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white"
                              aria-label="Increase"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <p className="text-[0.72rem] text-gray-400">{fmt(item.price)} / unit</p>
                        </div>

                      </div>
                    )
                  })}
                </div>
              )}
            </Card>

            {/* ── 2. Delivery Details ────────────── */}
            <Card title="Delivery Details">
              <div className="space-y-4">
                <Field label="Full Name" required>
                  <input required value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma" className={inputCls} />
                </Field>
                <Field label="Phone Number" required>
                  <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9876543210" className={inputCls} />
                </Field>
                <Field label="Delivery Address" required>
                  <textarea required rows={3} value={address} onChange={(e) => setAddress(e.target.value)}
                    placeholder="House / Flat, Street, City, Pincode"
                    className={`${inputCls} h-auto resize-none py-2.5`} />
                </Field>
              </div>
            </Card>

            {/* ── 3. Logistics ──────────────────── */}
            <Card title="Logistics">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Dispatch Warehouse" required>
                  <select value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value as typeof WAREHOUSES[number])}
                    className={inputCls}>
                    {WAREHOUSES.map((w) => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Shipping Type" required>
                  <div className="flex h-10 overflow-hidden rounded-lg border border-gray-200 text-[0.82rem]">
                    {(["standard", "priority"] as const).map((s, idx) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setShipping(s)}
                        className={[
                          "flex flex-1 items-center justify-center gap-1.5 font-semibold transition-all",
                          idx === 1 ? "border-l border-gray-200" : "",
                          shipping === s
                            ? "text-white"
                            : "bg-white text-gray-400 hover:bg-indigo-50 hover:text-indigo-600",
                        ].join(" ")}
                        style={shipping === s ? { background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)" } : {}}
                      >
                        {SHIPPING[s].label}
                        <span className="text-[0.68rem] opacity-70">({fmt(SHIPPING[s].price)})</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-[0.7rem] text-gray-400">{SHIPPING[shipping].time}</p>
                </Field>
              </div>
            </Card>

            {/* Status banners */}
            {status === "success" && (
              <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                <p className="text-[0.85rem] font-medium text-green-700">
                  Order placed successfully! Redirecting…
                </p>
              </div>
            )}
            {status === "error" && (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
                <p className="text-[0.85rem] font-medium text-red-600">{errMsg}</p>
              </div>
            )}

          </div>

          {/* ════════════════════════════════════════
              RIGHT COLUMN — sticky summary
          ════════════════════════════════════════ */}
          <div className="space-y-4 lg:sticky lg:top-[88px] lg:self-start">

            {/* Order Summary */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Order Summary
                </p>
                {items.length > 0 && (
                  <p className="text-[0.72rem] text-gray-400">
                    {selectedItems.length} of {items.length} item{items.length !== 1 ? "s" : ""}
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                <SummaryRow label="Subtotal"            value={fmt(display.subtotal)} />
                <SummaryRow label={`Logistics (${SHIPPING[shipping].label})`} value={fmt(display.logisticsCost)} />
                <SummaryRow label="Technical Surcharge" value={fmt(display.techSurcharge)} muted />
                <SummaryRow label="GST (18%)"           value={fmt(display.taxes)} muted />
                {(installation || (finalOrder?.installationCost ?? 0) > 0) && (
                  <SummaryRow label="Installation Support" value={fmt(display.installationCost)} />
                )}
              </div>

              <div className="my-4 h-px bg-gray-100" />

              <div className="flex items-center justify-between">
                <p className="text-[0.85rem] font-bold text-gray-900">Total</p>
                <p className="text-[1.25rem] font-extrabold tracking-tight text-gray-900">
                  {fmt(display.total)}
                </p>
              </div>
            </div>

            {/* Installation Support */}
            <button
              type="button"
              onClick={() => setInstallation((v) => !v)}
              className={[
                "flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all",
                installation
                  ? "border-indigo-200 bg-indigo-50"
                  : "border-gray-200 bg-white hover:border-gray-300",
              ].join(" ")}
            >
              <span className={[
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all",
                installation
                  ? "border-indigo-600 bg-indigo-600"
                  : "border-gray-300 bg-white",
              ].join(" ")}>
                {installation && <Checkmark />}
              </span>
              <div>
                <p className="text-[0.82rem] font-semibold text-gray-900">
                  Need Installation Support
                </p>
                <p className="mt-0.5 text-[0.72rem] text-gray-500">
                  Certified technician on-site · +{fmt(INSTALLATION_COST)}
                </p>
              </div>
            </button>

            {/* Place Order */}
            <button
              type="submit"
              disabled={selectedItems.length === 0 || isPlacingOrder || status === "success"}
              className="flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
              style={{ background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)" }}
            >
              {status === "placing"
                ? "Placing Order…"
                : selectedItems.length === 0
                  ? "Select items to order"
                  : `Place Order (${selectedItems.length} item${selectedItems.length !== 1 ? "s" : ""})`
              }
            </button>

          </div>
        </div>
      </form>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Card({
  title,
  headerExtra,
  children,
}: {
  title: string
  headerExtra?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[0.88rem] font-semibold text-gray-900">{title}</h2>
        {headerExtra}
      </div>
      {children}
    </section>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-gray-500">
        {label}{required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {children}
    </div>
  )
}

function SummaryRow({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <p className={`text-[0.78rem] ${muted ? "text-gray-400" : "text-gray-600"}`}>{label}</p>
      <p className={`text-[0.78rem] font-medium ${muted ? "text-gray-400" : "text-gray-900"}`}>{value}</p>
    </div>
  )
}

const inputCls =
  "h-10 w-full rounded-lg border border-gray-200 bg-gray-50/40 px-3.5 text-[0.88rem] text-gray-900 outline-none transition-all placeholder:text-gray-300 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-50"
