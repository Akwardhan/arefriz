"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingCart } from "lucide-react"
import { BASE_URL } from "@/lib/config"

export default function CartIcon() {
  const [count, setCount] = useState(0)

  async function sync() {
    const token = localStorage.getItem("userToken")
    console.log("TOKEN:", token)
    if (!token) { setCount(0); return }
    const res  = await fetch(`${BASE_URL}/api/cart`, { headers: { Authorization: `Bearer ${token}` } })
    if (!res.ok || res.status === 204) { setCount(0); return }
    const data = await res.json()
    setCount((data?.items || data?.products || []).length)
  }

  useEffect(() => {
    sync()
    function handleCartUpdated(e: Event) {
      const items = (e as CustomEvent<{ items?: unknown[] }>).detail?.items
      if (items) setCount(items.length)
    }
    function handleLogout() { setCount(0) }
    window.addEventListener("cart-updated", handleCartUpdated)
    window.addEventListener("user-logout", handleLogout)
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdated)
      window.removeEventListener("user-logout", handleLogout)
    }
  }, [])

  return (
    <Link
      href="/cart"
      className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
      aria-label="Cart"
    >
      <ShoppingCart className="h-[18px] w-[18px]" />
      {count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#2563EB] px-0.5 text-[0.6rem] font-bold leading-none text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  )
}
