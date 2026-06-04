import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-noir text-creme">
      <Header />
      <div className="max-w-xl mx-auto px-4 pt-40 pb-24 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-900/30 border border-green-500/30 text-4xl mb-6">
          ✅
        </div>
        <h1 className="font-display text-4xl font-bold text-creme mb-3">Commande confirmée !</h1>
        <p className="text-white/50 mb-8">
          Merci pour votre commande. Vous recevrez une confirmation par email.
          Notre équipe prépare votre commande.
        </p>
        <Link href="/menu" className="bg-braise hover:bg-ambre text-white px-8 py-3 rounded-full font-bold transition-colors inline-block">
          Retour au menu
        </Link>
      </div>
      <Footer />
    </div>
  )
}
