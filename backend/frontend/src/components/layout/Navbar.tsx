"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import CartIcon from "@/components/layout/CartIcon"

const categories = [
  { label: "Valves",      href: "/category/valves"     },
  { label: "Controls",    href: "/category/controls"   },
  { label: "Pneumatic",   href: "/category/pneumatic"  },
  { label: "Piping",      href: "/category/piping"     },
  { label: "Electrical",  href: "/category/electrical" },
]

export default function Navbar() {
  const [user, setUser] = useState<{ name?: string } | null>(null)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user")
      if (stored) setUser(JSON.parse(stored))
    } catch {}
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleLogout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    window.location.href = "/"
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-white">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-3 items-center px-6">

        {/* Left — Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-[17px] font-bold tracking-tight text-foreground">
            ARefriZ
          </span>
        </Link>

        {/* Center — Categories */}
        <nav className="hidden items-center justify-center gap-7 md:flex">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {cat.label}
            </Link>
          ))}
        </nav>

        {/* Right — Actions */}
        <div className="flex items-center justify-end gap-1">
          {/* Cart */}
          <CartIcon />

          {/* Auth */}
          {user ? (
            <div ref={ref} className="relative ml-1">
              <button
                onClick={() => setOpen(v => !v)}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-gray-100"
              >
                {user.name?.split(" ")[0]}
                <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
              </button>

              {open && (
                <div className="absolute right-0 top-full mt-1.5 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                  <Link
                    href="/account"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    My Account
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Orders
                  </Link>
                  <div className="my-1 h-px bg-gray-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-500 transition-colors hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm" className="ml-1 rounded-lg px-4 text-sm font-medium">
                Login
              </Button>
            </Link>
          )}
        </div>

      </div>
    </header>
  )
}
