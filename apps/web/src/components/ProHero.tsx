'use client'
import Image from 'next/image'
import { useEffect, useRef } from 'react'

const IVOIRE = '#FBFAF7'

// Hero « L'Infini, côté pro » — envolée 3D à l'arrivée puis tilt parallaxe sous la souris.
// La photo ET ses dégradés vivent dans le même bloc transformé : ordre de peinture garanti,
// et le fondu suit l'inclinaison (le scale 1.07 couvre les bords pendant le tilt).
export default function ProHero() {
  const stageRef = useRef<HTMLElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const stage = stageRef.current, hero = heroRef.current, text = textRef.current
    if (!stage || !hero || !text) return

    let tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, live = false
    const tick = () => {
      cx += (tx - cx) * 0.06
      cy += (ty - cy) * 0.06
      hero.style.transform = `rotateY(${(cx * 5).toFixed(3)}deg) rotateX(${(-cy * 4).toFixed(3)}deg) scale(1.07)`
      text.style.transform = `translate3d(${(-cx * 14).toFixed(2)}px, ${(-cy * 9).toFixed(2)}px, 0)`
      raf = requestAnimationFrame(tick)
    }
    // Le tilt prend le relais une fois l'envolée d'entrée terminée
    const start = () => {
      if (live) return
      live = true
      hero.classList.remove('pro-stage-anim')
      raf = requestAnimationFrame(tick)
    }
    hero.addEventListener('animationend', start, { once: true })
    const fallback = setTimeout(start, 1800)

    const onMove = (e: MouseEvent) => {
      const r = stage.getBoundingClientRect()
      tx = (e.clientX - r.left) / r.width - 0.5
      ty = (e.clientY - r.top) / r.height - 0.5
    }
    const onLeave = () => { tx = 0; ty = 0 }
    stage.addEventListener('mousemove', onMove)
    stage.addEventListener('mouseleave', onLeave)
    return () => {
      clearTimeout(fallback)
      cancelAnimationFrame(raf)
      hero.removeEventListener('animationend', start)
      stage.removeEventListener('mousemove', onMove)
      stage.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <section ref={stageRef} className="relative overflow-hidden" style={{ perspective: '1400px' }}>
      <div className="relative h-[62vh] min-h-[420px]">
        <div ref={heroRef} className="pro-stage-anim absolute inset-0 will-change-transform">
          <Image
            src="/images/terrasse.jpg"
            alt="La terrasse de L'Infini au Gosier en plein jour"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Voile sombre en haut pour le header, fondu ivoire en bas vers le corps de page */}
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/55 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-44" style={{ background: `linear-gradient(to top, ${IVOIRE}, transparent)` }} />
        </div>
      </div>

      <div ref={textRef} className="relative max-w-5xl mx-auto px-4 -mt-28 pb-4 text-center will-change-transform">
        <p className="pro-rise text-xs font-semibold uppercase tracking-[0.25em] mb-4 text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]"
          style={{ animationDelay: '0.45s' }}>
          Espace Pro · Le Gosier, Guadeloupe
        </p>
        <h1 className="pro-rise font-display text-5xl md:text-7xl font-bold mb-5" style={{ color: '#14120E', animationDelay: '0.6s' }}>
          L&apos;Infini, <span className="pro-shine">côté pro</span>
        </h1>
        <p className="pro-rise text-lg max-w-xl mx-auto mb-8" style={{ color: '#5A5548', animationDelay: '0.75s' }}>
          Séminaires, soirées d&apos;entreprise, lancements, galas — de jour comme de nuit,
          privatisez le lieu et confiez l&apos;organisation à une équipe dédiée.
        </p>
        <div className="pro-rise flex flex-col sm:flex-row gap-4 justify-center" style={{ animationDelay: '0.9s' }}>
          <a href="#devis-pro"
            className="inline-block bg-braise hover:bg-ambre text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 shadow-lg shadow-braise/20 hover:shadow-ambre/30">
            Demander un devis →
          </a>
          <a href="tel:+590690272875"
            className="inline-block border px-10 py-4 rounded-full font-bold text-lg transition-colors duration-300 hover:border-or"
            style={{ borderColor: '#E9E4D8', color: '#14120E' }}>
            +590 690 27 28 75
          </a>
        </div>
      </div>
    </section>
  )
}
