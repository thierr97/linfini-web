'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard', label: 'Tableau de bord', icon: '📊' },
  { href: '/dashboard/orders', label: 'Commandes', icon: '🍽️' },
  { href: '/dashboard/menu', label: 'Menu', icon: '📋' },
  { href: '/dashboard/reservations', label: 'Réservations', icon: '📅' },
  { href: '/dashboard/events', label: 'Événements', icon: '🎉' },
  { href: '/dashboard/tables', label: 'Tables & QR', icon: '🪑' },
  { href: '/dashboard/settings', label: 'Paramètres', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <aside className="w-56 bg-noir h-full flex flex-col border-r border-white/10">
      <div className="p-4 border-b border-white/10">
        <h1 className="text-xl font-bold text-or">L'Infini</h1>
        <p className="text-xs text-white/30 mt-0.5">Administration</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              pathname === item.href
                ? 'bg-braise text-white'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/30 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span>🚪</span>
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  )
}
