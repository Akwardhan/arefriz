"use client"

import { useState } from "react"
import { Check, AlertCircle, Loader2 } from "lucide-react"
import { BASE_URL } from "@/lib/config"

interface Props {
  product: {
    _id:    string
    name:   string
    price:  number
    image?: string
  }
  className?: string
  children?:  React.ReactNode
}

type Status = "idle" | "loading" | "success" | "error"

export default function AddToCartButton({ product, className, children }: Props) {
  const [status, setStatus] = useState<Status>("idle")

  const addToCart = async () => {
    const token = localStorage.getItem("userToken")
    console.log("TOKEN:", token)

    if (!token) {
      alert("Login first")
      return
    }

    setStatus("loading")
    try {
      const res = await fetch(`${BASE_URL}/api/cart/add`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product._id,
          name:      product.name,
          price:     product.price,
          image:     product.image,
          quantity:  1,
        }),
      })

      if (!res.ok) throw new Error(`${res.status}`)
      const data = await res.json()
      window.dispatchEvent(new CustomEvent("cart-updated", { detail: { items: data.items || data.products } }))
      setStatus("success")
      setTimeout(() => setStatus("idle"), 1500)
    } catch (err) {
      console.error(err)
      setStatus("error")
      setTimeout(() => setStatus("idle"), 2000)
    }
  }

  return (
    <button
      onClick={(e) => { e.stopPropagation(); addToCart() }}
      disabled={status === "loading"}
      className={className}
    >
      {status === "loading" && <Loader2    className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
      {status === "success" && <Check      className="mr-1.5 h-3.5 w-3.5" />}
      {status === "error"   && <AlertCircle className="mr-1.5 h-3.5 w-3.5" />}
      {status === "idle"    && children}
      {status === "loading" && "Adding…"}
      {status === "success" && "Added!"}
      {status === "error"   && "Failed"}
    </button>
  )
}
