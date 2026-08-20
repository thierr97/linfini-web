'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'

// Défilement inertiel global (desktop). Le tactile reste natif ; désactivé si
// l'utilisateur préfère réduire les animations.
export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      smoothWheel: true,
    })

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
    }
  }, [])

  return null
}
