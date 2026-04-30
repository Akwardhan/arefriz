"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Minus, Plus, X, ShoppingCart } from "lucide-react"
import { BASE_URL } from "@/lib/config"
import { authHeaders } from "@/lib/auth"

// ── Types ─────────────────────────────────────────────────────────────────────

interface PopulatedProduct {
  _id: string
  name: string
  image: string
  price: number
}

interface CartItem {
  productId: PopulatedProduct | string
  name?: string        // backend may store name directly on the item
  quantity: number
  price: number
}

function pid(item: CartItem): string {
  return typeof item.productId === "object" ? item.productId._id : item.productId
}

function pname(item: CartItem): string {
  if (typeof item.productId === "object" && item.productId?.name) return item.productId.name
  return item.name ?? "—"
}

interface CartData {
  products: CartItem[]
  totalAmount: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n)

// ── Component ─────────────────────────────────────────────────────────────────

export default function CartView() {
  const [cart, setCart]       = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchCart() {
    try {
      const res = await fetch(`${BASE_URL}/api/cart`, {
        headers: { ...authHeaders() },
        cache: "no-store",
      })
      const data = res.ok ? await res.json().catch(() => ({})) : {}
      const products: CartItem[] = await Promise.all(
        (data.products || []).map(async (item: CartItem) => {
          if (typeof item.productId !== "string") return item
          try {
            const r = await fetch(`${BASE_URL}/api/products/${item.productId}`, { headers: authHeaders() })
            if (r.ok) return { ...item, productId: await r.json() }
          } catch {}
          return item
        })
      )
      setCart({ products, totalAmount: data.totalAmount || 0 })
    } catch {
      // network error — leave cart null
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCart() }, [])

  async function handleRemove(productId: string) {
    await fetch(`${BASE_URL}/api/cart/${productId}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
    fetchCart()
  }

  async function handleQty(productId: string, name: string, currentQty: number, itemPrice: number, delta: number) {
    const newQty = currentQty + delta
    if (newQty < 1) {
      await handleRemove(productId)
      return
    }
    await fetch(`${BASE_URL}/api/cart/${productId}`, {
      method: "DELETE",
      headers: authHeaders(),
    })
    await fetch(`${BASE_URL}/api/cart/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify({ productId, name, quantity: newQty, price: itemPrice }),
    })
    fetchCart()
  }

  if (loading) return null

  const items = cart?.products ?? []
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
        <ShoppingCart className="h-12 w-12 text-gray-200" strokeWidth={1} />
        <p className="text-[0.9rem] font-medium text-gray-500">Your cart is empty</p>
        <Link
          href="/"
          className="mt-1 rounded-lg border border-gray-300 px-5 py-2 text-[0.82rem] font-semibold text-gray-700 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">

      {/* Header */}
      <div className="mb-8">
        <p className="mb-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gray-400">
          Review order
        </p>
        <h1 className="text-[1.75rem] font-extrabold tracking-[-0.025em] text-gray-900">
          Your Cart
        </h1>
        <p className="mt-1 text-sm text-gray-400">
          {items.length} {items.length === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">

        {/* ── Item list ── */}
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">

          {/* Column headers */}
          <div className="hidden grid-cols-[1fr_110px_130px_90px_36px] gap-4 px-5 py-3 sm:grid">
            {["Product", "Price", "Quantity", "Total", "actions"].map((h) => (
              <span key={h} className="text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-gray-400">
                {h === "actions" ? "" : h}
              </span>
            ))}
          </div>

          {items.map((item, i) => (
            <div
              key={pid(item) || `item-${i}`}
              className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[1fr_110px_130px_90px_36px] sm:items-center sm:gap-4"
            >
              {/* Name */}
              <p className="text-[0.88rem] font-semibold leading-snug text-gray-900">
                {pname(item)}
              </p>

              {/* Unit price */}
              <p className="text-[0.85rem] text-gray-500">
                <span className="mr-1 text-[0.7rem] uppercase tracking-wide text-gray-400 sm:hidden">
                  Price:{" "}
                </span>
                {fmt(item.price)}
              </p>

              {/* Quantity controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleQty(pid(item), pname(item), item.quantity, item.price, -1)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center text-[0.88rem] font-semibold text-gray-900">
                  {item.quantity}
                </span>
                <button
                  onClick={() => handleQty(pid(item), pname(item), item.quantity, item.price, 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              {/* Line total */}
              <p className="text-[0.88rem] font-bold text-gray-900">
                <span className="mr-1 text-[0.7rem] uppercase tracking-wide text-gray-400 sm:hidden">
                  Total:{" "}
                </span>
                {fmt(item.price * item.quantity)}
              </p>

              {/* Remove */}
              <button
                onClick={() => handleRemove(pid(item))}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
                aria-label="Remove item"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* ── Order summary ── */}
        <div className="h-fit rounded-xl border border-gray-200 bg-gray-50 p-6">
          <p className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gray-400">
            Order Summary
          </p>

          <div className="space-y-3">
            {items.map((item, i) => (
              <div key={pid(item) || `item-${i}`} className="flex items-start justify-between gap-3">
                <p className="text-[0.78rem] leading-snug text-gray-600">
                  {pname(item)}
                  <span className="ml-1.5 text-gray-400">×{item.quantity}</span>
                </p>
                <p className="shrink-0 text-[0.78rem] font-medium text-gray-900">
                  {fmt(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="my-5 h-px bg-gray-200" />

          <div className="flex items-center justify-between">
            <p className="text-[0.82rem] font-semibold text-gray-700">Total</p>
            <p className="text-[1.2rem] font-extrabold tracking-tight text-gray-900">
              {fmt(total)}
            </p>
          </div>

          <Link
            href="/checkout"
            className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-[#2563EB] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
          >
            Proceed to Checkout
          </Link>

          <Link
            href="/"
            className="mt-3 flex h-10 w-full items-center justify-center rounded-xl border border-gray-300 px-6 text-[0.82rem] font-semibold text-gray-700 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white"
          >
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  )
}
