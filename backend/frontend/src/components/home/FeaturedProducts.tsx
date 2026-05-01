"use client";

import { useEffect, useState } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import ProductCard from "@/components/shared/ProductCard";
import { Button } from "@/components/ui/button";
import { BASE_URL } from "@/lib/config";

// Normalised shape used inside this component
interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  image: string | null;
  href?: string;
}

// Raw shape returned by the API (MongoDB uses _id)
interface RawProduct {
  _id?: string;
  id?: string;
  name: string;
  brand: string;
  price: number;
  image?: string | null;
  href?: string;
}

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: Product[] };

const API_URL = `${BASE_URL}/api/products`;

export default function FeaturedProducts() {
  const [state, setState] = useState<State>({ status: "idle" });

  const fetchProducts = async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const raw: RawProduct[] = await res.json();
      // Normalise: handle MongoDB _id and missing/empty images
      const data: Product[] = raw.map((p, i) => ({
        id: p._id ?? p.id ?? String(i),
        name: p.name,
        brand: p.brand,
        price: p.price,
        image: p.image || null,
        href: p.href,
      }));
      console.log("Fetched products:", data);
      setState({ status: "success", data });
    } catch (err) {
      setState({
        status: "error",
        message: err instanceof Error ? err.message : "Failed to load products.",
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-6xl">

        {/* ── Header ── */}
        <div className="mb-10">
          <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gray-400">
            Catalog
          </p>
          <h2
            className="text-[2rem] font-extrabold leading-tight tracking-[-0.025em] text-gray-900 sm:text-[2.5rem]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Featured Products
          </h2>
        </div>

        {/* ── States ── */}
        {state.status === "loading" && <SkeletonGrid />}

        {state.status === "error" && (
          <ErrorState message={state.message} onRetry={fetchProducts} />
        )}

        {state.status === "success" && state.data.length === 0 && (
          <EmptyState />
        )}

        {state.status === "success" && state.data.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {state.data.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                image={product.image}
                name={product.name}
                brand={product.brand}
                price={product.price}
                href={product.href ?? `/product/${product.id}`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}

/* ── Skeleton grid ─────────────────────────────── */
function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-gray-100 bg-white"
        >
          {/* Image placeholder */}
          <div className="aspect-[4/3] w-full animate-pulse bg-gray-100" />
          {/* Body placeholder */}
          <div className="flex flex-col gap-3 p-5">
            <div className="h-2.5 w-16 animate-pulse rounded-full bg-gray-100" />
            <div className="h-4 w-3/4 animate-pulse rounded-full bg-gray-100" />
            <div className="h-4 w-1/2 animate-pulse rounded-full bg-gray-100" />
            <div className="mt-1 h-px w-full bg-gray-100" />
            <div className="flex items-center justify-between pt-1">
              <div className="h-5 w-20 animate-pulse rounded-full bg-gray-100" />
              <div className="h-8 w-24 animate-pulse rounded-lg bg-gray-100" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Error state ───────────────────────────────── */
function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-100 bg-red-50/50 px-6 py-16 text-center">
      <AlertCircle className="mb-4 h-8 w-8 text-red-400" strokeWidth={1.5} />
      <p className="text-sm font-semibold text-gray-900">Could not load products</p>
      <p className="mt-1 max-w-xs text-xs leading-relaxed text-gray-500">{message}</p>
      <Button
        size="sm"
        variant="outline"
        className="mt-6 gap-2 rounded-lg text-xs font-semibold"
        onClick={onRetry}
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Try again
      </Button>
    </div>
  );
}

/* ── Empty state ───────────────────────────────── */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-gray-50 px-6 py-16 text-center">
      <p className="text-sm font-semibold text-gray-700">No products found</p>
      <p className="mt-1 text-xs text-gray-400">
        Check back soon — new parts are added regularly.
      </p>
    </div>
  );
}
