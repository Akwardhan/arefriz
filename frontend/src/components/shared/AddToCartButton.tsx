"use client"

import { useState } from "react"
import { ShoppingCart, Check, AlertCircle, Loader2 } from "lucide-react"
import { BASE_URL } from "@/lib/config"
import { userAuthHeaders } from "@/lib/auth"

interface Props {
  productId: string
  name: string
  price: number
  className?: string
  children?: React.ReactNode
}

type Status = "idle" | "loading" | "success" | "error"

export default function AddToCartButton({ productId, name, price, className, children }: Props) {
  const [status, setStatus] = useState<Status>("idle")

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (status === "loading") return

    setStatus("loading")
    try {
      const res = await fetch(`${BASE_URL}/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...userAuthHeaders() },
        body: JSON.stringify({ productId, name, quantity: 1, price }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        console.error("[AddToCart] failed:", res.status, data)
        setStatus("error")
        setTimeout(() => setStatus("idle"), 2000)
        return
      }

      setStatus("success")
      window.dispatchEvent(new Event("cart-updated"))
      setTimeout(() => setStatus("idle"), 1500)
    } catch (err) {
      console.error("[AddToCart] network error:", err)
      setStatus("error")
      setTimeout(() => setStatus("idle"), 2000)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={status === "loading"}
      className={className}
    >
      {status === "loading" && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
      {status === "success" && <Check className="mr-1.5 h-3.5 w-3.5" />}
      {status === "error"   && <AlertCircle className="mr-1.5 h-3.5 w-3.5" />}
      {status === "idle"    && children}

      {status === "loading" && "Adding…"}
      {status === "success" && "Added!"}
      {status === "error"   && "Failed"}
    </button>
  )
}
