import { BadgeCheck, ClipboardCheck, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const trustPoints = [
  {
    icon: BadgeCheck,
    title: "Factory Warranty Included",
    desc: "Every part ships with original manufacturer warranty documentation — no exceptions.",
  },
  {
    icon: ClipboardCheck,
    title: "Compliance Tracking",
    desc: "Full traceability from source to delivery, meeting ISO and industrial regulatory standards.",
  },
  {
    icon: ShieldCheck,
    title: "Certified Industrial Components",
    desc: "All components are verified against OEM specifications before listing on the platform.",
  },
];

export default function TrustSection() {
  return (
    <section className="bg-gray-50 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* ── Left: Industrial B&W image ── */}
          <div className="relative min-h-[480px] overflow-hidden rounded-2xl bg-gray-950 shadow-xl lg:h-full">

            {/* Depth base gradient */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse at 35% 40%, #2a2a2a 0%, transparent 55%),
                  radial-gradient(ellipse at 75% 70%, #1a1a1a 0%, transparent 50%),
                  radial-gradient(ellipse at 50% 10%, #333 0%, transparent 40%),
                  linear-gradient(160deg, #080808 0%, #151515 45%, #222 75%, #080808 100%)
                `,
              }}
            />

            {/* Outer gear ring */}
            <div className="absolute left-1/2 top-[42%] h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[26px] border-white/[0.05]" />
            {/* Mid gear ring */}
            <div className="absolute left-1/2 top-[42%] h-[210px] w-[210px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[16px] border-white/[0.07]" />
            {/* Inner hub */}
            <div className="absolute left-1/2 top-[42%] h-[110px] w-[110px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[10px] border-white/[0.06]" />
            {/* Center dot */}
            <div className="absolute left-1/2 top-[42%] h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.08]" />

            {/* Bolt dots on outer ring — 8 positions */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const r = 160; // px from center
              const cx = 50 + (r / 4.8) * Math.cos(rad); // % offset
              const cy = 42 + (r / 4.8) * Math.sin(rad);
              return (
                <div
                  key={deg}
                  className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/[0.09]"
                  style={{ left: `${cx}%`, top: `${cy}%` }}
                />
              );
            })}

            {/* Horizontal pipe — upper */}
            <div className="absolute left-0 right-0 top-[64%] h-[5px] bg-white/[0.05]" />
            <div className="absolute left-0 right-0 top-[64%] mt-[5px] h-[1px] bg-white/[0.03]" />
            {/* Horizontal pipe — lower */}
            <div className="absolute bottom-[18%] left-0 right-0 h-[3px] bg-white/[0.04]" />

            {/* Vertical ribs */}
            <div className="absolute bottom-0 left-[18%] top-0 w-[3px] bg-white/[0.03]" />
            <div className="absolute bottom-0 right-[18%] top-0 w-[3px] bg-white/[0.03]" />

            {/* Noise/grain texture */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.09] mix-blend-overlay"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                backgroundSize: "160px 160px",
              }}
            />

            {/* Top vignette */}
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-gray-950/70 to-transparent" />
            {/* Bottom vignette */}
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-gray-950/80 to-transparent" />

            {/* Bottom label */}
            <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between">
              <div>
                <p className="text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-white/25">
                  Quality standard
                </p>
                <p className="mt-0.5 text-sm font-semibold text-white/40">
                  ISO 9001 · CE Marked
                </p>
              </div>
              <div className="h-8 w-8 rounded-full border border-white/10 bg-white/5" />
            </div>
          </div>

          {/* ── Right: Content ── */}
          <div className="flex flex-col justify-center">

            {/* Eyebrow */}
            <p className="mb-5 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-gray-400">
              Why ARefriz
            </p>

            {/* Heading */}
            <h2
              className="text-[2.1rem] font-extrabold leading-[1.1] tracking-[-0.025em] text-gray-900 sm:text-[2.75rem]"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Genuine Parts Only.
              <br />
              Zero Compromise.
            </h2>

            {/* Description */}
            <p className="mt-5 text-[0.95rem] leading-[1.85] text-gray-500">
              ARefriz was built for industrial buyers who cannot afford downtime.
              Every part on our platform goes through a rigorous verification
              process — ensuring what you order is exactly what you receive,
              on time and to specification.
            </p>

            {/* Trust points */}
            <ul className="mt-9 space-y-6">
              {trustPoints.map(({ icon: Icon, title, desc }) => (
                <li key={title} className="flex items-start gap-4">
                  {/* Icon box */}
                  <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm">
                    <Icon className="h-4 w-4 text-gray-700" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="text-[0.9rem] font-semibold text-gray-900">{title}</p>
                    <p className="mt-0.5 text-[0.82rem] leading-[1.65] text-gray-500">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div className="mt-10">
              <Button
                variant="outline"
                className="group h-11 rounded-xl border-gray-300 px-6 text-sm font-semibold text-gray-800 hover:border-gray-900 hover:bg-gray-900 hover:text-white"
              >
                Learn About Our Standards
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
