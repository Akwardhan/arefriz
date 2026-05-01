"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { BASE_URL } from "@/lib/config"
import { userAuthHeaders } from "@/lib/auth"

export default function CartIcon() {
  const [count, setCount]     = useState(0)
  const [loggedIn, setLoggedIn] = useState(false)

  async function sync() {
    const token = localStorage.getItem("userToken")
    if (!token) { setCount(0); return }
    try {
      const res = await fetch(`${BASE_URL}/api/cart`, {
        headers: { ...userAuthHeaders() },
        cache: "no-store",
      })
      const data = res.ok ? await res.json().catch(() => ({})) : {}
      setCount((data.products || []).length)
    } catch {
      // ignore
    }
  }

  function handleCartUpdate(e: Event) {
    const token = localStorage.getItem("userToken")
    if (!token) { setCount(0); return }
    const detail = (e as CustomEvent<{ count?: number }>).detail
    if (typeof detail?.count === "number") {
      setCount(detail.count)
    } else {
      sync()
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("userToken")
    setLoggedIn(!!token)
    if (token) sync()
    window.addEventListener("cart-updated", handleCartUpdate)
    return () => window.removeEventListener("cart-updated", handleCartUpdate)
  }, [])

  return (
    <Link
      href="/cart"
      className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
      aria-label="Cart"
    >
      <ShoppingCart className="h-[18px] w-[18px]" />
      {loggedIn && count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2563EB] px-0.5 text-[0.6rem] font-bold leading-none text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  )
}
