'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { IconMartini, IconBriefcase } from '@/components/icons'

// Portail d'entrée : le visiteur choisit son univers avant de voir le site.
// Le choix est mémorisé pour la session (sessionStorage) — pas de re-gate en navigation interne.
const KEY = 'infini-espace'

export default function EntranceChoice() {
  const [show, setShow] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    try {
      if (!sessionStorage.getItem(KEY)) setShow(true)
    } catch { /* stockage bloqué : on n'affiche pas le portail */ }
  }, [])

  // Bloque le scroll du site tant que le portail est affiché
  useEffect(() => {
    if (!show) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [show])

  const choose = (espace: 'events' | 'pro') => {
    try { sessionStorage.setItem(KEY, espace) } catch {}
    if (espace === 'pro') {
      router.push('/pro')
      setShow(false)
    } else {
      setLeaving(true)
      setTimeout(() => setShow(false), 450)
    }
  }

  if (!show) return null

  return (
    <div
      className={`fixed inset-0 z-[100] bg-noir flex flex-col items-center justify-center px-4 transition-opacity duration-[450ms] ${
        leaving ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Choisissez votre espace"
    >
      {/* Halo doré discret */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 45% at 50% 38%, rgba(212,168,83,0.10), transparent 70%)' }} />

      <div className="relative w-full max-w-3xl text-center">
        <Image
          src="/logos/infini-blanc.png"
          alt="L'Infini Guadeloupe"
          width={220}
          height={88}
          priority
          className="h-16 md:h-20 w-auto object-contain mx-auto mb-6"
        />
        <p className="text-white/50 text-sm md:text-base mb-10">
          Bienvenue. Choisissez votre espace pour continuer.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Espace Événement — l'univers nocturne */}
          <button
            onClick={() => choose('events')}
            className="group text-left rounded-3xl border border-white/10 bg-charbon p-8 md:p-10 transition-all duration-300 hover:border-braise/60 hover:shadow-[0_12px_50px_rgba(200,75,31,0.25)] cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-braise/15 border border-braise/30 flex items-center justify-center mb-5">
              <IconMartini className="w-6 h-6 text-braise" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-creme mb-2">
              Espace Événement
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Restaurant, bar lounge, soirées & billetterie. Réservez votre table ou votre événement privé.
            </p>
            <span className="inline-flex items-center gap-2 text-braise font-semibold text-sm group-hover:gap-3 transition-all">
              Entrer <span aria-hidden>→</span>
            </span>
          </button>

          {/* Espace Pro — l'univers jour / entreprise */}
          <button
            onClick={() => choose('pro')}
            className="group text-left rounded-3xl border border-or/20 bg-[#F7F4EC] p-8 md:p-10 transition-all duration-300 hover:border-or hover:shadow-[0_12px_50px_rgba(212,168,83,0.35)] cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-[#8A6B2B]/10 border border-[#8A6B2B]/30 flex items-center justify-center mb-5">
              <IconBriefcase className="w-6 h-6 text-[#8A6B2B]" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-[#14120E] mb-2">
              Espace Pro
            </h2>
            <p className="text-[#6B675E] text-sm leading-relaxed mb-6">
              Séminaires, soirées d&apos;entreprise, lancements & galas. Jusqu&apos;à 600 personnes, devis sous 24h.
            </p>
            <span className="inline-flex items-center gap-2 text-[#8A6B2B] font-semibold text-sm group-hover:gap-3 transition-all">
              Entrer <span aria-hidden>→</span>
            </span>
          </button>
        </div>

        <p className="text-white/25 text-xs mt-8">Le Gosier · Guadeloupe</p>
      </div>
    </div>
  )
}
