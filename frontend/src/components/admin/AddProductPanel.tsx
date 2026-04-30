"use client"

import { useEffect, useRef, useState } from "react"
import { Plus, Trash2, Package, CheckCircle2, AlertCircle, Upload, X, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { authHeaders } from "@/lib/auth"
import { BASE_URL } from "@/lib/config"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Spec { label: string; value: string }

const CATEGORIES = ["valves", "compressors", "controls", "piping", "electrical"] as const

const SECTIONS = [
  { id: "basic",       label: "Basic Information"   },
  { id: "pricing",     label: "Pricing & Inventory" },
  { id: "media",       label: "Media"               },
  { id: "description", label: "Description"         },
  { id: "specs",       label: "Specifications"      },
] as const

const EMPTY_FORM = {
  name:             "",
  sku:              "",
  brand:            "",
  category:         "valves" as typeof CATEGORIES[number],
  type:             "",
  price:            "",
  shortDescription: "",
  description:      "",
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AddProductPanel() {
  const [form,          setForm]          = useState(EMPTY_FORM)
  const [specs,         setSpecs]         = useState<Spec[]>([{ label: "", value: "" }])
  const [inStock,       setInStock]       = useState(true)
  const [imageFiles,    setImageFiles]    = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [primaryIndex,  setPrimaryIndex]  = useState(0)
  const [status,        setStatus]        = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errMsg,        setErrMsg]        = useState("")

  const previewUrlsRef = useRef<string[]>([])
  useEffect(() => { previewUrlsRef.current = imagePreviews }, [imagePreviews])
  useEffect(() => () => { previewUrlsRef.current.forEach(URL.revokeObjectURL) }, [])

  function set(field: keyof typeof EMPTY_FORM, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newFiles = Array.from(e.target.files ?? [])
    if (!newFiles.length) return
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f))
    setImageFiles((prev) => [...prev, ...newFiles])
    setImagePreviews((prev) => [...prev, ...newPreviews])
    e.target.value = ""
  }

  function removeImage(i: number) {
    URL.revokeObjectURL(imagePreviews[i])
    setImageFiles((prev) => prev.filter((_, idx) => idx !== i))
    setImagePreviews((prev) => prev.filter((_, idx) => idx !== i))
    setPrimaryIndex((prev) => {
      if (prev === i)  return 0
      if (prev > i)    return prev - 1
      return prev
    })
  }

  function addSpec()    { setSpecs((prev) => [...prev, { label: "", value: "" }]) }
  function removeSpec(i: number) { setSpecs((prev) => prev.filter((_, idx) => idx !== i)) }
  function updateSpec(i: number, key: "label" | "value", val: string) {
    setSpecs((prev) => prev.map((s, idx) => (idx === i ? { ...s, [key]: val } : s)))
  }

  function reset() {
    setForm(EMPTY_FORM)
    setSpecs([{ label: "", value: "" }])
    setInStock(true)
    previewUrlsRef.current.forEach(URL.revokeObjectURL)
    setImageFiles([])
    setImagePreviews([])
    setPrimaryIndex(0)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    setErrMsg("")

    const fd = new FormData()
    fd.append("name",        form.name)
    fd.append("brand",       form.brand)
    fd.append("category",    form.category)
    fd.append("type",        form.type)
    fd.append("price",       form.price)
    fd.append("stock",       inStock ? "1" : "0")
    fd.append("description", [form.shortDescription, form.description].filter(Boolean).join("\n\n"))
    fd.append("specs",       JSON.stringify(specs.filter((s) => s.label.trim() && s.value.trim()).map((s) => ({ key: s.label, value: s.value }))))
    if (imageFiles.length > 0) {
      const primary = imageFiles[primaryIndex]
      fd.append("image", primary, primary.name)
    }

    try {
      const res = await fetch(`${BASE_URL}/api/products`, {
        method:  "POST",
        headers: authHeaders(),
        body:    fd,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? `Error ${res.status}`)
      }
      setStatus("success")
      reset()
      setTimeout(() => setStatus("idle"), 4000)
    } catch (err) {
      setStatus("error")
      setErrMsg(err instanceof Error ? err.message : "Something went wrong")
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">

      {/* ── Page header ── */}
      <div className="mb-10">
        <p className="mb-1.5 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-indigo-400">
          Admin · Products
        </p>
        <h1 className="text-[1.75rem] font-extrabold tracking-[-0.025em] text-gray-900">
          Add New Product
        </h1>
        <p className="mt-1.5 text-[0.83rem] text-gray-400">
          Fill in all required fields before publishing.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">

        {/* ── Sticky sidebar ── */}
        <aside className="hidden lg:block">
          <div
            className="sticky top-[76px] overflow-hidden rounded-2xl border border-gray-100 bg-white"
            style={{ boxShadow: "0 4px 24px rgba(99,102,241,0.07), 0 0 0 1px rgba(0,0,0,0.03)" }}
          >
            {/* Gradient top strip */}
            <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, #4f46e5 0%, #2563eb 60%, #7c3aed 100%)" }} />

            <div className="p-4">
              <p className="mb-3 px-1.5 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-gray-300">
                Sections
              </p>
              <nav className="space-y-0.5">
                {SECTIONS.map((s, i) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[0.78rem] font-medium text-gray-500 transition-all hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[0.6rem] font-black text-white"
                      style={{ background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)", opacity: 0.75 }}
                    >
                      {i + 1}
                    </span>
                    {s.label}
                  </a>
                ))}
              </nav>

              <div className="mt-5 border-t border-gray-50 pt-4">
                <button
                  type="submit"
                  form="add-product-form"
                  disabled={status === "loading"}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-xl text-[0.82rem] font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)",
                    boxShadow: status === "loading" ? "none" : "0 4px 14px rgba(79,70,229,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
                  }}
                >
                  {status === "loading" ? (
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {status === "loading" ? "Saving…" : "Publish"}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Form ── */}
        <form id="add-product-form" onSubmit={handleSubmit} className="space-y-5">

          {/* ── 1. Basic Information ── */}
          <Card id="basic" step={1} title="Basic Information" description="Core product details and categorization.">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Product Name" required>
                  <input required value={form.name} onChange={(e) => set("name", e.target.value)}
                    placeholder="e.g. Danfoss EVR 10 Solenoid Valve" className={inputCls} />
                </Field>
              </div>
              <Field label="SKU">
                <input value={form.sku} onChange={(e) => set("sku", e.target.value)}
                  placeholder="e.g. DAN-EVR-10-NC" className={inputCls} />
              </Field>
              <Field label="Brand" required>
                <input required value={form.brand} onChange={(e) => set("brand", e.target.value)}
                  placeholder="e.g. Danfoss" className={inputCls} />
              </Field>
              <Field label="Category" required>
                <select required value={form.category}
                  onChange={(e) => set("category", e.target.value as typeof CATEGORIES[number])}
                  className={inputCls}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </Field>
              <Field label="Type">
                <input value={form.type} onChange={(e) => set("type", e.target.value)}
                  placeholder="e.g. Solenoid, PLC, VFD" className={inputCls} />
              </Field>
            </div>
          </Card>

          {/* ── 2. Pricing & Inventory ── */}
          <Card id="pricing" step={2} title="Pricing & Inventory" description="Set the unit price and current stock status.">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Price (₹)" required>
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[0.82rem] font-semibold text-gray-400">₹</span>
                  <input required type="number" min={0} value={form.price}
                    onChange={(e) => set("price", e.target.value)}
                    placeholder="0" className={cn(inputCls, "pl-7")} />
                </div>
              </Field>
              <Field label="Stock Status">
                <div className="flex h-10 overflow-hidden rounded-lg border border-gray-200 text-[0.82rem]">
                  <button type="button" onClick={() => setInStock(true)}
                    className={cn("flex-1 font-semibold transition-all",
                      inStock ? "text-white" : "bg-white text-gray-400 hover:bg-indigo-50 hover:text-indigo-600")}
                    style={inStock ? { background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)" } : {}}>
                    In Stock
                  </button>
                  <div className="w-px shrink-0 bg-gray-200" />
                  <button type="button" onClick={() => setInStock(false)}
                    className={cn("flex-1 font-semibold transition-all",
                      !inStock ? "text-white" : "bg-white text-gray-400 hover:bg-indigo-50 hover:text-indigo-600")}
                    style={!inStock ? { background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)" } : {}}>
                    Out of Stock
                  </button>
                </div>
              </Field>
            </div>
          </Card>

          {/* ── 3. Media ── */}
          <Card id="media" step={3} title="Media" description="Upload multiple images and set the primary display image.">
            <Field label="Product Images">
              <div className="relative">
                <input type="file" accept="image/*" multiple id="image-upload"
                  className="sr-only" onChange={handleFileChange} />
                <label
                  htmlFor="image-upload"
                  className="flex cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 px-4 py-3 text-[0.82rem] text-gray-400 transition-all hover:border-indigo-300 hover:bg-indigo-50/40 hover:text-indigo-500"
                >
                  <Upload className="h-4 w-4 shrink-0" />
                  <span className="truncate">
                    {imagePreviews.length > 0
                      ? `${imagePreviews.length} image${imagePreviews.length !== 1 ? "s" : ""} selected — click to add more`
                      : "Choose image files… (select 5 or more)"}
                  </span>
                </label>
              </div>
            </Field>

            {imagePreviews.length > 0 ? (
              <div className="mt-5">
                <p className="mb-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-gray-400">
                  Click an image to set as display
                </p>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
                  {imagePreviews.map((src, i) => (
                    <div key={i} className="relative">
                      <button type="button" onClick={() => setPrimaryIndex(i)}
                        className={cn("relative aspect-square w-full overflow-hidden rounded-xl border-2 transition-all",
                          primaryIndex === i
                            ? "border-indigo-500 ring-4 ring-indigo-100"
                            : "border-gray-200 hover:border-indigo-300")}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={`Image ${i + 1}`} className="h-full w-full object-cover" />
                        {primaryIndex === i && (
                          <div className="absolute inset-0 bg-indigo-600/10" />
                        )}
                      </button>
                      {primaryIndex === i && (
                        <div
                          className="absolute bottom-1.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[0.58rem] font-black leading-none text-white"
                          style={{ background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)" }}
                        >
                          Display
                        </div>
                      )}
                      <button type="button" onClick={() => removeImage(i)}
                        className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm transition-colors hover:border-red-200 hover:text-red-500"
                        aria-label="Remove">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-5 flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-100 bg-gray-50/50">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: "linear-gradient(135deg, #f0f4ff 0%, #eef2ff 100%)" }}
                >
                  <Package className="h-5 w-5 text-indigo-200" strokeWidth={1.25} />
                </div>
                <p className="text-[0.75rem] font-medium text-gray-300">Images will appear here</p>
              </div>
            )}
          </Card>

          {/* ── 4. Description ── */}
          <Card id="description" step={4} title="Description" description="Shown on the product detail page.">
            <div className="space-y-5">
              <Field label="Short Description">
                <input value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)}
                  placeholder="One or two sentences summarising the product." className={inputCls} />
              </Field>
              <Field label="Full Description">
                <textarea rows={5} value={form.description} onChange={(e) => set("description", e.target.value)}
                  placeholder="Detailed product description, features, and applications…"
                  className={cn(inputCls, "h-auto resize-none py-2.5")} />
              </Field>
            </div>
          </Card>

          {/* ── 5. Specifications ── */}
          <Card id="specs" step={5} title="Technical Specifications" description="Key-value pairs shown in the specs table.">
            <div className="space-y-2.5">
              {specs.length > 0 && (
                <div className="grid grid-cols-[1fr_1fr_36px] gap-3 px-1">
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-gray-300">Attribute</span>
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-gray-300">Value</span>
                </div>
              )}
              {specs.map((spec, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_36px] items-center gap-3">
                  <input value={spec.label} onChange={(e) => updateSpec(i, "label", e.target.value)}
                    placeholder="e.g. Voltage" className={inputCls} />
                  <input value={spec.value} onChange={(e) => updateSpec(i, "value", e.target.value)}
                    placeholder="e.g. 220V" className={inputCls} />
                  <button type="button" onClick={() => removeSpec(i)} disabled={specs.length === 1}
                    className="flex h-10 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-300 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
                    aria-label="Remove">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button type="button" onClick={addSpec}
              className="mt-5 flex items-center gap-2 rounded-lg border border-dashed border-indigo-200 px-4 py-2.5 text-[0.82rem] font-medium text-indigo-400 transition-all hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600">
              <Plus className="h-3.5 w-3.5" />
              Add Specification
            </button>
          </Card>

          {/* ── Status banners ── */}
          {status === "success" && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4"
              style={{ boxShadow: "0 2px 12px rgba(16,185,129,0.08)" }}>
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
              <p className="text-[0.85rem] font-semibold text-emerald-700">Product published successfully.</p>
            </div>
          )}
          {status === "error" && (
            <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-5 py-4"
              style={{ boxShadow: "0 2px 12px rgba(239,68,68,0.08)" }}>
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
              <p className="text-[0.85rem] font-semibold text-red-600">{errMsg}</p>
            </div>
          )}

          {/* ── Mobile submit ── */}
          <div className="pb-10 lg:hidden">
            <button type="submit" disabled={status === "loading"}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)",
                boxShadow: status === "loading" ? "none" : "0 4px 20px rgba(79,70,229,0.35), inset 0 1px 0 rgba(255,255,255,0.12)",
              }}>
              {status === "loading" ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : <Sparkles className="h-4 w-4" />}
              {status === "loading" ? "Saving…" : "Publish Product"}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function Card({ id, step, title, description, children }: {
  id: string; step?: number; title: string; description: string; children: React.ReactNode
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-gray-100 bg-white"
      style={{ boxShadow: "0 2px 16px rgba(99,102,241,0.06), 0 0 0 1px rgba(0,0,0,0.03)" }}
    >
      {/* Gradient accent strip */}
      <div className="h-[3px] w-full" style={{ background: "linear-gradient(90deg, #4f46e5 0%, #2563eb 55%, #7c3aed 100%)" }} />

      <div className="p-8">
        <div className="mb-6 flex items-start gap-4 border-b border-gray-50 pb-5">
          {step !== undefined && (
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[0.72rem] font-black text-white"
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)",
                boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
              }}
            >
              {step}
            </div>
          )}
          <div>
            <h2 className="text-[0.95rem] font-bold text-gray-900">{title}</h2>
            <p className="mt-0.5 text-[0.78rem] text-gray-400">{description}</p>
          </div>
        </div>
        {children}
      </div>
    </section>
  )
}

function Field({ label, required, children }: {
  label: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[0.7rem] font-bold uppercase tracking-[0.12em] text-gray-400">
        {label}{required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  "h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 text-[0.88rem] text-gray-900 outline-none transition-all placeholder:text-gray-300 focus:border-indigo-300 focus:bg-white focus:ring-3 focus:ring-indigo-50"
