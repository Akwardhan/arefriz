"use client"

import { useState } from "react"
import { FileText, X, Loader2, CheckCircle2, Package, Send, Lock, ArrowRight } from "lucide-react"
import { BASE_URL } from "@/lib/config"

interface Props {
  productId: string
  productName: string
}

type Status = "idle" | "loading" | "success" | "error"

const inputCls =
  "h-10 w-full rounded-lg border border-gray-200 bg-white px-3.5 text-[0.875rem] text-gray-900 outline-none transition-all placeholder:text-gray-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-50"

const labelCls = "mb-1.5 block text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-gray-400"

export default function InquiryForm({ productId, productName }: Props) {
  const [open,   setOpen]   = useState(false)
  const [status, setStatus] = useState<Status>("idle")
  const [form,   setForm]   = useState({
    name: "", email: "", phone: "", company: "", message: "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    try {
      const res = await fetch(`${BASE_URL}/api/inquiries`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ ...form, productId, productName }),
      })
      if (!res.ok) {
        setStatus("error")
        setTimeout(() => setStatus("idle"), 3000)
        return
      }
      setStatus("success")
    } catch {
      setStatus("error")
      setTimeout(() => setStatus("idle"), 3000)
    }
  }

  function handleClose() {
    if (status === "loading") return
    setOpen(false)
    setTimeout(() => {
      setStatus("idle")
      setForm({ name: "", email: "", phone: "", company: "", message: "" })
    }, 250)
  }

  return (
    <>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-900 hover:bg-gray-900 hover:text-white"
      >
        <FileText className="h-4 w-4" />
        Request Quote
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Panel */}
          <div className="relative z-10 flex w-full max-w-[520px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">

            {/* ── Dark header ── */}
            <div className="relative bg-gray-950 px-7 py-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gray-500">
                    Sales Inquiry
                  </p>
                  <h2 className="text-[1.25rem] font-extrabold leading-tight tracking-[-0.025em] text-white">
                    Request a Quote
                  </h2>
                  <p className="mt-1.5 text-[0.78rem] text-gray-400">
                    Personalised quotation within 24 business hours
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="mt-0.5 shrink-0 rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white/10 hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Product context pill — "regarding" */}
              <div className="mt-5 flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/20">
                  <Package className="h-4 w-4 text-blue-400" strokeWidth={1.75} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[0.64rem] font-semibold uppercase tracking-[0.12em] text-gray-500">
                    Regarding
                  </p>
                  <p className="mt-0.5 truncate text-[0.83rem] font-semibold text-white">
                    {productName}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-[0.65rem] font-semibold text-blue-400">
                  SKU · {productId.toUpperCase().slice(0, 8)}
                </span>
              </div>
            </div>

            {/* ── Body ── */}
            <div className="px-7 py-6">
              {status === "success" ? (

                /* ── Success state ── */
                <div className="flex flex-col items-center py-6 text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-[1.05rem] font-extrabold tracking-tight text-gray-900">
                    Inquiry submitted successfully
                  </h3>
                  <p className="mt-2 max-w-[300px] text-[0.82rem] leading-relaxed text-gray-400">
                    Our sales team will review your inquiry for{" "}
                    <span className="font-semibold text-gray-600">{productName}</span>{" "}
                    and get back to you within 24 hours.
                  </p>

                  <div className="mt-5 w-full rounded-xl border border-gray-100 bg-gray-50 px-5 py-4 text-left">
                    <p className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-gray-400">
                      What happens next
                    </p>
                    {[
                      "You'll receive a confirmation email shortly",
                      "Sales team reviews your requirements",
                      "Custom quote delivered within 24 hrs",
                    ].map((step, i) => (
                      <div key={step} className="flex items-start gap-2.5 py-1.5">
                        <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[0.6rem] font-bold text-blue-600">
                          {i + 1}
                        </span>
                        <p className="text-[0.8rem] text-gray-600">{step}</p>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleClose}
                    className="mt-6 flex h-10 items-center gap-2 rounded-xl bg-gray-900 px-7 text-sm font-semibold text-white transition-colors hover:bg-gray-700"
                  >
                    Done <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

              ) : (

                /* ── Form ── */
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                  {/* Row 1 — name + email */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        required
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>
                        Work Email <span className="text-red-400">*</span>
                      </label>
                      <input
                        required
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="john@company.com"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Row 2 — phone + company */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>Phone</label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Company</label>
                      <input
                        name="company"
                        value={form.company}
                        onChange={handleChange}
                        placeholder="Acme Industries"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className={labelCls}>
                      Requirements &amp; Message
                    </label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder={`Describe your requirements for ${productName}…`}
                      rows={4}
                      className={inputCls + " h-auto resize-none py-2.5"}
                    />
                  </div>

                  {/* Error */}
                  {status === "error" && (
                    <p className="rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-[0.8rem] text-red-600">
                      Something went wrong — please try again.
                    </p>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gray-950 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:opacity-60"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        Submit Inquiry
                      </>
                    )}
                  </button>

                  {/* Trust line */}
                  <div className="flex items-center justify-center gap-1.5 text-[0.72rem] text-gray-400">
                    <Lock className="h-3 w-3" />
                    Your information is secure and never shared
                  </div>

                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
