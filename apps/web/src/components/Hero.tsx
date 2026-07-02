'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SLIDES = [
  { src: '/images/terrasse.jpg', label: 'Notre terrasse' },
  { src: '/images/salle-event.jpg', label: 'Salle événementielle' },
  { src: '/images/cocktail.jpg', label: 'Bar & Cocktails' },
]

export default function Hero() {
  const [current, setCurrent] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const t = setInterval(() => setCurrent(i => (i + 1) % SLIDES.length), 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Slideshow background */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0"
          style={{ opacity: i === current ? 1 : 0, transition: 'opacity 1.5s ease' }}
        >
          <Image
            src={slide.src}
            alt={slide.label}
            fill
            sizes="100vw"
            priority={i === 0}
            className={`object-cover ${i === current ? 'animate-kenburns' : 'scale-105'}`}
          />
          <div className="absolute inset-0 bg-noir/70" />
        </div>
      ))}

      {/* Ambient glows */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-braise/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-or/8 blur-3xl pointer-events-none" />

      {/* Gradient overlay bas */}
      <div className="absolute inset-0 bg-gradient-to-t from-noir via-transparent to-transparent" />

      {/* Contenu */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        {mounted && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-braise/20 border border-braise/30 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 bg-braise rounded-full animate-pulse" />
              <span className="text-sm text-creme/80 tracking-wide">Le Gosier, Guadeloupe</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="mb-6 flex justify-center"
            >
              <Image
                src="/logos/infini-blanc.png"
                alt="L'Infini Guadeloupe"
                width={400}
                height={160}
                className="w-64 md:w-96 h-auto object-contain drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]"
                priority
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl text-white/70 mb-4 max-w-xl mx-auto leading-relaxed tracking-wider"
            >
              Restaurant • Bar Lounge • Événements
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-white/40 mb-10 max-w-lg mx-auto"
            >
              Une expérience gastronomique unique au cœur de la Guadeloupe.
              Saveurs caribéennes, ambiance feutrée.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <a
                href="#reservation"
                className="bg-braise hover:bg-ambre text-white px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 shadow-lg shadow-braise/30 hover:shadow-ambre/30 hover:scale-[1.03]"
              >
                Réserver une table
              </a>
              <Link
                href="/menu"
                className="border border-white/30 hover:border-white/60 bg-white/5 backdrop-blur-sm text-white/80 hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all hover:bg-white/10"
              >
                Voir le menu →
              </Link>
            </motion.div>

            {/* Dots */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex items-center justify-center gap-2 mt-10"
            >
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Voir : ${SLIDES[i].label}`}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${i === current ? 'w-6 h-2 bg-braise' : 'w-2 h-2 bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </motion.div>
          </>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-bounce-slow">
        <span className="text-xs tracking-widest uppercase">Découvrir</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/30 to-transparent" />
      </div>
    </section>
  )
}
