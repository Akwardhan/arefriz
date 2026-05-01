"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Navbar from "@/components/layout/Navbar"
import { useRequireAuth } from "@/lib/useRequireAuth"
import { BASE_URL } from "@/lib/config"

interface User {
  _id?: string
  name?: string
  email?: string
  phone?: string
}

interface OrderProduct {
  productId?: { _id?: string; name?: string; price?: number } | string
  name?: string
  qty?: number
}

interface Order {
  _id: string
  createdAt: string
  status?: string
  total?: number
  items?: OrderProduct[]
}

interface Inquiry {
  _id: string
  subject?: string
  status?: string
  createdAt: string
}

export default function AccountPage() {
  useRequireAuth()

  const [user, setUser] = useState<User | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<User>({})
  const [orders, setOrders] = useState<Order[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user")
      if (stored) {
        const u = JSON.parse(stored)
        setUser(u)
        setForm(u)
      }
    } catch {}
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("userToken")
    if (!token) return

    fetch(`${BASE_URL}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : Array.isArray(data.orders) ? data.orders : []
        const withName = list.filter((o: Order) => {
          const first = o.items?.[0]
          const pid = first?.productId
          return typeof pid === "object" && pid?.name
        })
        setOrders(withName.slice(0, 3))
      })
      .catch(() => {})

    fetch(`${BASE_URL}/api/inquiries`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : Array.isArray(data.inquiries) ? data.inquiries : []
        setInquiries(list.slice(0, 5))
      })
      .catch(() => {})
  }, [])

  function handleSave() {
    setUser(form)
    localStorage.setItem("user", JSON.stringify(form))
    setEditing(false)
  }

  function handleLogout() {
    localStorage.removeItem("userToken")
    localStorage.removeItem("user")
    window.location.href = "/"
  }

  const statusStyle = (s?: string) => {
    if (s === "delivered") return "bg-green-50 text-green-600"
    if (s === "cancelled") return "bg-red-50 text-red-500"
    return "bg-gray-100 text-gray-500"
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="mx-auto max-w-2xl px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">My Account</h1>
          <p className="mt-1 text-sm text-gray-500">Manage your profile and orders</p>
        </div>

        {/* ── Profile ── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Profile</h2>
            <button
              onClick={() => editing ? handleSave() : setEditing(true)}
              className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              {editing ? "Save" : "Edit"}
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {[
              { label: "Name",  key: "name"  as const, type: "text"  },
              { label: "Email", key: "email" as const, type: "email" },
              { label: "Phone", key: "phone" as const, type: "tel"   },
            ].map(({ label, key, type }) => (
              <div key={key} className="flex items-center justify-between py-4">
                <span className="w-20 shrink-0 text-sm text-gray-500">{label}</span>
                {editing ? (
                  <input
                    type={type}
                    value={form[key] ?? ""}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="flex-1 text-right text-sm text-gray-900 border-b border-gray-300 bg-transparent outline-none focus:border-blue-500"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900">{user?.[key] ?? "—"}</span>
                )}
              </div>
            ))}
          </div>

          {editing && (
            <button
              onClick={() => setEditing(false)}
              className="mt-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
          )}
        </section>

        {/* ── Orders ── */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Recent Orders</h2>
            <Link href="/account/orders" className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
              View all →
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-400">No orders yet</p>
              </div>
            ) : (
              orders.map(order => {
                const first = order.items?.[0]
                const pid = first?.productId
                const productName = typeof pid === "object" ? pid?.name : undefined
                return (
                  <div key={order._id} className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{productName}</p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      {order.total != null && (
                        <span className="text-sm text-gray-700">₹{order.total.toLocaleString()}</span>
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle(order.status)}`}>
                        {order.status ?? "pending"}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          <div className="mt-5">
            <Link
              href="/account/orders"
              className="inline-block rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400"
            >
              View All Orders
            </Link>
          </div>
        </section>

        {/* ── Inquiries ── */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">Inquiries</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {inquiries.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-gray-400">No inquiries yet</p>
              </div>
            ) : (
              inquiries.map(inq => (
                <div key={inq._id} className="flex items-center justify-between py-4">
                  <p className="text-sm text-gray-900">{inq.subject ?? "Inquiry"}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">
                      {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                    {inq.status && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                        {inq.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-5">
            <Link
              href="/inquiry/new"
              className="inline-block rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              Raise Inquiry
            </Link>
          </div>
        </section>

        {/* ── Logout ── */}
        <section className="mt-12 border-t border-gray-100 pt-6">
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-red-500 transition-colors hover:text-red-600"
          >
            Log out
          </button>
        </section>

      </div>
    </div>
  )
}
