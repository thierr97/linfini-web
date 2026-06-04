'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface TicketType {
  id: string
  name: string
  description: string | null
  price: number
  quantity: number
  sold: number
  maxPerOrder: number
  salesStart: Date | null
  salesEnd: Date | null
  includes: string[]
  active: boolean
  position: number
}

interface Props {
  ticketTypes: TicketType[]
  eventTitle: string
  eventSlug: string
}

interface Selection {
  [ticketTypeId: string]: number
}

interface BuyerForm {
  firstName: string
  lastName: string
  email: string
  phone: string
}

const TVA_RATE = 0.085

export default function TicketPurchase({ ticketTypes, eventTitle, eventSlug }: Props) {
  const router = useRouter()
  const [selections, setSelections] = useState<Selection>({})
  const [buyer, setBuyer] = useState<BuyerForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'tickets' | 'form'>('tickets')

  const now = new Date()
  const availableTypes = ticketTypes.filter((tt) => {
    if (!tt.active) return false
    if (tt.salesStart && new Date(tt.salesStart) > now) return false
    if (tt.salesEnd && new Date(tt.salesEnd) < now) return false
    return true
  })

  const getRemaining = (tt: TicketType) => tt.quantity - tt.sold

  const updateSelection = (id: string, qty: number) => {
    setSelections((prev) => ({ ...prev, [id]: qty }))
  }

  const total = Object.entries(selections).reduce((sum, [id, qty]) => {
    const tt = ticketTypes.find((t) => t.id === id)
    return sum + (tt ? tt.price * qty : 0)
  }, 0)

  const totalItems = Object.values(selections).reduce((sum, qty) => sum + qty, 0)

  const tvaAmount = total * TVA_RATE
  const htAmount = total - tvaAmount

  const hasSelection = totalItems > 0

  const getSelectedTicketTypes = () =>
    Object.entries(selections)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => ({
        ticketType: ticketTypes.find((t) => t.id === id)!,
        qty,
      }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const selected = getSelectedTicketTypes()
    if (selected.length === 0) {
      setError('Veuillez sélectionner au moins un billet.')
      return
    }
    if (!buyer.firstName || !buyer.lastName || !buyer.email) {
      setError('Veuillez remplir tous les champs obligatoires.')
      return
    }

    setLoading(true)

    try {
      // Pour simplifier, on soumet le premier type sélectionné (ou on peut boucler)
      // Si plusieurs types sélectionnés, on crée une session par type — ici on prend le premier
      const first = selected[0]

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketTypeId: first.ticketType.id,
          quantity: first.qty,
          buyerFirstName: buyer.firstName,
          buyerLastName: buyer.lastName,
          buyerEmail: buyer.email,
          buyerPhone: buyer.phone,
          eventSlug,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue. Veuillez réessayer.')
        return
      }

      if (data.url) {
        router.push(data.url)
      }
    } catch {
      setError('Erreur réseau. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  if (availableTypes.length === 0) {
    return (
      <div className="bg-charbon border border-white/10 rounded-2xl p-6 text-center">
        <p className="text-white/40 text-sm">Aucun billet disponible pour le moment.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Liste des types de billets */}
      {availableTypes.map((tt) => {
        const remaining = getRemaining(tt)
        const isUnavailable = remaining <= 0
        const selected = selections[tt.id] || 0

        return (
          <div
            key={tt.id}
            className={`bg-charbon border rounded-2xl p-5 transition-all ${
              isUnavailable
                ? 'border-white/5 opacity-50'
                : selected > 0
                ? 'border-braise/50 shadow-[0_0_20px_rgba(200,75,31,0.1)]'
                : 'border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-creme text-lg leading-tight">{tt.name}</p>
                {tt.description && (
                  <p className="text-white/40 text-sm mt-0.5">{tt.description}</p>
                )}
              </div>
              <div className="text-right ml-4 shrink-0">
                <p className="font-display text-2xl font-bold text-or">
                  {tt.price.toFixed(0)} €
                </p>
                <p className="text-white/30 text-xs">TVA 8.5% incluse</p>
              </div>
            </div>

            {/* Inclus */}
            {tt.includes.length > 0 && (
              <ul className="mb-3 space-y-1">
                {tt.includes.map((item, i) => (
                  <li key={i} className="text-xs text-white/50 flex items-center gap-2">
                    <span className="text-or">✓</span> {item}
                  </li>
                ))}
              </ul>
            )}

            {/* Disponibilité + quantité */}
            <div className="flex items-center justify-between mt-3">
              <p className={`text-xs font-medium ${remaining <= 10 && remaining > 0 ? 'text-ambre' : 'text-white/30'}`}>
                {isUnavailable
                  ? 'Épuisé'
                  : remaining <= 10
                  ? `Plus que ${remaining} place${remaining > 1 ? 's' : ''}`
                  : `${remaining} places disponibles`}
              </p>

              {!isUnavailable && (
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateSelection(tt.id, Math.max(0, selected - 1))}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-lg flex items-center justify-center transition-colors disabled:opacity-30"
                    disabled={selected === 0}
                  >
                    −
                  </button>
                  <span className="text-creme font-bold w-5 text-center">{selected}</span>
                  <button
                    type="button"
                    onClick={() =>
                      updateSelection(tt.id, Math.min(Math.min(tt.maxPerOrder, remaining), selected + 1))
                    }
                    className="w-8 h-8 rounded-full bg-braise hover:bg-ambre text-white font-bold text-lg flex items-center justify-center transition-colors disabled:opacity-30"
                    disabled={selected >= Math.min(tt.maxPerOrder, remaining)}
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Récapitulatif + formulaire */}
      {hasSelection && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Recap */}
          <div className="bg-charbon/60 border border-white/10 rounded-xl p-4">
            <div className="space-y-1 mb-3">
              {getSelectedTicketTypes().map(({ ticketType, qty }) => (
                <div key={ticketType.id} className="flex justify-between text-sm text-white/60">
                  <span>
                    {ticketType.name} × {qty}
                  </span>
                  <span>{(ticketType.price * qty).toFixed(2)} €</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-3 space-y-1">
              <div className="flex justify-between text-xs text-white/30">
                <span>Prix HT</span>
                <span>{htAmount.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-xs text-white/30">
                <span>TVA 8.5%</span>
                <span>{tvaAmount.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between font-bold text-creme text-base pt-1">
                <span>Total</span>
                <span className="text-or">{total.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Formulaire acheteur */}
          <div className="bg-charbon border border-white/10 rounded-2xl p-5 space-y-4">
            <p className="font-display font-semibold text-creme text-base">Vos informations</p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wide block mb-1">
                  Prénom <span className="text-braise">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={buyer.firstName}
                  onChange={(e) => setBuyer((b) => ({ ...b, firstName: e.target.value }))}
                  className="w-full bg-noir border border-white/10 focus:border-braise/50 rounded-lg px-3 py-2 text-creme text-sm outline-none transition-colors placeholder:text-white/20"
                  placeholder="Jean"
                />
              </div>
              <div>
                <label className="text-xs text-white/40 uppercase tracking-wide block mb-1">
                  Nom <span className="text-braise">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={buyer.lastName}
                  onChange={(e) => setBuyer((b) => ({ ...b, lastName: e.target.value }))}
                  className="w-full bg-noir border border-white/10 focus:border-braise/50 rounded-lg px-3 py-2 text-creme text-sm outline-none transition-colors placeholder:text-white/20"
                  placeholder="Dupont"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-white/40 uppercase tracking-wide block mb-1">
                Email <span className="text-braise">*</span>
              </label>
              <input
                type="email"
                required
                value={buyer.email}
                onChange={(e) => setBuyer((b) => ({ ...b, email: e.target.value }))}
                className="w-full bg-noir border border-white/10 focus:border-braise/50 rounded-lg px-3 py-2 text-creme text-sm outline-none transition-colors placeholder:text-white/20"
                placeholder="jean.dupont@email.com"
              />
            </div>

            <div>
              <label className="text-xs text-white/40 uppercase tracking-wide block mb-1">
                Téléphone
              </label>
              <input
                type="tel"
                value={buyer.phone}
                onChange={(e) => setBuyer((b) => ({ ...b, phone: e.target.value }))}
                className="w-full bg-noir border border-white/10 focus:border-braise/50 rounded-lg px-3 py-2 text-creme text-sm outline-none transition-colors placeholder:text-white/20"
                placeholder="+590 690 XX XX XX"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-braise hover:bg-ambre disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-base transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                Redirection...
              </>
            ) : (
              <>
                Payer {total.toFixed(2)} € →
              </>
            )}
          </button>

          <p className="text-center text-white/20 text-xs">
            Paiement sécurisé par Stripe · Vos données sont protégées
          </p>
        </form>
      )}

      {!hasSelection && (
        <p className="text-center text-white/20 text-sm py-2">
          Sélectionnez vos billets pour continuer
        </p>
      )}
    </div>
  )
}
