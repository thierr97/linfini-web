'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

const HIGHLIGHTS = [
  { label: 'Tapas à partager', icon: '🍢' },
  { label: 'Burgers & wraps', icon: '🍔' },
  { label: 'Plats généreux', icon: '🍽️' },
  { label: 'Desserts maison', icon: '🍮' },
]

export default function PizzaTeaser() {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-braise/5 via-transparent to-ambre/5 pointer-events-none" />

      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12">
        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="flex-none w-full md:w-80 lg:w-96"
        >
          <div className="relative rounded-2xl overflow-hidden aspect-square shadow-2xl shadow-braise/10 border border-white/5">
            <img
              src="/menu/braise-duo.jpg"
              alt="Plateau braise"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-noir/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="inline-flex items-center gap-2 bg-braise/90 backdrop-blur-sm text-white text-sm font-semibold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
                Service 18h – 23h
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="flex-1 text-center md:text-left"
        >
          <p className="text-braise text-sm font-semibold tracking-widest uppercase mb-3">Le Maestro</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-creme mb-4">
            Notre <span className="text-gradient">nouvelle carte</span>
          </h2>
          <p className="text-white/50 mb-8 max-w-md">
            Tapas à partager, box généreuses, plats du soir et desserts maison.
            Commander directement depuis votre table.
          </p>

          <div className="flex flex-wrap gap-3 mb-8 justify-center md:justify-start">
            {HIGHLIGHTS.map(h => (
              <span key={h.label} className="flex items-center gap-2 bg-charbon border border-white/10 hover:border-braise/30 rounded-full px-4 py-2 text-sm text-white/60 transition-colors">
                <span>{h.icon}</span>
                <span>{h.label}</span>
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
            <Link
              href="/menu"
              className="bg-braise hover:bg-ambre text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-[1.02] inline-flex items-center justify-center gap-2 shadow-lg shadow-braise/20"
            >
              Voir la carte complète →
            </Link>
            <Link
              href="/#reservation"
              className="border border-white/20 hover:border-white/40 text-white/70 hover:text-white px-8 py-4 rounded-full font-semibold text-lg transition-all inline-flex items-center justify-center"
            >
              Réserver une table
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
