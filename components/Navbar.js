'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/admin', label: 'Clients', icon: '👑' },
  { href: '/demo', label: 'Demo', icon: '🤖' },
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 glass-strong animate-fade-in-down">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal to-mint flex items-center justify-center text-navy font-black text-sm shadow-lg shadow-teal/20 group-hover:shadow-teal/40 transition-shadow">
            AI
          </div>
          <span className="font-bold text-white text-lg hidden sm:block">
            Auto-Reply
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'text-teal bg-teal/10'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span className="hidden md:inline">{item.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-teal rounded-full" />
                )}
              </Link>
            )
          })}
        </div>

        {/* CTA */}
        <Link
          href="/demo"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-teal to-mint text-navy hover:shadow-lg hover:shadow-teal/20 transition-all duration-300 hover:-translate-y-0.5"
        >
          Try Live Demo
          <span className="text-xs">→</span>
        </Link>
      </div>
    </nav>
  )
}
