"use client"

import { useMemo, useState } from "react"
import ProductCard from "@/components/shared/ProductCard"
import { cn } from "@/lib/utils"
import type { Product } from "@/data/products"

const FILTERS = [
  {
    label: "Brand",
    options: ["Parker", "Swagelok", "Emerson", "Burkert", "Alfa Laval"],
  },
  {
    label: "Price Range",
    options: ["Under ₹2,000", "₹2,000 – ₹5,000", "₹5,000 – ₹10,000", "Above ₹10,000"],
  },
  {
    label: "Availability",
    options: ["In Stock", "Ships in 24h", "Made to Order"],
  },
]

const PRICE_RANGES: Record<string, { min?: number; max?: number }> = {
  "Under ₹2,000":       { max: 2000 },
  "₹2,000 – ₹5,000":   { min: 2000,  max: 5000  },
  "₹5,000 – ₹10,000":  { min: 5000,  max: 10000 },
  "Above ₹10,000":      { min: 10000 },
}

interface Props {
  category: string
  initialProducts: Product[]
}

export default function ProductListing({ initialProducts }: Props) {
  const [selected, setSelected] = useState<Record<string, string[]>>({
    Brand: [],
    "Price Range": [],
    Availability: [],
  })

  function toggle(group: string, option: string) {
    setSelected((prev) => {
      const current = prev[group]
      const next = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option]
      return { ...prev, [group]: next }
    })
  }

  function clearFilters() {
    setSelected({ Brand: [], "Price Range": [], Availability: [] })
  }

  const displayed = useMemo(() => {
    let result = initialProducts

    // Brand
    if (selected["Brand"].length > 0) {
      result = result.filter((p) =>
        selected["Brand"].some((b) => b.toLowerCase() === p.brand.toLowerCase()),
      )
    }

    // Price range
    const priceOpt = selected["Price Range"][0]
    if (priceOpt) {
      const { min, max } = PRICE_RANGES[priceOpt]
      if (min !== undefined) result = result.filter((p) => p.price >= min)
      if (max !== undefined) result = result.filter((p) => p.price <= max)
    }

    // Availability
    if (selected["Availability"].length > 0) {
      result = result.filter((p) =>
        selected["Availability"].some((a) => {
          if (a === "In Stock")      return (p.stock ?? 0) > 0
          if (a === "Made to Order") return (p.stock ?? 0) === 0
          return true
        }),
      )
    }

    return result
  }, [selected, initialProducts])

  const hasFilters = Object.values(selected).some((v) => v.length > 0)

  return (
    <section className="bg-white py-8">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[250px_1fr]">

          {/* ── Filter sidebar ── */}
          <aside className="space-y-7">
            <div className="flex items-center justify-between">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gray-400">
                Filters
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="text-[0.72rem] font-medium text-gray-400 underline-offset-2 hover:text-gray-700 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            {FILTERS.map((group) => (
              <div key={group.label}>
                <p className="mb-3 text-[0.72rem] font-semibold uppercase tracking-[0.15em] text-gray-500">
                  {group.label}
                </p>
                <ul className="space-y-2.5">
                  {group.options.map((opt) => (
                    <li key={opt} className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        id={`${group.label}-${opt}`}
                        checked={selected[group.label].includes(opt)}
                        onChange={() => toggle(group.label, opt)}
                        className="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 accent-gray-900"
                      />
                      <label
                        htmlFor={`${group.label}-${opt}`}
                        className="cursor-pointer text-[0.82rem] text-gray-600"
                      >
                        {opt}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>

          {/* ── Product grid / empty state ── */}
          {displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <p className="text-[0.9rem] font-medium text-gray-500">
                No products found for selected filters
              </p>
              <button
                onClick={clearFilters}
                className="rounded-lg border border-gray-300 px-5 py-2 text-[0.82rem] font-semibold text-gray-700 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className={cn("grid grid-cols-2 gap-4 sm:grid-cols-3")}>
              {displayed.map((p) => (
                <ProductCard
                  key={p._id}
                  id={p._id}
                  image={p.image}
                  name={p.name}
                  brand={p.brand}
                  price={p.price}
                  description={p.description}
                  href={`/product/${p._id}`}
                />
              ))}
            </div>
          )}

        </div>
      </div>
    </section>
  )
}
