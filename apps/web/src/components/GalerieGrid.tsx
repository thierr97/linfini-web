'use client'
import { useState, useEffect, useCallback } from 'react'
import { IconX, IconChevronLeft, IconChevronRight } from '@/components/icons'

export type GaleriePhoto = { id: number; src: string; label: string }

export default function GalerieGrid({ photos }: { photos: GaleriePhoto[] }) {
  const [selected, setSelected] = useState<number | null>(null)

  const close = useCallback(() => setSelected(null), [])
  const prev = useCallback(() => setSelected(s => (s === null ? null : (s + photos.length - 1) % photos.length)), [photos.length])
  const next = useCallback(() => setSelected(s => (s === null ? null : (s + 1) % photos.length)), [photos.length])

  useEffect(() => {
    if (selected === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [selected, close, prev, next])

  return (
    <>
      <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setSelected(i)}
            aria-label={`Agrandir : ${photo.label}`}
            className="relative block w-full break-inside-avoid rounded-2xl overflow-hidden border border-white/5 hover:border-or/30 transition-colors duration-300 group cursor-pointer text-left"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.src}
              alt={photo.label}
              className="w-full h-auto object-cover group-hover:scale-[1.04] transition-transform duration-600"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-noir/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="absolute bottom-3 left-4 right-4 text-sm font-semibold text-creme opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
              {photo.label}
            </span>
          </button>
        ))}
      </div>

      {/* Lightbox */}
      {selected !== null && (
        <div
          className="fixed inset-0 z-[60] bg-noir/95 backdrop-blur-xl flex items-center justify-center p-4"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={photos[selected].label}
        >
          <button
            onClick={close}
            aria-label="Fermer"
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer z-10"
          >
            <IconX className="w-5 h-5" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); prev() }}
            aria-label="Photo précédente"
            className="absolute left-3 md:left-6 w-11 h-11 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer z-10"
          >
            <IconChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={e => { e.stopPropagation(); next() }}
            aria-label="Photo suivante"
            className="absolute right-3 md:right-6 w-11 h-11 rounded-full bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer z-10"
          >
            <IconChevronRight className="w-5 h-5" />
          </button>
          <figure className="max-w-4xl max-h-[85vh] flex flex-col items-center gap-4" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[selected].src}
              alt={photos[selected].label}
              className="max-h-[75vh] w-auto rounded-2xl object-contain shadow-2xl shadow-black/60"
            />
            <figcaption className="text-creme/80 text-sm font-medium tracking-wide">
              {photos[selected].label}
              <span className="text-white/30 ml-3">{selected + 1} / {photos.length}</span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  )
}
