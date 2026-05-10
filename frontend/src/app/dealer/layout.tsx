"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import DealerProtectedRoute from "@/components/auth/DealerProtectedRoute"

const NAV_LINKS = [
  {
    href: "/dealer/dashboard",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/dealer/orders",
    label: "Orders",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    href: "/dealer/products",
    label: "Products",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    href: "/dealer/inquiries",
    label: "Inquiries",
    icon: (
      <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    ),
  },
]

const PAGE_TITLES: Record<string, string> = {
  "/dealer/dashboard": "Dashboard",
  "/dealer/orders":    "Orders",
  "/dealer/products":  "Products",
  "/dealer/inquiries": "Inquiries",
}

function DealerSidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  function handleLogout() {
    sessionStorage.removeItem("dealerToken")
    sessionStorage.removeItem("dealer")
    router.replace("/dealer/login")
  }

  return (
    <aside style={{
      width: "240px", minHeight: "100vh", flexShrink: 0,
      background: "linear-gradient(180deg, #022c22 0%, #064e3b 100%)",
      borderRight: "1px solid rgba(255,255,255,0.07)",
      display: "flex", flexDirection: "column",
      position: "sticky", top: 0, height: "100vh",
    }}>

      {/* Brand */}
      <div style={{
        padding: "20px 16px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "9px", flexShrink: 0,
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(16,185,129,0.4)",
          }}>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <p style={{ color: "white", fontWeight: 700, fontSize: "14px", lineHeight: 1, margin: 0 }}>ARefriz</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "11px", marginTop: "3px" }}>Dealer Portal</p>
          </div>
        </div>

        <button
          onClick={handleLogout} title="Sign out"
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

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "2px" }}>
        <p style={{
          color: "rgba(255,255,255,0.25)", fontSize: "10px", fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase",
          padding: "0 12px", marginBottom: "8px",
        }}>
          Menu
        </p>

        {NAV_LINKS.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/")
          return (
            <Link
              key={href} href={href}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 12px", borderRadius: "10px",
                fontSize: "14px", fontWeight: active ? 600 : 400,
                color: active ? "white" : "rgba(255,255,255,0.45)",
                background: active
                  ? "linear-gradient(135deg, rgba(16,185,129,0.3), rgba(5,150,105,0.2))"
                  : "transparent",
                border: active ? "1px solid rgba(16,185,129,0.3)" : "1px solid transparent",
                textDecoration: "none", transition: "all 0.15s",
                boxShadow: active ? "0 2px 8px rgba(16,185,129,0.15)" : "none",
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
              <span style={{ color: active ? "#34d399" : "rgba(255,255,255,0.3)", flexShrink: 0 }}>
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

function DealerHeader() {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] ?? "Dealer Portal"

  const dealer = (() => {
    try { return JSON.parse(sessionStorage.getItem("dealer") ?? "{}") } catch { return {} }
  })()
  const name: string = dealer?.name ?? ""
  const initial = name ? name[0].toUpperCase() : "D"

  return (
    <header style={{
      height: "60px", flexShrink: 0,
      background: "white",
      borderBottom: "1px solid #E5E7EB",
      display: "flex", alignItems: "center",
      padding: "0 28px",
      justifyContent: "space-between",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      <h1 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", margin: 0, letterSpacing: "-0.02em" }}>
        {title}
      </h1>

      {name && (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "13px", color: "#6B7280" }}>{name}</span>
          <div style={{
            width: "32px", height: "32px", borderRadius: "50%",
            background: "linear-gradient(135deg, #10b981, #059669)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontSize: "13px", fontWeight: 700,
            flexShrink: 0,
          }}>
            {initial}
          </div>
        </div>
      )}
    </header>
  )
}

export default function DealerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === "/dealer/login") {
    return <>{children}</>
  }

  return (
    <DealerProtectedRoute>
      <div style={{ display: "flex", height: "100vh", background: "#F0FDF4", overflow: "hidden" }}>
        <DealerSidebar />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <DealerHeader />
          <main style={{ flex: 1, overflow: "auto" }}>
            {children}
          </main>
        </div>
      </div>
    </DealerProtectedRoute>
  )
}
