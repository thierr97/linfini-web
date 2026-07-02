'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/menu', label: 'Menu' },
  { href: '/evenements', label: 'Événements' },
  { href: '/bar', label: 'Bar' },
  { href: '/tarifs', label: 'Tarifs' },
  { href: '/galerie', label: 'Galerie' },
  { href: '/#reservation', label: 'Réserver' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-3 pt-3 md:px-4 md:pt-4 pointer-events-none">
        <div
          className={`pointer-events-auto max-w-5xl mx-auto flex items-center justify-between rounded-full pl-5 pr-2 py-2 transition-all duration-400 ${
            scrolled
              ? 'glass border border-white/10 shadow-2xl shadow-black/40'
              : 'bg-white/[0.03] border border-white/[0.06] backdrop-blur-md'
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0" aria-label="Accueil L'Infini Guadeloupe">
            <Image
              src="/logos/infini-blanc.png"
              alt="L'Infini Guadeloupe"
              width={120}
              height={48}
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.slice(0, -1).map(n => {
              const active = pathname === n.href
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`px-4 py-2 rounded-full text-sm tracking-wide transition-colors duration-200 ${
                    active
                      ? 'text-creme bg-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {n.label}
                </Link>
              )
            })}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/connexion" className="px-3 py-2 rounded-full text-sm text-white/50 hover:text-white hover:bg-white/5 transition-colors duration-200">
              Mon compte
            </Link>
            <Link
              href="/#reservation"
              className="bg-braise hover:bg-ambre text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-lg shadow-braise/25 hover:shadow-ambre/30"
            >
              Réserver
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
            className="md:hidden flex flex-col justify-center gap-1.5 w-11 h-11 items-center rounded-full hover:bg-white/5 transition-colors cursor-pointer"
          >
            <span className={`block w-5 h-0.5 bg-white/80 transition-all duration-300 ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white/80 transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white/80 transition-all duration-300 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 z-40 glass flex flex-col items-center justify-center gap-7 md:hidden transition-all duration-400 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setOpen(false)}
      >
        {NAV.map((n, i) => (
          <Link
            key={n.href}
            href={n.href}
            className={`font-display text-3xl font-bold text-white/80 hover:text-or transition-all duration-400 ${
              open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: open ? `${i * 60}ms` : '0ms' }}
            onClick={() => setOpen(false)}
          >
            {n.label}
          </Link>
        ))}
        <Link
          href="/connexion"
          className={`text-sm text-white/40 hover:text-white transition-all duration-400 mt-4 ${
            open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
          style={{ transitionDelay: open ? `${NAV.length * 60}ms` : '0ms' }}
          onClick={() => setOpen(false)}
        >
          Mon compte
        </Link>
      </div>
    </>
  )
}
