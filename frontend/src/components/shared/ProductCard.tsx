"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Package, ShoppingCart, Loader2, Check, AlertCircle } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getImageUrl } from "@/lib/imageUrl"
import { BASE_URL } from "@/lib/config"

interface ProductCardProps {
  id?: string
  image: string | null
  name: string
  brand: string
  price: number
  description?: string
  href?: string
  dealerName?: string
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
  dealerName,
}: ProductCardProps) {
  const router = useRouter()
  const [cartStatus, setCartStatus] = useState<CartStatus>("idle")

  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price)

  async function handleAddToCart(e: React.MouseEvent) {
    e.stopPropagation()
    if (cartStatus === "loading") return

    const token = localStorage.getItem("userToken")
    console.log("TOKEN:", token)
    if (!token) {
      alert("Login first")
      return
    }

    setCartStatus("loading")
    try {
      const res = await fetch(`${BASE_URL}/api/cart/add`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ productId: id, name, price, image: image ?? undefined, quantity: 1 }),
      })
      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      window.dispatchEvent(new CustomEvent("cart-updated", { detail: { items: data.items || data.products } }))
      setCartStatus("success")
      setTimeout(() => setCartStatus("idle"), 1500)
    } catch {
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

        {/* Dealer label */}
        {dealerName && (
          <p className="text-[0.68rem] text-gray-400 -mt-1.5">
            Sold by <span className="font-semibold text-gray-600">{dealerName}</span>
          </p>
        )}

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
          onClick={handleAddToCart}
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
