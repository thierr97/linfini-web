'use client'
import { useState } from 'react'
import type { CartItem } from '@/types'
import { TVA } from '@/lib/db'

interface Props {
  total: number
  tableId: string | null
  items: CartItem[]
  note: string
  onClose: () => void
  onSuccess: () => void
}

type Method = 'CASH' | 'CARD' | 'MIXED'

export function PaymentModal({ total, tableId, items, note, onClose, onSuccess }: Props) {
  const [method, setMethod] = useState<Method>('CASH')
  const [cashGiven, setCashGiven] = useState('')
  const [cardAmount, setCardAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const tva = total * TVA
  const ht = total - tva

  const cashGivenNum = parseFloat(cashGiven) || 0
  const cardAmountNum = parseFloat(cardAmount) || 0
  const cashPart = method === 'MIXED' ? total - cardAmountNum : total
  const change = method === 'CASH' ? cashGivenNum - total : method === 'MIXED' ? cashGivenNum - cashPart : 0

  const canPay = () => {
    if (method === 'CASH') return cashGivenNum >= total
    if (method === 'CARD') return true
    if (method === 'MIXED') return cardAmountNum > 0 && cardAmountNum < total && cashGivenNum >= cashPart
    return false
  }

  const handlePay = async () => {
    if (!canPay()) return
    setLoading(true)

    // Create order first, then pay
    const orderRes = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tableId,
        items: items.map((i) => ({ itemId: i.itemId, name: i.name, price: i.price, quantity: i.quantity, modifiers: i.modifiers })),
        total,
        note,
      }),
    })
    const { order } = await orderRes.json()

    await fetch('/api/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order.id,
        method,
        amount: total,
        cashGiven: method !== 'CARD' ? cashGivenNum : null,
        cashChange: method !== 'CARD' ? Math.max(0, change) : null,
        cardRef: method !== 'CASH' ? `CB-${Date.now()}` : null,
      }),
    })

    setLoading(false)

    // Print receipt
    printReceipt(order.number)
    onSuccess()
  }

  const printReceipt = (orderNumber: string) => {
    const w = window.open('', '_blank', 'width=300,height=600')
    if (!w) return
    w.document.write(`
      <html><head><title>Ticket</title><style>
        body { font-family: monospace; font-size: 12px; width: 280px; margin: 0 auto; }
        h2 { text-align: center; }
        .line { display: flex; justify-content: space-between; }
        .total { font-weight: bold; font-size: 14px; border-top: 1px solid #000; padding-top: 4px; margin-top: 4px; }
        .center { text-align: center; }
      </style></head><body>
      <h2>L'INFINI</h2>
      <div class="center">Le Gosier, Guadeloupe</div>
      <div class="center">TVA: ${(TVA * 100).toFixed(1)}%</div>
      <hr/>
      <div class="center">Ticket ${orderNumber}</div>
      <div class="center">${tableId ? `Table: ${tableId}` : 'À emporter'}</div>
      <hr/>
      ${items.map((i) => `<div class="line"><span>${i.name} x${i.quantity}</span><span>${(i.price * i.quantity).toFixed(2)}€</span></div>`).join('')}
      <hr/>
      <div class="line"><span>HT</span><span>${ht.toFixed(2)}€</span></div>
      <div class="line"><span>TVA (${(TVA * 100).toFixed(1)}%)</span><span>${tva.toFixed(2)}€</span></div>
      <div class="line total"><span>TOTAL TTC</span><span>${total.toFixed(2)}€</span></div>
      ${method === 'CASH' || method === 'MIXED' ? `<div class="line"><span>Espèces</span><span>${cashGivenNum.toFixed(2)}€</span></div>` : ''}
      ${method !== 'CASH' ? `<div class="line"><span>Carte</span><span>${method === 'CARD' ? total.toFixed(2) : cardAmountNum.toFixed(2)}€</span></div>` : ''}
      ${change > 0 ? `<div class="line"><span>Rendu</span><span>${change.toFixed(2)}€</span></div>` : ''}
      <hr/>
      <div class="center">Merci de votre visite !</div>
      <div class="center">${new Date().toLocaleString('fr-FR')}</div>
      </body></html>
    `)
    w.document.close()
    setTimeout(() => w.print(), 300)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-md border border-gray-700">
        <div className="p-5 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Paiement</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white">✕</button>
        </div>

        <div className="p-5 space-y-4">
          {/* Récapitulatif */}
          <div className="bg-gray-800 rounded-xl p-4 space-y-1">
            <div className="flex justify-between text-gray-400 text-sm">
              <span>Sous-total HT</span><span>{ht.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-gray-400 text-sm">
              <span>TVA ({(TVA * 100).toFixed(1)}%)</span><span>{tva.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between text-white font-bold text-xl pt-1 border-t border-gray-700">
              <span>TOTAL TTC</span><span className="text-amber-400">{total.toFixed(2)} €</span>
            </div>
          </div>

          {/* Méthode */}
          <div className="grid grid-cols-3 gap-2">
            {(['CASH', 'CARD', 'MIXED'] as Method[]).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={`py-3 rounded-xl font-medium text-sm transition-colors ${
                  method === m ? 'bg-amber-500 text-black' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {m === 'CASH' ? '💵 Espèces' : m === 'CARD' ? '💳 Carte' : '🔀 Mixte'}
              </button>
            ))}
          </div>

          {/* Espèces */}
          {(method === 'CASH' || method === 'MIXED') && (
            <div className="space-y-3">
              {method === 'MIXED' && (
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Montant carte (€)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={cardAmount}
                    onChange={(e) => setCardAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-xl text-center focus:border-amber-500 outline-none"
                  />
                  {cardAmountNum > 0 && (
                    <div className="text-center text-sm text-gray-400 mt-1">Reste en espèces : {cashPart.toFixed(2)} €</div>
                  )}
                </div>
              )}
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Espèces reçues (€)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={cashGiven}
                  onChange={(e) => setCashGiven(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-xl text-center focus:border-amber-500 outline-none"
                />
              </div>

              {/* Raccourcis */}
              <div className="grid grid-cols-4 gap-2">
                {[5, 10, 20, 50].map((v) => (
                  <button key={v} onClick={() => setCashGiven(String(v))} className="bg-gray-800 hover:bg-gray-700 rounded-lg py-2 text-sm text-white">
                    {v}€
                  </button>
                ))}
              </div>

              {cashGivenNum > 0 && (
                <div className={`flex justify-between font-bold text-lg px-2 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  <span>Rendu monnaie</span>
                  <span>{Math.max(0, change).toFixed(2)} €</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-gray-800">
          <button
            onClick={handlePay}
            disabled={!canPay() || loading}
            className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl text-lg transition-colors"
          >
            {loading ? 'Traitement...' : `✅ Valider ${total.toFixed(2)} €`}
          </button>
        </div>
      </div>
    </div>
  )
}
