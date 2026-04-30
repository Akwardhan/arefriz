import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import ProductListing from "@/components/category/ProductListing"
import { products as localProducts } from "@/data/products"
import type { Product } from "@/data/products"

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const title = category.charAt(0).toUpperCase() + category.slice(1)

  let initialProducts: Product[] = []
  if (process.env.API_URL) {
    try {
      const res = await fetch(
        `${process.env.API_URL}/products?category=${category}`,
        { cache: "no-store" },
      )
      if (res.ok) {
        const json = await res.json()
        // Backend may return a plain array or a wrapped { products: [], data: [] } shape
        const raw: Product[] = Array.isArray(json)
          ? json
          : (json?.products ?? json?.data ?? [])
        // Normalise: handle alternative name fields from different backend schemas
        initialProducts = raw.map((p: any) => ({
          ...p,
          _id:         p._id ?? p.id ?? "",
          name:        p.name ?? p.productName ?? p.title ?? "",
          brand:       p.brand ?? p.brandName ?? "",
          image:       p.image ?? p.imageUrl ?? p.thumbnail ?? "",
          price:       Number(p.price) || 0,
          stock:       p.stock ?? 0,
          description: p.description ?? p.shortDescription ?? p.desc ?? "",
          specs:       p.specs ?? [],
          category:    p.category ?? category,
        })) as Product[]
      }
    } catch {
      // API unreachable — fall through to local data
    }
  }

  if (initialProducts.length === 0) {
    initialProducts = localProducts.filter(
      (p) => p.category === (category.toLowerCase() as Product["category"]),
    )
  }

  return (
    <>
      <Navbar />

      {/* ── Page header ── */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <div className="flex items-end justify-between">

            <div>
              <p className="mb-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gray-400">
                Browse by category
              </p>
              <h1 className="text-[1.75rem] font-extrabold leading-tight tracking-[-0.025em] text-gray-900">
                {title}
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                Industrial Refrigeration Control
              </p>
            </div>

            <select className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-[0.82rem] text-gray-600 shadow-none outline-none focus:border-gray-400">
              <option>Sort: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest First</option>
            </select>

          </div>
        </div>
      </div>

      <ProductListing category={category} initialProducts={initialProducts} />

      <Footer />
    </>
  )
}
