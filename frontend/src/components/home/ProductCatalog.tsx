import { products, type Product } from "@/data/products";
import ProductCard from "@/components/shared/ProductCard";

// ── Group products by category ──────────────────────────────────────────────
type Category = Product["category"];

const CATEGORY_ORDER: Category[] = [
  "valves",
  "controls",
  "piping",
  "electrical",
  "compressors",
];

const grouped = CATEGORY_ORDER.reduce<Record<Category, Product[]>>(
  (acc, cat) => {
    acc[cat] = products.filter((p) => p.category === cat);
    return acc;
  },
  {} as Record<Category, Product[]>,
);

// ── Component ───────────────────────────────────────────────────────────────
export default function ProductCatalog() {
  return (
    <section className="bg-gray-50 px-6 py-24">
      <div className="mx-auto max-w-6xl">

        {/* Page header */}
        <div className="mb-16">
          <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gray-400">
            Full Catalog
          </p>
          <h2
            className="text-[2rem] font-extrabold leading-tight tracking-[-0.025em] text-gray-900 sm:text-[2.5rem]"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Browse by Category
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            {products.length} products across {CATEGORY_ORDER.length} categories.
          </p>
        </div>

        {/* Category sections */}
        <div className="space-y-20">
          {CATEGORY_ORDER.map((category) => (
            <CategorySection
              key={category}
              title={category}
              items={grouped[category]}
            />
          ))}
        </div>

      </div>
    </section>
  );
}

// ── Category section ─────────────────────────────────────────────────────────
function CategorySection({
  title,
  items,
}: {
  title: Category;
  items: Product[];
}) {
  if (items.length === 0) return null;

  return (
    <div>
      {/* Section title row */}
      <div className="mb-7 flex items-center gap-4">
        <h3
          className="text-xl font-bold tracking-tight text-gray-900"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          {title}
        </h3>
        <span className="rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium text-gray-400">
          {items.length} products
        </span>
        {/* Divider line */}
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {items.map((product) => (
          <ProductCard
            key={product._id}
            id={product._id}
            image={product.image}
            name={product.name}
            brand={product.brand}
            price={product.price}
            href={`/product/${product._id}`}
          />
        ))}
      </div>
    </div>
  );
}
