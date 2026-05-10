"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Minus, Plus, X, ShoppingCart } from "lucide-react"
import { BASE_URL } from "@/lib/config"
import { userAuthHeaders } from "@/lib/auth"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

interface CartItem {
  productId: string
  name:      string
  price:     number
  quantity:  number
  image?:    string
}

export default function CartView() {
  const router = useRouter()

  const [cart,    setCart]    = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("userToken")
      console.log("TOKEN:", token)

      if (!token) {
        setCart([])
        setLoading(false)
        return
      }

      const res  = await fetch(`${BASE_URL}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok || res.status === 204) { setCart([]); setLoading(false); return }
      const data = await res.json()
      const raw = data?.items || data?.products || []
      const normalized: CartItem[] = raw.map((i: CartItem & { productId: string | { _id: string; name: string; price: number; image?: string } }) =>
        typeof i.productId === "object"
          ? { productId: i.productId._id, name: i.productId.name, price: i.productId.price, image: i.productId.image, quantity: i.quantity }
          : i
      )
      setCart(normalized)
      setLoading(false)
    }

    fetchCart()

    function handleLogout() { setCart([]) }
    window.addEventListener("user-logout", handleLogout)
    return () => window.removeEventListener("user-logout", handleLogout)
  }, [])

  async function handleRemove(productId: string) {
    await fetch(`${BASE_URL}/api/cart/${productId}`, {
      method:  "DELETE",
      headers: userAuthHeaders(),
    })
    const next = cart.filter((i) => i.productId !== productId)
    setCart(next)
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: { items: next } }))
  }

  async function handleQty(productId: string, currentQty: number, delta: number) {
    const newQty = currentQty + delta
    if (newQty < 1) { handleRemove(productId); return }

    await fetch(`${BASE_URL}/api/cart/update`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json", ...userAuthHeaders() },
      body:    JSON.stringify({ productId, quantity: newQty }),
    })
    const next = cart.map((i) => i.productId === productId ? { ...i, quantity: newQty } : i)
    setCart(next)
    window.dispatchEvent(new CustomEvent("cart-updated", { detail: { items: next } }))
  }

  // ── Gates ──────────────────────────────────────────────────────────────────
  if (loading) return null

  if (!localStorage.getItem("userToken")) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
        <ShoppingCart className="h-12 w-12 text-gray-200" strokeWidth={1} />
        <p className="text-[0.9rem] font-medium text-gray-500">Login to access your cart</p>
        <button
          onClick={() => router.push("/login")}
          className="mt-1 rounded-lg bg-black px-6 py-2.5 text-[0.82rem] font-semibold text-white transition-colors hover:bg-gray-800"
        >
          Login
        </button>
      </div>
    )
  }

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0)

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 text-center">
        <ShoppingCart className="h-12 w-12 text-gray-200" strokeWidth={1} />
        <p className="text-[0.9rem] font-medium text-gray-500">Your cart is empty</p>
        <Link href="/" className="mt-1 rounded-lg border border-gray-300 px-5 py-2 text-[0.82rem] font-semibold text-gray-700 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">

      <div className="mb-8">
        <p className="mb-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gray-400">Review order</p>
        <h1 className="text-[1.75rem] font-extrabold tracking-[-0.025em] text-gray-900">Your Cart</h1>
        <p className="mt-1 text-sm text-gray-400">{cart.length} {cart.length === 1 ? "item" : "items"}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">

        {/* Item list */}
        <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
          <div className="hidden grid-cols-[1fr_110px_130px_90px_36px] gap-4 px-5 py-3 sm:grid">
            {["Product", "Price", "Quantity", "Total", ""].map((h, i) => (
              <span key={i} className="text-[0.68rem] font-semibold uppercase tracking-[0.15em] text-gray-400">{h}</span>
            ))}
          </div>

          {cart.map((item) => (
            <div key={item.productId} className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[1fr_110px_130px_90px_36px] sm:items-center sm:gap-4">
              <p className="text-[0.88rem] font-semibold leading-snug text-gray-900">{item.name}</p>

              <p className="text-[0.85rem] text-gray-500">
                <span className="mr-1 text-[0.7rem] uppercase tracking-wide text-gray-400 sm:hidden">Price: </span>
                {fmt(item.price)}
              </p>

              <div className="flex items-center gap-2">
                <button onClick={() => handleQty(item.productId, item.quantity, -1)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white"
                  aria-label="Decrease quantity">
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center text-[0.88rem] font-semibold text-gray-900">{item.quantity}</span>
                <button onClick={() => handleQty(item.productId, item.quantity, 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-md border border-gray-200 text-gray-500 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white"
                  aria-label="Increase quantity">
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              <p className="text-[0.88rem] font-bold text-gray-900">
                <span className="mr-1 text-[0.7rem] uppercase tracking-wide text-gray-400 sm:hidden">Total: </span>
                {fmt(item.price * item.quantity)}
              </p>

              <button onClick={() => handleRemove(item.productId)}
                className="flex h-7 w-7 items-center justify-center rounded-md text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
                aria-label="Remove item">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="h-fit rounded-xl border border-gray-200 bg-gray-50 p-6">
          <p className="mb-4 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-gray-400">Order Summary</p>

          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.productId} className="flex items-start justify-between gap-3">
                <p className="text-[0.78rem] leading-snug text-gray-600">
                  {item.name}<span className="ml-1.5 text-gray-400">×{item.quantity}</span>
                </p>
                <p className="shrink-0 text-[0.78rem] font-medium text-gray-900">{fmt(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>

          <div className="my-5 h-px bg-gray-200" />

          <div className="flex items-center justify-between">
            <p className="text-[0.82rem] font-semibold text-gray-700">Total</p>
            <p className="text-[1.2rem] font-extrabold tracking-tight text-gray-900">{fmt(total)}</p>
          </div>

          <Link href="/checkout"
            className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-[#2563EB] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]">
            Proceed to Checkout
          </Link>

          <Link href="/"
            className="mt-3 flex h-10 w-full items-center justify-center rounded-xl border border-gray-300 px-6 text-[0.82rem] font-semibold text-gray-700 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white">
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  )
}
