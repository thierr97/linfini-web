'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { href: '/', label: 'Tables', icon: '🍽️' },
  { href: '/bar', label: 'Bar', icon: '🍹' },
  { href: '/entrees', label: 'Entrées', icon: '🎟️' },
  { href: '/caisse', label: 'Caisse', icon: '💰' },
  { href: '/stock', label: 'Stock', icon: '📦' },
  { href: '/prestataires', label: 'Presta', icon: '👷' },
]

export function NavBar() {
  const path = usePathname()

  return (
    <nav className="flex items-center bg-gray-900 border-b border-gray-800 px-2 h-14 gap-1 shrink-0">
      <span className="text-amber-400 font-bold text-lg mr-3 shrink-0">L'Infini</span>
      {tabs.map((t) => {
        const active = path === t.href || (t.href !== '/' && path.startsWith(t.href))
        return (
          <Link
            key={t.href}
            href={t.href}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              active ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            <span>{t.icon}</span>
            <span className="hidden sm:inline">{t.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
