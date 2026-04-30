import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ShoppingCart, ShieldCheck, Truck, BadgeCheck, Package } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/shared/ProductCard";
import AddToCartButton from "@/components/shared/AddToCartButton";
import InquiryForm from "@/components/shared/InquiryForm";
import { cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/imageUrl";
import { products as localProducts } from "@/data/products";
import type { Product } from "@/data/products";

async function getProduct(id: string): Promise<Product | null> {
  if (process.env.API_URL) {
    try {
      const res = await fetch(`${process.env.API_URL}/products/${id}`, {
        cache: "no-store",
      })
      if (res.ok) return res.json()
    } catch {
      // fall through to local
    }
  }
  return localProducts.find((p) => p._id === id) ?? null
}

async function getAlternatives(category: string, excludeId: string): Promise<Product[]> {
  if (process.env.API_URL) {
    try {
      const res = await fetch(
        `${process.env.API_URL}/products?category=${category}`,
        { cache: "no-store" },
      )
      if (res.ok) {
        const json = await res.json()
        const raw: any[] = Array.isArray(json) ? json : (json?.products ?? json?.data ?? [])
        const data: Product[] = raw.map((p: any) => ({
          ...p,
          _id:   p._id ?? p.id ?? "",
          name:  p.name ?? p.productName ?? p.title ?? "",
          brand: p.brand ?? p.brandName ?? "",
          image: p.image ?? p.imageUrl ?? p.thumbnail ?? "",
          price: Number(p.price) || 0,
          specs: p.specs ?? [],
        })) as Product[]
        return data.filter((p) => p._id !== excludeId).slice(0, 4)
      }
    } catch {
      // fall through to local
    }
  }
  return localProducts
    .filter((p) => p.category === (category as Product["category"]) && p._id !== excludeId)
    .slice(0, 4)
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) notFound()

  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(product.price)

  const alternatives = await getAlternatives(product.category, id)

  return (
    <>
      <Navbar />

      <main className="bg-white">
        <div className="mx-auto max-w-7xl px-8 py-8">

          {/* ── Breadcrumb ── */}
          <nav className="mb-8 flex items-center gap-1.5 text-[0.78rem] text-gray-400">
            <Link href="/" className="transition-colors hover:text-gray-700">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link href={`/category/${product.category}`} className="transition-colors hover:text-gray-700">
              Products
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <Link href={`/category/${product.category}`} className="transition-colors hover:text-gray-700">
              {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 shrink-0" />
            <span className="text-gray-600">{product.name}</span>
          </nav>

          {/* ── Main 2-column section ── */}
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_420px]">

            {/* LEFT — Image + thumbnails */}
            <div className="flex flex-col gap-4">

              {/* Main image — dominant */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                {getImageUrl(product.image) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="absolute inset-0 h-full w-full object-contain p-8"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-20 w-20 text-gray-200" strokeWidth={1} />
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className="grid grid-cols-4 gap-3">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "relative aspect-square cursor-pointer overflow-hidden rounded-xl border bg-gray-50 transition-colors",
                      i === 0 ? "border-gray-900" : "border-gray-200 hover:border-gray-400",
                    )}
                  >
                    {getImageUrl(product.image) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getImageUrl(product.image)}
                        alt={product.name}
                        className="absolute inset-0 h-full w-full object-contain p-2.5"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-6 w-6 text-gray-200" strokeWidth={1} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>

            {/* RIGHT — Product info card */}
            <div className="flex flex-col rounded-2xl border border-gray-200 bg-white p-7 shadow-sm">

              {/* Brand eyebrow */}
              <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gray-400">
                {product.brand}
              </p>

              {/* Name */}
              <h1 className="text-[1.55rem] font-extrabold leading-[1.2] tracking-[-0.025em] text-gray-900">
                {product.name}
              </h1>

              {/* SKU */}
              <p className="mt-2.5 text-[0.75rem] text-gray-400">
                SKU: <span className="font-mono text-gray-500">{product._id.toUpperCase()}</span>
              </p>

              {/* Divider */}
              <div className="my-5 h-px bg-gray-100" />

              {/* Description */}
              <p className="text-[0.88rem] leading-[1.8] text-gray-500">
                {product.description}
              </p>

              {/* Divider */}
              <div className="my-5 h-px bg-gray-100" />

              {/* Price */}
              <div className="mb-5">
                <p className="mb-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Unit Price
                </p>
                <span className="text-[2.25rem] font-extrabold leading-none tracking-tight text-gray-900">
                  {formatted}
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2.5">
                <AddToCartButton
                  productId={product._id}
                  name={product.name}
                  price={product.price}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#1d4ed8]"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </AddToCartButton>

                <InquiryForm productId={product._id} productName={product.name} />
              </div>

              {/* Trust badges */}
              <div className="mt-5 grid grid-cols-3 divide-x divide-gray-100 rounded-xl border border-gray-100 bg-gray-50">
                {[
                  { icon: ShieldCheck, label: "ISO Certified"   },
                  { icon: Truck,       label: "24-hr Dispatch"  },
                  { icon: BadgeCheck,  label: "Genuine Parts"   },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-1.5 px-3 py-3.5">
                    <Icon className="h-4 w-4 text-gray-400" strokeWidth={1.75} />
                    <span className="text-center text-[0.68rem] font-medium leading-tight text-gray-500">
                      {label}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* ── Technical Specifications ── */}
          <section className="mt-14">
            <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gray-400">
              Details
            </p>
            <h2 className="mb-6 text-[1.35rem] font-extrabold tracking-[-0.02em] text-gray-900">
              Technical Specifications
            </h2>

            <div className="grid grid-cols-1 gap-px bg-gray-100 overflow-hidden rounded-xl border border-gray-100 sm:grid-cols-2">
              {(product.specs ?? []).map((row) => (
                <div key={row.label} className="flex flex-col gap-0.5 bg-white px-5 py-4">
                  <span className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-gray-400">
                    {row.label}
                  </span>
                  <span className="text-[0.9rem] font-medium text-gray-900">{row.value}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── Engineering Alternatives ── */}
          {alternatives.length > 0 && (
            <section className="mt-14 pb-16">
              <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gray-400">
                You may also need
              </p>
              <h2 className="mb-6 text-[1.35rem] font-extrabold tracking-[-0.02em] text-gray-900">
                Engineering Alternatives
              </h2>

              <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
                {alternatives.map((p) => (
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
            </section>
          )}

        </div>
      </main>

      <Footer />
    </>
  )
}
