'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { MenuItem } from '@/lib/data/types'

// Visuels et descriptions du teaser par ID produit Odoo (les prix viennent d'Odoo).
// Les images restent des assets statiques du site (spec §6).
const TEASER: Record<string, { img: string; desc: string; signature?: boolean }> = {
  '364': { img: '/menu/rhum.jpg', desc: 'Rhum blanc agricole' },                 // Ti Punch Blanc
  '365': { img: '/menu/rhum.jpg', desc: 'Rhum vieux' },                          // Ti Punch Vieux
  '367': { img: '/menu/wine.jpg', desc: 'Verre 10cl' },                          // Martini Blanc
  '370': { img: '/menu/glass-spirits.jpg', desc: 'Liqueur de menthe' },          // Get 27
  '372': { img: '/menu/amaretto.jpg', desc: 'Disaronno' },                       // Amaretto
  '374': { img: '/menu/baileys.jpg', desc: "Liqueur d'Irish Cream" },            // Bailey's
  '384': { img: '/menu/cocktail-creation.jpg', desc: 'Hennessy, crème de framboise, citron, coulis de framboise, vanille, miel', signature: true }, // Le Smile
  '385': { img: '/menu/mai-tai.jpg', desc: 'Rhum vieux, Amaretto, vanille, ananas, passion, cannelle, miel' },                                      // Maya L'abeille
  '391': { img: '/menu/cognac.jpg', desc: 'Hennessy, rhum vieux, bois bandé, gingembre, vanille, citron + secret', signature: true },               // Balthazar
}

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function BarSection({ aperitifs = [], cocktails = [] }: { aperitifs?: MenuItem[]; cocktails?: MenuItem[] }) {
  if (aperitifs.length === 0 && cocktails.length === 0) return null

  return (
    <section className="py-24 px-4 bg-charbon">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-or text-sm font-semibold tracking-widest uppercase mb-3">Le Smile Bar</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-creme">
            Apéritifs &<br /><span className="text-gradient">Ti Punch</span>
          </h2>
          <p className="text-white/40 mt-4 max-w-lg mx-auto">
            Ti Punch blanc ou vieux, liqueurs et classiques du bar antillais.
          </p>
        </motion.div>

        {/* Apéritifs grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16"
        >
          {aperitifs.map(r => (
            <motion.div key={r.id} variants={itemAnim} className="group relative rounded-xl overflow-hidden border border-white/5 hover:border-or/30 transition-all bg-noir/50">
              <div className="relative h-28 overflow-hidden">
                <img
                  src={TEASER[r.id]?.img ?? r.fallbackImg ?? r.img}
                  alt={r.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-70 group-hover:opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/40 to-transparent" />
              </div>
              <div className="p-4">
                <p className="font-display font-bold text-creme mb-1 text-sm">{r.name}</p>
                <p className="text-xs text-white/40 mb-3 leading-relaxed">{r.desc || TEASER[r.id]?.desc}</p>
                <span className="text-ambre font-bold text-lg">{r.price.toFixed(2)} €</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Cocktails Créations */}
        <div className="mb-12">
          <h3 className="font-display text-2xl font-bold text-creme text-center mb-8">Cocktails Créations</h3>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5"
          >
            {cocktails.map(c => {
              const t = TEASER[c.id]
              return (
                <motion.div
                  key={c.id}
                  variants={itemAnim}
                  className={`group relative rounded-2xl overflow-hidden border transition-all hover:scale-[1.02] hover:shadow-2xl ${t?.signature ? 'border-or/40 shadow-or/10' : 'border-white/5 hover:border-braise/20'}`}
                >
                  {/* Image */}
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={t?.img ?? c.fallbackImg ?? c.img}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-600"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${t?.signature ? 'from-noir via-noir/30 to-transparent' : 'from-noir via-noir/20 to-transparent'}`} />
                    {t?.signature && (
                      <span className="absolute top-3 right-3 bg-or text-noir text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                        ★ Signature
                      </span>
                    )}
                  </div>
                  {/* Content */}
                  <div className={`p-5 ${t?.signature ? 'bg-gradient-to-b from-or/5 to-noir/80' : 'bg-noir/80'}`}>
                    <h4 className="font-bold text-creme mb-2 text-lg">{c.name}{t?.signature ? ' ★' : ''}</h4>
                    <p className="text-xs text-white/40 mb-4 leading-relaxed">{c.desc || t?.desc}</p>
                    <span className="text-ambre font-bold text-xl">{c.price.toFixed(2)} €</span>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>

        <div className="text-center">
          <Link
            href="/bar"
            className="border border-or/30 hover:border-or/60 hover:bg-or/5 text-or/80 hover:text-or px-8 py-3 rounded-full font-semibold transition-all inline-flex items-center gap-2"
          >
            Voir la carte complète →
          </Link>
        </div>
      </div>
    </section>
  )
}
