import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Code39 from '@/components/Code39'
import { ensurePickupOrder, type PickupOrderView } from '@/lib/pickup'

export const dynamic = 'force-dynamic'

function qrUrl(code: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(code)}&qzone=2`
}

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: { session_id?: string }
}) {
  let order: PickupOrderView | null = null
  let error: string | null = null

  if (!searchParams.session_id) {
    error = 'Session de paiement introuvable.'
  } else {
    try {
      order = await ensurePickupOrder(searchParams.session_id)
    } catch (e: any) {
      console.error('[confirmation]', e)
      error = 'Impossible de confirmer le paiement. Si vous avez été débité, présentez votre email de confirmation au bar.'
    }
  }

  return (
    <div className="min-h-screen bg-noir text-creme">
      <Header />
      <div className="max-w-xl mx-auto px-4 pt-36 pb-24 text-center">
        {error || !order ? (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-900/30 border border-red-500/30 text-4xl mb-6">⚠️</div>
            <h1 className="font-display text-3xl font-bold text-creme mb-3">Un instant…</h1>
            <p className="text-white/50 mb-8">{error}</p>
            <Link href="/menu" className="bg-braise hover:bg-ambre text-white px-8 py-3 rounded-full font-bold transition-colors inline-block">
              Retour au menu
            </Link>
          </>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-900/30 border border-green-500/30 text-4xl mb-6">✅</div>
            <h1 className="font-display text-4xl font-bold text-creme mb-2">Commande confirmée !</h1>
            <p className="text-white/50 mb-8">
              Merci {order.customerName} — votre commande part en préparation au bar.
            </p>

            {/* Code de retrait */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 text-noir mb-6 shadow-2xl">
              <p className="text-sm font-semibold uppercase tracking-widest text-noir/50 mb-2">Code de retrait</p>
              <p className="font-display text-6xl font-bold tracking-[0.3em] mb-5 -mr-[0.3em]">{order.code}</p>
              <div className="flex justify-center mb-4">
                <Code39 value={order.code} height={70} className="max-w-full" />
              </div>
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrUrl(order.code)} alt={`QR code ${order.code}`} width={160} height={160} className="rounded-lg" />
              </div>
              <p className="text-noir/50 text-xs mt-4">
                Présentez ce code au bar — il peut être scanné (douchette ou appareil photo) ou saisi.
              </p>
            </div>

            {/* Récap commande */}
            <div className="bg-charbon rounded-2xl border border-white/10 p-5 text-left mb-8">
              {order.lines.map((l, i) => (
                <div key={i} className="flex justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
                  <span className="text-creme/80">{l.qty} × {l.name}</span>
                  <span className="text-ambre font-semibold">{(l.price * l.qty).toFixed(2)} €</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 font-bold">
                <span>Total payé en ligne</span>
                <span className="text-or">{order.total.toFixed(2)} €</span>
              </div>
            </div>

            {order.customerEmail && (
              <p className="text-white/30 text-sm mb-6">Le code a aussi été envoyé à {order.customerEmail}.</p>
            )}

            <Link href="/menu" className="bg-braise hover:bg-ambre text-white px-8 py-3 rounded-full font-bold transition-colors inline-block">
              Retour au menu
            </Link>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}
