import Link from "next/link";
import { X } from "lucide-react";

const cols = [
  {
    heading: "Parts Finder",
    links: [
      { label: "About Us",             href: "#" },
      { label: "Frequently Asked Questions", href: "#" },
      { label: "Privacy Policy",       href: "#" },
      { label: "Terms & Conditions",   href: "#" },
    ],
  },
  {
    heading: "My Account",
    links: [
      { label: "Order History",   href: "#" },
      { label: "My Account",      href: "#" },
      { label: "Saved Products",  href: "#" },
    ],
  },
  {
    heading: "Customer Service",
    links: [
      { label: "Contact Us",                href: "#" },
      { label: "Site Map",                  href: "#" },
      { label: "Returns and Cancellations", href: "#" },
    ],
  },
];

const socials = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: "Twitter",
    href: "#",
    icon: <X className="h-4 w-4" aria-hidden />,
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-16">

        {/* ── Columns ── */}
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-5">

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.heading}>
              <p className="mb-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gray-400">
                {col.heading}
              </p>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[0.82rem] text-gray-500 transition-colors hover:text-gray-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact Info */}
          <div>
            <p className="mb-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gray-400">
              Contact Info
            </p>
            <ul className="space-y-2.5 text-[0.82rem] text-gray-500">
              <li>
                <a href="tel:8447860365" className="transition-colors hover:text-gray-900">
                  844 786 0365
                </a>
              </li>
              <li>
                <a href="mailto:support@arefriz.com" className="transition-colors hover:text-gray-900">
                  support@arefriz.com
                </a>
              </li>
              <li className="pt-1 leading-[1.75]">
                <span className="block">Monday–Saturday: 10AM</span>
                <span className="block">Sunday: Closed</span>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <p className="mb-4 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-gray-400">
              Follow Us
            </p>
            <div className="flex flex-col gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex items-center gap-2.5 text-[0.82rem] text-gray-500 transition-colors hover:text-gray-900"
                >
                  {s.icon}
                  {s.label}
                </a>
              ))}
            </div>
          </div>

        </div>

        {/* ── Divider + copyright ── */}
        <div className="mt-14 border-t border-gray-200 pt-7">
          <p className="text-center text-[0.75rem] text-gray-400">
            © 2024 ARefriz Industrial Engineering. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
