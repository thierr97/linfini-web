'use client'
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Lenis from 'lenis'

// Défilement inertiel global (desktop). Le tactile reste natif ; désactivé si
// l'utilisateur préfère réduire les animations.
export default function SmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      smoothWheel: true,
    })
    lenisRef.current = lenis

    let raf = 0
    const tick = (time: number) => {
      lenis.raf(time)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    // Ancres internes : défilement piloté par Lenis (offset pour le header fixe)
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.('a[href*="#"]') as HTMLAnchorElement | null
      if (!a) return
      const url = new URL(a.href, window.location.href)
      if (url.pathname !== window.location.pathname || !url.hash) return
      const target = document.querySelector(url.hash)
      if (!target) return
      e.preventDefault()
      history.pushState(null, '', url.hash)
      lenis.scrollTo(target as HTMLElement, { offset: -96, duration: 1.4 })
    }
    document.addEventListener('click', onClick)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('click', onClick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  // Re-cadrage des ancres au chargement et après navigation interne : le scroll
  // natif part avant que le layout soit stabilisé (images, hydratation, init Lenis)
  // et atterrit parfois à côté de la cible. On re-scrolle nous-mêmes une fois le
  // layout posé — sauf si l'utilisateur a déjà pris la main.
  useEffect(() => {
    if (!window.location.hash) return
    let cancelled = false
    const cancel = () => { cancelled = true }
    window.addEventListener('wheel', cancel, { passive: true, once: true })
    window.addEventListener('touchstart', cancel, { passive: true, once: true })

    const fix = () => {
      if (cancelled || !window.location.hash) return
      let target: Element | null = null
      try { target = document.querySelector(window.location.hash) } catch { return }
      if (!target) return
      const lenis = lenisRef.current
      if (lenis) {
        lenis.scrollTo(target as HTMLElement, { offset: -96, immediate: true, force: true })
      } else {
        const y = (target as HTMLElement).getBoundingClientRect().top + window.scrollY - 96
        window.scrollTo(0, y)
      }
    }

    // Deux passes (hydratation puis layout posé) + une après chargement complet des images
    const t1 = setTimeout(fix, 50)
    const t2 = setTimeout(fix, 450)
    const onLoad = () => setTimeout(fix, 60)
    if (document.readyState !== 'complete') window.addEventListener('load', onLoad, { once: true })

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      window.removeEventListener('load', onLoad)
      window.removeEventListener('wheel', cancel)
      window.removeEventListener('touchstart', cancel)
    }
  }, [pathname])

  return null
}
