'use client'

import { useRef, useState } from 'react'

interface Props {
  value: string
  onChange: (url: string) => void
  label?: string
}

export default function ImageUpload({ value, onChange, label = 'Image' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  const upload = async (file: File) => {
    setError('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload/events', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur upload')
      onChange(data.url)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  const handleFile = (file: File | null | undefined) => {
    if (!file) return
    upload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div>
      <label className="block text-sm text-white/60 mb-1">{label}</label>

      {/* Zone drop + bouton */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
          dragOver
            ? 'border-braise bg-braise/10'
            : value
            ? 'border-white/10 bg-charbon'
            : 'border-white/15 bg-white/3 hover:border-white/25'
        }`}
      >
        {value ? (
          /* Aperçu de l'image */
          <div className="relative aspect-video rounded-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Aperçu" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-noir/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="bg-white/10 hover:bg-white/20 text-white text-sm px-3 py-1.5 rounded-lg backdrop-blur-sm transition-colors"
              >
                Changer
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="bg-red-500/20 hover:bg-red-500/40 text-red-400 text-sm px-3 py-1.5 rounded-lg backdrop-blur-sm transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        ) : (
          /* Zone vide */
          <div
            className="flex flex-col items-center justify-center py-8 px-4 cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-braise border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-white/40">Envoi en cours…</span>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 text-2xl">
                  🖼️
                </div>
                <p className="text-sm text-white/50 text-center">
                  Glisser-déposer une image ici<br />
                  <span className="text-braise font-medium">ou cliquer pour choisir</span>
                </p>
                <p className="text-xs text-white/20 mt-2">JPG, PNG, WebP — max 10 Mo</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* Input URL manuel */}
      <div className="mt-2 flex gap-2 items-center">
        <input
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="ou coller une URL…"
          className="flex-1 bg-noir border border-white/10 rounded-lg px-3 py-1.5 text-white/60 placeholder-white/20 text-xs focus:outline-none focus:border-braise/40"
        />
        {value && (
          <button
            type="button"
            onClick={() => window.open(value, '_blank')}
            className="text-white/30 hover:text-white/60 text-xs px-2 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors whitespace-nowrap"
          >
            Voir ↗
          </button>
        )}
      </div>

      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={e => handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
