"use client";

import { useState } from "react";
import { Search, ShieldCheck, Zap, Headphones } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const trustPoints = [
  { icon: ShieldCheck, label: "Genuine Parts Only" },
  { icon: Zap,         label: "24-Hour Dispatch"  },
  { icon: Headphones,  label: "Technical Support" },
];

export default function Hero() {
  const [query, setQuery] = useState("");

  return (
    <section className="relative overflow-hidden py-36 px-6">

      {/* ── Simulated blurred industrial background ── */}
      {/* Layer 1: dark industrial color mass — blurred heavily to look like a photo */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[-60px]"
        style={{
          filter: "blur(72px) saturate(1.2)",
          background: `
            radial-gradient(ellipse at 15% 60%, #0f2744 0%, transparent 45%),
            radial-gradient(ellipse at 85% 30%, #1c3555 0%, transparent 40%),
            radial-gradient(ellipse at 50% 90%, #111827 0%, transparent 50%),
            radial-gradient(ellipse at 70% 70%, #1e3a5f 0%, transparent 40%),
            radial-gradient(ellipse at 30% 20%, #374151 0%, transparent 45%),
            linear-gradient(160deg, #0d1f35 0%, #1f2d40 40%, #2d3f55 70%, #0d1f35 100%)
          `,
        }}
      />
      {/* Layer 2: white overlay — lifts brightness to feel "light" */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-white/[0.87]"
      />
      {/* Layer 3: very faint dot texture over the overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.028]"
        style={{
          backgroundImage: "radial-gradient(circle, #0f2744 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* ── Content ── */}
      <div className="relative mx-auto max-w-2xl text-center">

        {/* Label */}
        <p className="mb-6 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-gray-400">
          Elite Industrial Procurement
        </p>

        {/* Headline */}
        <h1
          className="text-[3.5rem] font-extrabold leading-[1.07] tracking-[-0.03em] text-gray-900 sm:text-[4.75rem]"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          Find the Right Part,
          <br />
          <span style={{ color: "#2563EB" }}>Instantly.</span>
        </h1>

        {/* Subtext */}
        <p className="mx-auto mt-6 max-w-[26rem] text-[1rem] leading-[1.8] text-gray-500">
          ARefriz connects industrial buyers with verified suppliers for
          compressors, valves, and controllers — fast and reliable.
        </p>

        {/* Search bar */}
        <div className="mt-11 flex h-[3.75rem] w-full items-center gap-2 rounded-2xl bg-gray-100/90 px-3 shadow-[0_2px_0_0_rgba(0,0,0,0.04),0_12px_40px_-8px_rgba(15,39,68,0.14)] transition-shadow focus-within:shadow-[0_2px_0_0_rgba(0,0,0,0.04),0_16px_48px_-8px_rgba(37,99,235,0.2)]">
          <Search className="ml-2 h-5 w-5 shrink-0 text-gray-400" />

          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by part name, model number, or category…"
            className="h-full flex-1 border-0 bg-transparent text-[0.93rem] text-gray-800 shadow-none placeholder:text-gray-400 focus-visible:ring-0"
          />

          <Button
            className="h-10 shrink-0 rounded-xl px-7 text-sm font-semibold text-white"
            style={{ backgroundColor: "#2563EB" }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#1d4ed8")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#2563EB")}
          >
            Search
          </Button>
        </div>

        {/* Trust points */}
        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
          {trustPoints.map(({ icon: Icon, label }, i) => (
            <div key={label} className="flex items-center gap-2">
              {i > 0 && (
                <span className="mr-7 hidden h-3.5 w-px bg-gray-300 sm:block" />
              )}
              <Icon className="h-[15px] w-[15px] shrink-0 text-gray-400" strokeWidth={2.2} />
              <span className="text-[0.82rem] font-medium tracking-wide text-gray-500">
                {label}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
