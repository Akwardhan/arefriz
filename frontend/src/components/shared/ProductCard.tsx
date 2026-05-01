"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Package, ShoppingCart, Loader2, Check, AlertCircle } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getImageUrl } from "@/lib/imageUrl"
import { BASE_URL } from "@/lib/config"
import { userAuthHeaders } from "@/lib/auth"

interface ProductCardProps {
  id?: string
  image: string | null
  name: string
  brand: string
  price: number
  description?: string
  href?: string
}

type CartStatus = "idle" | "loading" | "success" | "error"

export default function ProductCard({
  id = "",
  image,
  name,
  brand,
  price,
  description,
  href = "#",
}: ProductCardProps) {
  const router = useRouter()
  const [cartStatus, setCartStatus] = useState<CartStatus>("idle")

  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price)

  async function handleAddToCart(productId: string) {
    if (cartStatus === "loading") return
    setCartStatus("loading")
    try {
      console.log("[AddToCart] payload:", { productId, quantity: 1, price })
      const res = await fetch(`${BASE_URL}/api/cart/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...userAuthHeaders() },
        body: JSON.stringify({ productId, name, quantity: 1, price }),
      })
      if (!res.ok) {
        const text = await res.text()
        let data: unknown = {}
        try { data = JSON.parse(text) } catch { data = text }
        console.error("[AddToCart] failed:", res.status, data)
        setCartStatus("error")
        setTimeout(() => setCartStatus("idle"), 2000)
        return
      }
      setCartStatus("success")
      window.dispatchEvent(new Event("cart-updated"))
      setTimeout(() => setCartStatus("idle"), 1500)
    } catch (err) {
      console.error("[AddToCart] network error:", err)
      setCartStatus("error")
      setTimeout(() => setCartStatus("idle"), 2000)
    }
  }

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-shadow duration-300 hover:shadow-[0_8px_32px_-4px_rgba(0,0,0,0.1)] cursor-pointer"
      onClick={() => router.push(href)}
    >
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-50">
        {getImageUrl(image) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={getImageUrl(image)}
            alt={name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="h-10 w-10 text-gray-300" strokeWidth={1.25} />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-5">

        {/* Brand */}
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-gray-400">
          {brand}
        </p>

        {/* Name */}
        <h3 className="text-[0.95rem] font-semibold leading-snug text-gray-900">
          {name}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-[0.78rem] leading-[1.6] text-gray-400">{description}</p>
        )}

        {/* Divider */}
        <div className="h-px w-full bg-gray-100" />

        {/* Price */}
        <div className="mt-auto pt-1">
          <span className="text-[1.05rem] font-bold tracking-tight text-gray-900">
            {formatted}
          </span>
        </div>

        {/* Add to Cart */}
        <button
          className={cn(
            buttonVariants({ size: "sm" }),
            "h-8 w-full rounded-lg px-3 text-xs font-semibold inline-flex items-center justify-center cursor-pointer",
          )}
          onClick={(e) => {
            e.stopPropagation()
            handleAddToCart(id)
          }}
        >
          {cartStatus === "idle"    && <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />}
          {cartStatus === "loading" && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
          {cartStatus === "success" && <Check className="mr-1.5 h-3.5 w-3.5" />}
          {cartStatus === "error"   && <AlertCircle className="mr-1.5 h-3.5 w-3.5" />}

          {cartStatus === "idle"    && "Add to Cart"}
          {cartStatus === "loading" && "Adding…"}
          {cartStatus === "success" && "Added!"}
          {cartStatus === "error"   && "Failed"}
        </button>

      </div>
    </div>
  )
}
