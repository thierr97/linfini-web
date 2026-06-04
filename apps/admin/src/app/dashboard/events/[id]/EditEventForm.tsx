'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface TicketTypeInput {
  id?: string
  name: string
  description: string
  price: string
  quantity: string
  maxPerOrder: string
  salesStart: string
  salesEnd: string
  includes: string[]
  includeInput: string
  active: boolean
  position: number
}

function toDatetimeLocal(date: Date | string | null | undefined) {
  if (!date) return ''
  const d = new Date(date)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function EditEventForm({ event }: { event: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [title, setTitle] = useState(event.title)
  const [slug, setSlug] = useState(event.slug)
  const [description, setDescription] = useState(event.description ?? '')
  const [shortDesc, setShortDesc] = useState(event.shortDesc ?? '')
  const [date, setDate] = useState(toDatetimeLocal(event.date))
  const [doorsOpen, setDoorsOpen] = useState(toDatetimeLocal(event.doorsOpen))
  const [venue, setVenue] = useState(event.venue)
  const [imageUrl, setImageUrl] = useState(event.imageUrl ?? '')
  const [dressCode, setDressCode] = useState(event.dressCode ?? '')
  const [ageRestriction, setAgeRestriction] = useState(event.ageRestriction?.toString() ?? '')
  const [published, setPublished] = useState(event.published)
  const [featured, setFeatured] = useState(event.featured)
  const [soldOut, setSoldOut] = useState(event.soldOut)
  const [categories, setCategories] = useState<string[]>(event.categories ?? [])
  const [categoryInput, setCategoryInput] = useState('')

  const [ticketTypes, setTicketTypes] = useState<TicketTypeInput[]>(
    event.ticketTypes.map((t: any) => ({
      id: t.id,
      name: t.name,
      description: t.description ?? '',
      price: t.price.toString(),
      quantity: t.quantity.toString(),
      maxPerOrder: t.maxPerOrder.toString(),
      salesStart: toDatetimeLocal(t.salesStart),
      salesEnd: toDatetimeLocal(t.salesEnd),
      includes: t.includes ?? [],
      includeInput: '',
      active: t.active,
      position: t.position,
    }))
  )

  const addCategory = () => {
    const val = categoryInput.trim()
    if (val && !categories.includes(val)) setCategories([...categories, val])
    setCategoryInput('')
  }

  const removeCategory = (cat: string) => setCategories(categories.filter(c => c !== cat))

  const updateTicketType = (index: number, field: keyof TicketTypeInput, value: any) => {
    setTicketTypes(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t))
  }

  const addInclude = (index: number) => {
    const val = ticketTypes[index].includeInput.trim()
    if (val && !ticketTypes[index].includes.includes(val)) {
      updateTicketType(index, 'includes', [...ticketTypes[index].includes, val])
    }
    updateTicketType(index, 'includeInput', '')
  }

  const removeInclude = (ttIndex: number, include: string) => {
    updateTicketType(ttIndex, 'includes', ticketTypes[ttIndex].includes.filter(i => i !== include))
  }

  const addTicketType = () => {
    setTicketTypes(prev => [...prev, {
      name: '', description: '', price: '', quantity: '', maxPerOrder: '10',
      salesStart: '', salesEnd: '', includes: [], includeInput: '', active: true,
      position: prev.length,
    }])
  }

  const removeTicketType = (index: number) => {
    if (ticketTypes.length === 1) return
    setTicketTypes(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    if (!title || !slug || !date) {
      setError('Le titre, le slug et la date sont obligatoires.')
      return
    }
    if (ticketTypes.some(t => !t.name || !t.price || !t.quantity)) {
      setError('Chaque type de billet doit avoir un nom, un prix et une quantité.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, slug,
          description: description || null,
          shortDesc: shortDesc || null,
          date: new Date(date).toISOString(),
          doorsOpen: doorsOpen ? new Date(doorsOpen).toISOString() : null,
          venue, imageUrl: imageUrl || null,
          dressCode: dressCode || null,
          ageRestriction: ageRestriction ? parseInt(ageRestriction) : null,
          categories, published, featured, soldOut,
          ticketTypes: ticketTypes.map((t, i) => ({
            id: t.id,
            name: t.name,
            description: t.description || null,
            price: parseFloat(t.price),
            quantity: parseInt(t.quantity),
            maxPerOrder: parseInt(t.maxPerOrder) || 10,
            salesStart: t.salesStart ? new Date(t.salesStart).toISOString() : null,
            salesEnd: t.salesEnd ? new Date(t.salesEnd).toISOString() : null,
            includes: t.includes,
            active: t.active,
            position: i,
          })),
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la sauvegarde')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Supprimer cet événement ? Cette action est irréversible.')) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/events/${event.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la suppression')
      }
      router.push('/dashboard/events')
    } catch (err: any) {
      setError(err.message)
      setDeleting(false)
    }
  }

  const inputClass = 'bg-noir border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/20 focus:outline-none focus:border-braise/50 w-full'
  const labelClass = 'block text-sm text-white/60 mb-1'

  return (
    <div className="min-h-screen bg-noir text-white max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push('/dashboard/events')} className="text-white/40 hover:text-white transition-colors text-sm">
            ← Retour
          </button>
          <h1 className="text-2xl font-bold text-white">Éditer l'événement</h1>
        </div>
        <button
          onClick={() => router.push(`/dashboard/events/${event.id}/billets`)}
          className="text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/20 px-3 py-1.5 rounded-lg transition-colors"
        >
          Voir les billets
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Informations générales */}
        <section className="bg-charbon rounded-xl border border-white/10 p-5">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Informations générales</h2>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Titre *</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Slug *</label>
                <input type="text" value={slug} onChange={e => setSlug(e.target.value)} className={inputClass} required />
              </div>
            </div>
            <div>
              <label className={labelClass}>Description courte</label>
              <input type="text" value={shortDesc} onChange={e => setShortDesc(e.target.value)} className={inputClass} maxLength={160} />
            </div>
            <div>
              <label className={labelClass}>Description complète</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className={`${inputClass} min-h-[120px] resize-y`} rows={5} />
            </div>
          </div>
        </section>

        {/* Date & Lieu */}
        <section className="bg-charbon rounded-xl border border-white/10 p-5">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Date & Lieu</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Date de l'événement *</label>
              <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className={labelClass}>Ouverture des portes</label>
              <input type="datetime-local" value={doorsOpen} onChange={e => setDoorsOpen(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Lieu</label>
              <input type="text" value={venue} onChange={e => setVenue(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Image (URL)</label>
              <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Code vestimentaire</label>
              <input type="text" value={dressCode} onChange={e => setDressCode(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Âge minimum</label>
              <input type="number" value={ageRestriction} onChange={e => setAgeRestriction(e.target.value)} min="0" max="99" className={inputClass} />
            </div>
          </div>
        </section>

        {/* Catégories */}
        <section className="bg-charbon rounded-xl border border-white/10 p-5">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Catégories</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text" value={categoryInput} onChange={e => setCategoryInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCategory() } }}
              placeholder="Ajouter une catégorie..." className={`${inputClass} flex-1`}
            />
            <button type="button" onClick={addCategory} className="bg-white/10 hover:bg-white/15 text-white px-3 py-2 rounded-lg text-sm transition-colors">
              Ajouter
            </button>
          </div>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <span key={cat} className="flex items-center gap-1.5 bg-braise/20 text-braise border border-braise/30 px-2.5 py-1 rounded-full text-sm">
                  {cat}
                  <button type="button" onClick={() => removeCategory(cat)} className="text-braise/60 hover:text-braise">×</button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Options */}
        <section className="bg-charbon rounded-xl border border-white/10 p-5">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider mb-4">Options</h2>
          <div className="flex gap-6 flex-wrap">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={published} onChange={e => setPublished(e.target.checked)} className="w-4 h-4 accent-braise" />
              <span className="text-sm text-white">Publié</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="w-4 h-4 accent-or" />
              <span className="text-sm text-white">En vedette</span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={soldOut} onChange={e => setSoldOut(e.target.checked)} className="w-4 h-4 accent-red-500" />
              <span className="text-sm text-white">Complet (sold out)</span>
            </label>
          </div>
        </section>

        {/* Types de billets */}
        <section className="bg-charbon rounded-xl border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Types de billets</h2>
            <button type="button" onClick={addTicketType} className="text-sm bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 px-3 py-1.5 rounded-lg transition-colors">
              + Ajouter un type
            </button>
          </div>

          <div className="space-y-4">
            {ticketTypes.map((tt, index) => (
              <div key={tt.id ?? index} className="border border-white/10 rounded-xl p-4 bg-noir/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white/70">Type #{index + 1}</span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={tt.active} onChange={e => updateTicketType(index, 'active', e.target.checked)} className="w-3.5 h-3.5 accent-braise" />
                      <span className="text-xs text-white/40">Actif</span>
                    </label>
                  </div>
                  {ticketTypes.length > 1 && (
                    <button type="button" onClick={() => removeTicketType(index)} className="text-red-400/60 hover:text-red-400 text-sm transition-colors">
                      Supprimer
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Nom *</label>
                    <input type="text" value={tt.name} onChange={e => updateTicketType(index, 'name', e.target.value)} placeholder="Ex: Early Bird, VIP..." className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Prix (€) *</label>
                    <input type="number" value={tt.price} onChange={e => updateTicketType(index, 'price', e.target.value)} placeholder="0.00" min="0" step="0.01" className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Quantité *</label>
                    <input type="number" value={tt.quantity} onChange={e => updateTicketType(index, 'quantity', e.target.value)} placeholder="100" min="1" className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Max par commande</label>
                    <input type="number" value={tt.maxPerOrder} onChange={e => updateTicketType(index, 'maxPerOrder', e.target.value)} min="1" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Début des ventes</label>
                    <input type="datetime-local" value={tt.salesStart} onChange={e => updateTicketType(index, 'salesStart', e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Fin des ventes</label>
                    <input type="datetime-local" value={tt.salesEnd} onChange={e => updateTicketType(index, 'salesEnd', e.target.value)} className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Description</label>
                    <input type="text" value={tt.description} onChange={e => updateTicketType(index, 'description', e.target.value)} placeholder="Description du type de billet..." className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Inclus</label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text" value={tt.includeInput}
                        onChange={e => updateTicketType(index, 'includeInput', e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addInclude(index) } }}
                        placeholder="Ex: 1 boisson offerte, Accès VIP..." className={`${inputClass} flex-1`}
                      />
                      <button type="button" onClick={() => addInclude(index)} className="bg-white/10 hover:bg-white/15 text-white px-3 py-2 rounded-lg text-sm transition-colors">+</button>
                    </div>
                    {tt.includes.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {tt.includes.map(inc => (
                          <span key={inc} className="flex items-center gap-1 bg-white/5 text-white/60 border border-white/10 px-2 py-0.5 rounded-full text-xs">
                            {inc}
                            <button type="button" onClick={() => removeInclude(index, inc)} className="hover:text-white">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">{error}</div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 text-green-400 text-sm">Événement sauvegardé avec succès.</div>
        )}

        <div className="flex items-center justify-between pb-8">
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-sm text-red-400/60 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {deleting ? 'Suppression...' : 'Supprimer l\'événement'}
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.push('/dashboard/events')}
              className="px-5 py-2.5 rounded-lg text-sm text-white/50 hover:text-white border border-white/10 hover:border-white/20 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-braise hover:bg-ambre disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
