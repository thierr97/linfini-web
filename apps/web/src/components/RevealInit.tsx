'use client'
import { useEffect } from 'react'

// Observe tous les éléments .reveal de la page et déclenche leur apparition
// à l'entrée dans le viewport (une seule fois par élément).
export default function RevealInit() {
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('reveal-in')
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
    )
    const observeAll = () =>
      document.querySelectorAll('.reveal:not(.reveal-in)').forEach(el => io.observe(el))
    observeAll()
    // Couvre les navigations client (nouvelles sections montées après coup)
    const mo = new MutationObserver(observeAll)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => { io.disconnect(); mo.disconnect() }
  }, [])
  return null
}
