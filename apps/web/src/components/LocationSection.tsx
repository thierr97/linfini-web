'use client'
import { motion } from 'framer-motion'

const HORAIRES = [
  { jour: 'Lundi', heure: 'Fermé', closed: true },
  { jour: 'Mardi – Jeudi', heure: '18h – 23h', closed: false },
  { jour: 'Vendredi – Samedi', heure: '18h – 01h', closed: false },
  { jour: 'Dimanche', heure: 'Fermé', closed: true },
]

const CONTACTS = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: 'Le District, Baie-Mahault, 97122 Guadeloupe',
    href: 'https://maps.google.com/?q=Le+District+Baie-Mahault+Guadeloupe',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    label: '+590 690 27 28 75',
    href: 'tel:+590690272875',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'contact@linfini.gp',
    href: 'mailto:contact@linfini.gp',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    label: '@infinievents.gp',
    href: 'https://www.instagram.com/infinievents.gp/',
  },
]

export default function LocationSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-braise text-sm font-semibold tracking-widest uppercase mb-3">Nous trouver</p>
          <h2 className="font-display text-4xl font-bold text-creme">
            Au cœur de la <span className="text-gradient">Guadeloupe</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Google Maps embed */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40 aspect-video relative"
          >
            <iframe
              src="https://maps.google.com/maps?q=Le+District+Baie-Mahault+Guadeloupe&output=embed&hl=fr&z=15"
              width="100%"
              height="100%"
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) saturate(0.9) brightness(0.85)' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="L'Infini — Le District, Baie-Mahault"
            />
            <div className="absolute bottom-3 left-3">
              <a
                href="https://maps.google.com/?q=Le+District+Baie-Mahault+Guadeloupe"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-braise text-white text-sm px-4 py-2 rounded-full hover:bg-ambre transition-colors shadow-lg font-semibold"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Ouvrir dans Maps
              </a>
            </div>
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="space-y-6"
          >
            {/* Horaires */}
            <div className="bg-charbon rounded-2xl p-6 border border-white/5">
              <h3 className="font-display text-xl font-bold text-or mb-5 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Horaires d&apos;ouverture
              </h3>
              <div className="space-y-3">
                {HORAIRES.map(h => (
                  <div key={h.jour} className={`flex justify-between py-2 border-b border-white/5 last:border-0 ${h.closed ? 'opacity-30' : ''}`}>
                    <span className="text-white/70 text-sm">{h.jour}</span>
                    <span className={`font-semibold text-sm ${h.closed ? 'text-white/40' : 'text-creme'}`}>{h.heure}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-charbon rounded-2xl p-6 border border-white/5">
              <h3 className="font-display text-xl font-bold text-or mb-5">Contact</h3>
              <div className="space-y-4">
                {CONTACTS.map(c => (
                  <a
                    key={c.label}
                    href={c.href}
                    target={c.href.startsWith('http') ? '_blank' : undefined}
                    rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="flex items-center gap-3 text-white/50 hover:text-white transition-colors group"
                  >
                    <span className="text-braise group-hover:text-ambre transition-colors flex-none">{c.icon}</span>
                    <span className="text-sm">{c.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Accès */}
            <div className="bg-charbon rounded-2xl p-6 border border-white/5">
              <h3 className="font-display text-lg font-bold text-creme mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-braise" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Accès & Parking
              </h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Zone commerciale du District, Baie-Mahault.
                Parking privé disponible sur place. Accessible depuis la RN1 et la rocade de Jarry.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
