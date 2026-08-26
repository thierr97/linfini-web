'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'

// Barre de navigation propre à l'Espace Pro : fond encre opaque (lisible sur le hero jour),
// ancres internes à la page pro uniquement — aucun lien vers l'univers événement/restaurant
// hormis la porte de sortie « Espace Événement ».
const ENCRE = '#14120E'

const NAV = [
  { href: '#capacites', label: 'Capacités' },
  { href: '#formats', label: 'Formats' },
  { href: '#lieu', label: 'Le lieu' },
  { href: '#prestations', label: 'Prestations' },
]

export default function ProHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-3 pt-3 md:px-4 md:pt-4 pointer-events-none">
        <div
          className={`pointer-events-auto max-w-5xl mx-auto flex items-center justify-between rounded-full pl-5 pr-2 py-2 border transition-all duration-400 ${
            scrolled ? 'shadow-2xl shadow-black/30' : ''
          }`}
          style={{ backgroundColor: 'rgba(20,18,14,0.94)', borderColor: 'rgba(212,168,83,0.25)', backdropFilter: 'blur(12px)' }}
        >
          {/* Logo + badge PRO */}
          <Link href="/pro" className="flex items-center gap-2.5 shrink-0" aria-label="Espace Pro L'Infini Guadeloupe">
            <Image
              src="/logos/infini-blanc.png"
              alt="L'Infini Guadeloupe"
              width={120}
              height={48}
              className="h-9 w-auto object-contain"
              priority
            />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-or border border-or/50 rounded-full px-2.5 py-1">
              Pro
            </span>
          </Link>

          {/* Nav ancres pro */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(n => (
              <a
                key={n.href}
                href={n.href}
                className="px-4 py-2 rounded-full text-sm tracking-wide text-white/70 hover:text-white hover:bg-white/10 transition-colors duration-200"
              >
                {n.label}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/"
              className="px-4 py-2 rounded-full text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors duration-200"
            >
              Espace Événement
            </Link>
            <a
              href="#devis-pro"
              className="bg-or hover:bg-ambre px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-lg shadow-or/25"
              style={{ color: ENCRE }}
            >
              Demander un devis
            </a>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={open}
            className="md:hidden flex flex-col justify-center gap-1.5 w-11 h-11 items-center rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <span className={`block w-5 h-0.5 bg-white/90 transition-all duration-300 ${open ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white/90 transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-white/90 transition-all duration-300 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </header>

      {/* Menu mobile pro */}
      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 md:hidden transition-all duration-400 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: 'rgba(20,18,14,0.97)', backdropFilter: 'blur(12px)' }}
        onClick={() => setOpen(false)}
      >
        {NAV.map((n, i) => (
          <a
            key={n.href}
            href={n.href}
            className={`font-display text-3xl font-bold text-white/85 hover:text-or transition-all duration-400 ${
              open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: open ? `${i * 60}ms` : '0ms' }}
            onClick={() => setOpen(false)}
          >
            {n.label}
          </a>
        ))}
        <a
          href="#devis-pro"
          className={`bg-or px-8 py-3.5 rounded-full text-base font-bold transition-all duration-400 mt-2 ${
            open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
          style={{ color: ENCRE, transitionDelay: open ? `${NAV.length * 60}ms` : '0ms' }}
          onClick={() => setOpen(false)}
        >
          Demander un devis
        </a>
        <Link
          href="/"
          className={`text-sm text-white/50 hover:text-white transition-all duration-400 mt-4 ${
            open ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}
          style={{ transitionDelay: open ? `${(NAV.length + 1) * 60}ms` : '0ms' }}
          onClick={() => setOpen(false)}
        >
          ← Espace Événement
        </Link>
      </div>
    </>
  )
}
