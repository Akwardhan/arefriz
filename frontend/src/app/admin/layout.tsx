"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import AdminGuard from "@/components/auth/AdminGuard"

const NAV_LINKS = [
  {
    href: "/admin/products",
    label: "Products",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: "/admin/inquiries",
    label: "Inquiries",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
]

function AdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  function handleLogout() {
    sessionStorage.removeItem("adminToken")
    router.replace("/admin/login")
  }

  return (
    <aside style={{
      width: "240px",
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0f0c29 0%, #302b63 100%)",
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      borderRight: "1px solid rgba(255,255,255,0.07)",
    }}>

      {/* Brand + Sign out */}
      <div style={{
        padding: "20px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "9px", flexShrink: 0,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(99,102,241,0.4)",
          }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <p style={{ color: "white", fontWeight: 700, fontSize: "14px", lineHeight: 1, margin: 0 }}>
              ARefriz
            </p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", marginTop: "3px" }}>
              Admin Console
            </p>
          </div>
        </div>

        {/* Sign out — always visible at the top */}
        <button
          onClick={handleLogout}
          title="Sign out"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.45)", cursor: "pointer", transition: "all 0.15s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(239,68,68,0.15)"
            e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"
            e.currentTarget.style.color = "#f87171"
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)"
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"
            e.currentTarget.style.color = "rgba(255,255,255,0.45)"
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "2px" }}>
        <p style={{
          color: "rgba(255,255,255,0.25)", fontSize: "10px", fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase",
          padding: "0 12px", marginBottom: "8px",
        }}>
          Menu
        </p>

        {NAV_LINKS.map(({ href, label, icon }) => {
          const active = pathname.startsWith(href)

          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "10px 12px",
                borderRadius: "10px",
                fontSize: "14px",
                fontWeight: active ? 600 : 400,
                color: active ? "white" : "rgba(255,255,255,0.45)",
                background: active
                  ? "linear-gradient(135deg, rgba(99,102,241,0.35), rgba(139,92,246,0.25))"
                  : "transparent",
                border: active ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
                textDecoration: "none",
                transition: "all 0.15s",
                boxShadow: active ? "0 2px 8px rgba(99,102,241,0.15)" : "none",
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = "rgba(255,255,255,0.06)"
                  e.currentTarget.style.color = "rgba(255,255,255,0.75)"
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.color = "rgba(255,255,255,0.45)"
                }
              }}
            >
              <span style={{ color: active ? "#818cf8" : "rgba(255,255,255,0.3)", flexShrink: 0 }}>
                {icon}
              </span>
              {label}
            </Link>
          )
        })}
      </nav>

    </aside>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <AdminGuard>
      <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC" }}>
        <AdminSidebar />
        <main style={{ flex: 1, overflow: "auto" }}>
          {children}
        </main>
      </div>
    </AdminGuard>
  )
}
