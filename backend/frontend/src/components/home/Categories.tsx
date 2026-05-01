import Link from "next/link";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    slug: "valves",
    title: "Valves",
    description: "Ball, gate, globe & control valves for all pressure classes and industrial media.",
    price: "Starting from ₹1,500",
    // deep steel-blue industrial tones
    bg: "radial-gradient(ellipse at 30% 80%, #1a3a5c 0%, #0d1f35 55%, #080f1a 100%)",
    accent: "from-black/10 via-black/50 to-black/90",
    large: true,
  },
  {
    slug: "controls",
    title: "Controls",
    description: "PLCs, DCS modules, HMI panels, and field instruments for process automation.",
    price: "Starting from ₹3,800",
    // dark teal-slate
    bg: "radial-gradient(ellipse at 70% 20%, #0f2d2d 0%, #071a1a 50%, #030d0d 100%)",
    accent: "from-black/10 via-black/50 to-black/90",
    large: true,
  },
  {
    slug: "pneumatic",
    title: "Pneumatic",
    description: "Cylinders, actuators, and air preparation units for industrial motion control.",
    price: "Starting from ₹1,000",
    // dark graphite
    bg: "radial-gradient(ellipse at 50% 70%, #252525 0%, #111111 50%, #050505 100%)",
    accent: "from-black/10 via-black/55 to-black/90",
    large: false,
  },
  {
    slug: "piping",
    title: "Piping",
    description: "Pipes, fittings, flanges and gaskets rated for high-pressure applications.",
    price: "Starting from ₹650",
    // dark bronze-rust
    bg: "radial-gradient(ellipse at 25% 40%, #2e1a0c 0%, #180e06 50%, #080402 100%)",
    accent: "from-black/10 via-black/55 to-black/90",
    large: false,
  },
  {
    slug: "electrical",
    title: "Electrical",
    description: "Switchgear, terminals, cable trays and industrial wiring components.",
    price: "Starting from ₹1,850",
    // deep navy
    bg: "radial-gradient(ellipse at 75% 60%, #0a1628 0%, #050d1a 50%, #020508 100%)",
    accent: "from-black/10 via-black/55 to-black/90",
    large: false,
  },
];

const large = categories.filter((c) => c.large);
const small = categories.filter((c) => !c.large);

export default function Categories() {
  return (
    <section className="bg-white px-6 py-24">
      <div className="mx-auto max-w-6xl">

        {/* ── Header ── */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gray-400">
              Browse by category
            </p>
            <h2
              className="text-[2rem] font-extrabold leading-tight tracking-[-0.025em] text-gray-900 sm:text-[2.5rem]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Core MVP Categories
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Everything your plant needs, sourced from verified suppliers.
            </p>
          </div>
          <Link
            href="/category/valves"
            className="hidden items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900 sm:flex"
          >
            View All Categories
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* ── Top row: 2 large cards ── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {large.map((cat) => (
            <CategoryCard key={cat.slug} cat={cat} height="h-72" />
          ))}
        </div>

        {/* ── Bottom row: 3 small cards ── */}
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {small.map((cat) => (
            <CategoryCard key={cat.slug} cat={cat} height="h-52" />
          ))}
        </div>

        {/* Mobile "View All" link */}
        <div className="mt-8 flex justify-center sm:hidden">
          <Link
            href="/category/valves"
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            View All Categories <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

      </div>
    </section>
  );
}

/* ─────────────────────────────────── */
/* Card sub-component                  */
/* ─────────────────────────────────── */
type Cat = (typeof categories)[number];

function CategoryCard({ cat, height }: { cat: Cat; height: string }) {
  return (
    <Link
      href={`/category/${cat.slug}`}
      className={`group relative overflow-hidden rounded-xl shadow-md ${height} block`}
    >
      {/* Background "image" (CSS gradient simulating dark industrial photo) */}
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105"
        style={{ background: cat.bg }}
      />

      {/* Gradient overlay — bottom-to-top dark fade */}
      <div
        className={`absolute inset-0 bg-gradient-to-t ${cat.accent}`}
      />

      {/* Subtle noise texture */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
        }}
      />

      {/* Card content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6">
        {/* Category title */}
        <h3 className="text-xl font-bold leading-tight tracking-tight text-white">
          {cat.title}
        </h3>

        {/* Description — slides up slightly on hover */}
        <p className="mt-1.5 max-w-[90%] text-[0.78rem] leading-[1.55] text-white/60 transition-all duration-300 group-hover:text-white/75">
          {cat.description}
        </p>

        {/* Price + arrow */}
        <div className="mt-4 flex items-center justify-between">
          <span className="text-[0.72rem] font-semibold uppercase tracking-widest text-white/50">
            {cat.price}
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/60 opacity-0 ring-1 ring-white/20 transition-all duration-300 group-hover:opacity-100 group-hover:bg-white/15">
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
