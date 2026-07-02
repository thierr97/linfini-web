'use client'
import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [devisSent, setDevisSent] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Bonjour ! 🌴 Je suis l'assistant de L'Infini Guadeloupe. Je suis là pour vous aider à organiser votre événement et vous préparer un devis personnalisé. Quel type d'événement souhaitez-vous organiser ?"
      }])
    }
  }, [open, messages.length])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage() {
    if (!input.trim() || loading) return

    const userMsg: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      const data = await res.json()

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.action === 'generer_devis' && data.devisData && !devisSent) {
        setDevisSent(true)
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "⏳ Génération de votre devis en cours..."
        }])

        const devisRes = await fetch('/api/devis', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(data.devisData),
        })
        const devisResult = await devisRes.json()

        if (devisResult.success) {
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              role: 'assistant',
              content: `✅ Votre devis **N° ${devisResult.numero}** a été envoyé à **${data.devisData.email}** avec le PDF en pièce jointe. Notre équipe vous contacte dans les 24h !`
            }
            return updated
          })
        } else {
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              role: 'assistant',
              content: "Votre demande a bien été reçue. Écrivez-nous à direction.infini971@gmail.com pour confirmer."
            }
            return updated
          })
        }
        return
      }

      if (data.text) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.text }])
      }
    } catch (err) {
      console.error('Chat error:', err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Désolé, une erreur est survenue. Écrivez-nous directement à **direction.infini971@gmail.com** ou appelez le +590 690 27 28 75."
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Bouton flottant */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-braise hover:bg-ambre rounded-full shadow-2xl shadow-braise/40 flex items-center justify-center transition-all hover:scale-110"
        aria-label="Assistant événementiel"
      >
        {open ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-or rounded-full">
              <span className="w-2 h-2 bg-or rounded-full animate-ping absolute inset-1" />
            </span>
          </>
        )}
      </button>

      {/* Fenêtre de chat */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[340px] md:w-[380px] h-[520px] bg-charbon border border-white/10 rounded-2xl shadow-2xl shadow-black/60 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-noir border-b border-white/10 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-braise/20 border border-braise/30 flex items-center justify-center text-lg">✨</div>
            <div>
              <p className="text-white font-semibold text-sm">Assistant L&apos;Infini</p>
              <p className="text-white/30 text-xs">Devis événementiel · 24h</p>
            </div>
            <div className="ml-auto w-2 h-2 bg-green-400 rounded-full" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-braise text-white rounded-br-sm'
                    : 'bg-noir/60 text-white/80 border border-white/5 rounded-bl-sm'
                }`}>
                  {m.content.split('**').map((part, j) =>
                    j % 2 === 1 ? <strong key={j} className="text-or">{part}</strong> : part
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-noir/60 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-white/10 p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Votre message..."
              className="flex-1 bg-noir/60 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-braise/50"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-9 h-9 bg-braise hover:bg-ambre disabled:opacity-30 rounded-xl flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
