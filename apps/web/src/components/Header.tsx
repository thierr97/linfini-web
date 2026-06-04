'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

const NAV = [
  { href: '/menu', label: 'Menu' },
  { href: '/evenements', label: 'Événements' },
  { href: '/bar', label: 'Bar' },
  { href: '/galerie', label: 'Galerie' },
  { href: '/#reservation', label: 'Réserver' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass border-b border-white/10' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logos/infini-guadeloupe.jpg"
              alt="L'Infini Guadeloupe"
              width={120}
              height={48}
              className="h-10 w-auto object-contain"
              style={{ mixBlendMode: 'screen' }}
              priority
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV.slice(0, -1).map(n => (
              <Link key={n.href} href={n.href} className="text-sm text-white/60 hover:text-white transition-colors tracking-wide">
                {n.label}
              </Link>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/#reservation" className="bg-braise hover:bg-ambre text-white px-5 py-2 rounded-full text-sm font-semibold transition-colors">
              Réserver
            </Link>
          </div>

          {/* Mobile burger */}
          <button onClick={() => setOpen(!open)} className="md:hidden flex flex-col gap-1.5 p-2">
            <span className={`block w-6 h-0.5 bg-white/80 transition-all ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white/80 transition-all ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-6 h-0.5 bg-white/80 transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {open && (
        <div className="fixed inset-0 z-40 bg-noir/95 backdrop-blur flex flex-col items-center justify-center gap-8" onClick={() => setOpen(false)}>
          {NAV.map(n => (
            <Link key={n.href} href={n.href} className="font-display text-3xl font-bold text-white/80 hover:text-or transition-colors" onClick={() => setOpen(false)}>
              {n.label}
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
