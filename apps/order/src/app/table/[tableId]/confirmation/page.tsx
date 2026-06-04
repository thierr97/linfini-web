'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { useEffect } from 'react'
import { useCart } from '@/stores/cart'

function ConfirmationContent() {
  const params = useSearchParams()
  const router = useRouter()
  const clearCart = useCart(s => s.clearCart)
  const orderNumber = params.get('order')

  useEffect(() => {
    clearCart()
    const t = setTimeout(() => router.back(), 8000)
    return () => clearTimeout(t)
  }, [clearCart, router])

  return (
    <div className="min-h-screen bg-noir flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-8xl mb-6 animate-bounce">✅</div>
        <h1 className="text-3xl font-bold text-or mb-2">Commande envoyée !</h1>
        <p className="text-white/60 mb-4">Commande #{orderNumber}</p>
        <p className="text-creme/80 mb-8">La cuisine prépare votre commande. Merci !</p>
        <div className="w-full bg-white/10 rounded-full h-1">
          <div className="bg-braise h-1 rounded-full animate-[shrink_8s_linear_forwards]" style={{width:'100%'}}></div>
        </div>
        <p className="text-white/30 text-sm mt-2">Redirection automatique...</p>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return <Suspense><ConfirmationContent /></Suspense>
}
