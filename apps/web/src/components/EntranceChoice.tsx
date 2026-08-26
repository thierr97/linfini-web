'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { IconMartini, IconBriefcase } from '@/components/icons'

// Portail d'entrée : le visiteur choisit son univers avant de voir le site.
// Le choix est mémorisé pour la session (sessionStorage) — pas de re-gate en navigation interne.
// Accueil animé : le ∞ (8 couché) se dessine, puis « Bienvenue à L'Infini » et les deux cartes.
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
      className={`fixed inset-0 z-[100] bg-noir/80 backdrop-blur-xl flex flex-col items-center justify-center px-4 transition-opacity duration-[450ms] ${
        leaving ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Choisissez votre espace"
    >
      <style>{`
        @keyframes infini-draw {
          from { stroke-dashoffset: 1; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes infini-glow {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(212,168,83,0.35)); }
          50% { filter: drop-shadow(0 0 18px rgba(212,168,83,0.75)); }
        }
        @keyframes infini-rise {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .infini-path {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: infini-draw 2.2s cubic-bezier(0.65, 0, 0.35, 1) 0.2s forwards;
        }
        .infini-symbol { animation: infini-glow 3s ease-in-out 2.4s infinite; }
        .infini-rise { opacity: 0; animation: infini-rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        @media (prefers-reduced-motion: reduce) {
          .infini-path { animation: none; stroke-dashoffset: 0; }
          .infini-symbol { animation: none; }
          .infini-rise { animation: none; opacity: 1; }
        }
      `}</style>

      {/* Halo doré discret */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 45% at 50% 38%, rgba(212,168,83,0.12), transparent 70%)' }} />

      <div className="relative w-full max-w-3xl text-center">
        {/* ∞ — le 8 couché se dessine puis respire */}
        <svg
          viewBox="0 0 200 100"
          className="infini-symbol w-40 md:w-52 h-auto mx-auto mb-4"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="infini-or" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8A6B2B" />
              <stop offset="50%" stopColor="#D4A853" />
              <stop offset="100%" stopColor="#F5EDD8" />
            </linearGradient>
          </defs>
          <path
            className="infini-path"
            pathLength={1}
            d="M100 50 C 88 22, 38 22, 38 50 C 38 78, 88 78, 100 50 C 112 22, 162 22, 162 50 C 162 78, 112 78, 100 50 Z"
            stroke="url(#infini-or)"
            strokeWidth="7"
            strokeLinecap="round"
          />
        </svg>

        <h1 className="infini-rise font-display text-3xl md:text-5xl font-bold text-creme mb-3" style={{ animationDelay: '1.5s' }}>
          Bienvenue à <span className="text-or">L&apos;Infini</span>
        </h1>
        <p className="infini-rise text-white/50 text-sm md:text-base mb-10" style={{ animationDelay: '1.8s' }}>
          Choisissez votre espace pour continuer.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Espace Événement — l'univers nocturne */}
          <button
            onClick={() => choose('events')}
            className="infini-rise group text-left rounded-3xl border border-white/10 bg-charbon/80 p-8 md:p-10 transition-all duration-300 hover:border-braise/60 hover:shadow-[0_12px_50px_rgba(200,75,31,0.25)] cursor-pointer"
            style={{ animationDelay: '2.1s' }}
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
            className="infini-rise group text-left rounded-3xl border border-or/20 bg-[#F7F4EC]/95 p-8 md:p-10 transition-all duration-300 hover:border-or hover:shadow-[0_12px_50px_rgba(212,168,83,0.35)] cursor-pointer"
            style={{ animationDelay: '2.25s' }}
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

        <p className="infini-rise text-white/25 text-xs mt-8" style={{ animationDelay: '2.5s' }}>Le Gosier · Guadeloupe</p>
      </div>
    </div>
  )
}
