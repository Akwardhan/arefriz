import Navbar from "@/components/layout/Navbar"
import Footer from "@/components/layout/Footer"
import Link from "next/link"
import { CheckCircle2, Package, ShoppingBag, ArrowRight } from "lucide-react"

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; total?: string; items?: string; products?: string }>
}) {
  const { orderId, total, items, products } = await searchParams

  const totalAmount  = total    ? Number(total)         : null
  const itemsCount   = items    ? Number(items)         : null
  const productList  = products ? products.split(",").filter(Boolean) : []

  return (
    <>
      <Navbar />
      <main
        className="min-h-[80vh]"
        style={{ background: "linear-gradient(145deg, #f0f4ff 0%, #fafbff 55%, #f3f0ff 100%)" }}
      >
        <div className="mx-auto max-w-lg px-5 py-16">

          {/* ── Success icon ── */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div
              className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl"
              style={{
                background: "linear-gradient(135deg, #16a34a, #15803d)",
                boxShadow:  "0 8px 32px rgba(22,163,74,0.35)",
              }}
            >
              <CheckCircle2 className="h-10 w-10 text-white" strokeWidth={2} />
            </div>
            <p className="mb-2 text-xs font-black uppercase tracking-[0.22em]" style={{ color: "#16a34a" }}>
              Order Confirmed
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "#0f172a" }}>
              Thank you for your order!
            </h1>
            <p className="mt-2 text-sm" style={{ color: "#64748b" }}>
              Your order has been placed successfully and is being processed.
            </p>
          </div>

          {/* ── Order card ── */}
          <div
            className="overflow-hidden rounded-3xl border bg-white"
            style={{
              borderColor: "rgba(226,232,240,0.8)",
              boxShadow:   "0 4px 32px rgba(99,102,241,0.08), 0 1px 4px rgba(0,0,0,0.05)",
            }}
          >

            {/* Card header */}
            <div
              className="flex items-center justify-between border-b px-6 py-4"
              style={{
                borderColor: "#f1f5f9",
                background:  "linear-gradient(to right, #fafbff, #f5f7ff)",
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: "linear-gradient(135deg, #4f46e5, #2563eb)", boxShadow: "0 3px 10px rgba(79,70,229,0.3)" }}
                >
                  <ShoppingBag className="h-4 w-4 text-white" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[0.6rem] font-bold uppercase tracking-widest" style={{ color: "#94a3b8" }}>Order ID</p>
                  {orderId ? (
                    <p className="font-mono text-sm font-extrabold" style={{ color: "#0f172a" }}>
                      …{orderId.slice(-8).toUpperCase()}
                    </p>
                  ) : (
                    <p className="text-sm font-semibold" style={{ color: "#cbd5e1" }}>—</p>
                  )}
                </div>
              </div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Placed
              </span>
            </div>

            {/* Products */}
            {productList.length > 0 && (
              <div className="border-b px-6 py-5" style={{ borderColor: "#f1f5f9" }}>
                <p className="mb-3 text-[0.6rem] font-black uppercase tracking-widest" style={{ color: "#c7d2fe" }}>
                  Products Ordered
                </p>
                <div className="space-y-2">
                  {productList.map((name, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 rounded-xl border px-4 py-3"
                      style={{ borderColor: "#f1f5f9", background: "#fafbfe" }}
                    >
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                        style={{ background: "#eef2ff" }}
                      >
                        <Package className="h-3.5 w-3.5" style={{ color: "#818cf8" }} />
                      </span>
                      <span className="text-sm font-semibold" style={{ color: "#1e293b" }}>
                        {name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary row */}
            <div className="px-6 py-5">
              <div className="space-y-2.5">
                {itemsCount !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: "#64748b" }}>Items ordered</span>
                    <span className="text-sm font-semibold" style={{ color: "#1e293b" }}>
                      {itemsCount} {itemsCount === 1 ? "item" : "items"}
                    </span>
                  </div>
                )}
                {totalAmount !== null && (
                  <>
                    <div className="h-px" style={{ background: "#f1f5f9" }} />
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold" style={{ color: "#0f172a" }}>Total Paid</span>
                      <span
                        className="text-xl font-extrabold tracking-tight"
                        style={{ color: "#2563eb" }}
                      >
                        {fmt(totalAmount)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* ── What happens next ── */}
          <div
            className="mt-5 rounded-2xl border px-5 py-4"
            style={{ borderColor: "#e8eeff", background: "linear-gradient(135deg, #f8faff, #f3f4ff)" }}
          >
            <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: "#818cf8" }}>
              What happens next?
            </p>
            <div className="space-y-1.5">
              {[
                "Our team will review and confirm your order",
                "You'll receive updates as your order is processed",
                "Track your order status in your account",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span
                    className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[0.55rem] font-black text-white"
                    style={{ background: "#6366f1" }}
                  >
                    {i + 1}
                  </span>
                  <span className="text-xs" style={{ color: "#475569" }}>{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── CTAs ── */}
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/category/valves"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: "linear-gradient(135deg, #4f46e5, #2563eb)",
                boxShadow:  "0 4px 16px rgba(79,70,229,0.35)",
              }}
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="flex h-11 w-full items-center justify-center rounded-2xl border text-sm font-semibold transition-all hover:shadow-md"
              style={{ borderColor: "#e2e8f0", color: "#475569", background: "#fff" }}
            >
              Back to Home
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
