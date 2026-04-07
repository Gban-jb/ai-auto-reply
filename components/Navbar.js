'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/', label: 'Home', code: '00' },
  { href: '/admin', label: 'Clients', code: '09' },
  { href: '/demo', label: 'Demo', code: 'AI' },
  { href: '/dashboard', label: 'Dashboard', code: 'DB' },
]

function isItemActive(pathname, href) {
  if (href === '/') {
    return pathname === '/'
  }

  if (href === '/admin') {
    return pathname === '/admin' || pathname.startsWith('/client/')
  }

  return pathname.startsWith(href)
}

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 px-4 pt-4">
      <div className="mx-auto max-w-7xl">
        <div
          className="rounded-[30px] border border-white/10 shadow-[0_24px_90px_rgba(2,12,27,0.38)]"
          style={{
            background:
              'linear-gradient(180deg, rgba(6, 19, 33, 0.96) 0%, rgba(7, 24, 41, 0.98) 100%)',
            boxShadow:
              '0 24px 90px rgba(2, 12, 27, 0.38), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <div className="flex flex-col gap-3 px-4 py-4 md:px-6">
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="group flex min-w-0 items-center gap-3">
                <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-300 via-teal-300 to-emerald-300 text-sm font-black text-slate-950 shadow-[0_14px_30px_rgba(45,212,191,0.28)]">
                  AI
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.45),transparent_52%)] opacity-90" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-black tracking-tight text-white">
                    Auto-Reply
                  </p>
                  <p className="truncate text-[11px] font-mono uppercase tracking-[0.24em] text-white/45">
                    Missed-call recovery
                  </p>
                </div>
              </Link>

              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/20 bg-gradient-to-r from-cyan-400/20 to-emerald-400/15 px-4 py-2.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(34,211,238,0.14)] md:hidden"
              >
                Live Demo
                <span className="text-xs">↗</span>
              </Link>

              <div className="hidden items-center gap-3 md:flex">
                <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/80 px-3 py-2 text-[11px] font-mono uppercase tracking-[0.24em] text-white/70">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.65)]" />
                  24/7 replies
                </div>
                <Link
                  href="/demo"
                  className="group inline-flex items-center gap-3 rounded-2xl border border-cyan-300/20 bg-gradient-to-r from-cyan-400/22 to-emerald-400/18 px-5 py-3 text-sm font-bold text-white shadow-[0_16px_34px_rgba(34,211,238,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(34,211,238,0.22)]"
                >
                  Try Live Demo
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/12 text-xs transition-transform duration-300 group-hover:translate-x-0.5">
                    →
                  </span>
                </Link>
              </div>
            </div>

            <div className="overflow-x-auto pb-1 scrollbar-hide">
              <div className="flex min-w-max items-center gap-1 rounded-[22px] border border-white/8 bg-slate-950/80 p-1.5">
                {NAV_ITEMS.map((item) => {
                  const active = isItemActive(pathname, item.href)

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group relative flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                        active
                          ? 'border border-cyan-300/20 bg-gradient-to-r from-cyan-400/18 to-emerald-400/14 text-white shadow-[0_12px_28px_rgba(34,211,238,0.12)]'
                          : 'border border-transparent text-white/70 hover:border-white/8 hover:bg-white/[0.05] hover:text-white'
                      }`}
                    >
                      <span
                        className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-[10px] font-mono uppercase tracking-[0.2em] ${
                          active
                            ? 'bg-white/12 text-cyan-100'
                            : 'bg-white/[0.05] text-white/60 group-hover:text-white/80'
                        }`}
                      >
                        {item.code}
                      </span>
                      <span>{item.label}</span>
                      {active && (
                        <span className="absolute inset-x-5 bottom-1 h-px rounded-full bg-gradient-to-r from-transparent via-cyan-200 to-transparent" />
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
