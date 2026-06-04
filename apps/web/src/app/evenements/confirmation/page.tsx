import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Confirmation de commande',
  description: 'Votre billet a bien été enregistré.',
}

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

async function getTicketFromSession(sessionId: string) {
  if (!process.env.STRIPE_SECRET_KEY) return null

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2026-02-25.clover',
    })

    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const ticketId = session.metadata?.ticketId
    if (!ticketId) return null

    const { prisma } = await import('@linfini/db')
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        event: true,
        ticketType: true,
      },
    })

    return ticket
  } catch {
    return null
  }
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams

  if (!session_id) {
    redirect('/evenements')
  }

  const ticket = await getTicketFromSession(session_id)

  if (!ticket) {
    redirect('/evenements')
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(ticket.code)}&bgcolor=111111&color=F5EDD8&qzone=2`

  return (
    <div className="min-h-screen bg-noir">
      <Header />

      <div className="max-w-2xl mx-auto px-4 pt-32 pb-24">
        {/* Succès */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-900/30 border border-green-500/30 text-4xl mb-6">
            ✅
          </div>
          <h1 className="font-display text-4xl font-bold text-creme mb-3">
            Paiement confirmé !
          </h1>
          <p className="text-white/50 text-lg">
            Votre billet pour{' '}
            <span className="text-or font-semibold">{ticket.event.title}</span> est enregistré.
          </p>
        </div>

        {/* Card billet */}
        <div className="bg-charbon border border-white/10 rounded-3xl overflow-hidden">
          {/* Header de la card */}
          <div className="bg-gradient-to-r from-braise to-ambre px-6 py-4">
            <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-0.5">
              L&apos;Infini Guadeloupe
            </p>
            <p className="font-display text-xl font-bold text-white">{ticket.event.title}</p>
          </div>

          {/* Corps */}
          <div className="p-6 grid grid-cols-2 gap-6">
            {/* Infos billet */}
            <div className="space-y-4">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wide mb-1">Date</p>
                <p className="text-creme font-semibold capitalize text-sm">
                  {formatDate(ticket.event.date)}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wide mb-1">Lieu</p>
                <p className="text-creme font-semibold text-sm">{ticket.event.venue}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wide mb-1">Type</p>
                <p className="text-creme font-semibold text-sm">{ticket.ticketType.name}</p>
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wide mb-1">Quantité</p>
                <p className="text-creme font-semibold text-sm">
                  {ticket.quantity} billet{ticket.quantity > 1 ? 's' : ''}
                </p>
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wide mb-1">Total payé</p>
                <p className="text-or font-bold text-lg">{ticket.total.toFixed(2)} €</p>
              </div>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wide mb-1">Acheteur</p>
                <p className="text-creme font-semibold text-sm">
                  {ticket.buyerFirstName} {ticket.buyerLastName}
                </p>
                <p className="text-white/40 text-xs">{ticket.buyerEmail}</p>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrUrl}
                alt={`QR Code billet ${ticket.code}`}
                width={160}
                height={160}
                className="rounded-xl border border-white/10"
              />
              <p className="text-white/30 text-xs mt-3 text-center font-mono break-all">
                {ticket.code}
              </p>
            </div>
          </div>

          {/* Séparateur tirets */}
          <div className="px-6">
            <div className="border-t border-dashed border-white/10" />
          </div>

          {/* Statut + email */}
          <div className="px-6 py-5">
            <div className="flex items-center gap-3">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-green-400 text-sm font-semibold">
                Billet {ticket.status === 'CONFIRMED' ? 'confirmé' : 'en cours de traitement'}
              </p>
            </div>
            <p className="text-white/30 text-xs mt-2">
              Un email de confirmation vous a été envoyé à{' '}
              <span className="text-white/50">{ticket.buyerEmail}</span>
            </p>
          </div>
        </div>

        {/* Infos pratiques */}
        <div className="mt-6 bg-charbon/50 border border-white/5 rounded-2xl p-5">
          <h3 className="font-semibold text-creme mb-3 text-sm">Informations pratiques</h3>
          <ul className="space-y-2 text-sm text-white/40">
            <li>• Présentez ce QR code à l&apos;entrée de l&apos;événement</li>
            <li>• Une pièce d&apos;identité peut être demandée</li>
            {ticket.event.dressCode && (
              <li>• Dress code : {ticket.event.dressCode}</li>
            )}
            {ticket.event.ageRestriction && (
              <li>• Âge minimum : {ticket.event.ageRestriction} ans</li>
            )}
          </ul>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <a
            href={`/evenements/${ticket.event.slug}`}
            className="flex-1 text-center border border-white/10 hover:border-white/20 text-white/60 hover:text-white py-3 px-6 rounded-xl text-sm font-semibold transition-colors"
          >
            ← Retour à l&apos;événement
          </a>
          <a
            href="/evenements"
            className="flex-1 text-center bg-braise hover:bg-ambre text-white py-3 px-6 rounded-xl text-sm font-bold transition-colors"
          >
            Voir tous les événements
          </a>
        </div>
      </div>

      <Footer />
    </div>
  )
}
