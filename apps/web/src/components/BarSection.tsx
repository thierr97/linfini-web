'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

const APERITIFS = [
  { name: 'Ti Punch Blanc', fruits: 'Rhum blanc agricole', price: 5, img: '/menu/rhum.jpg' },
  { name: 'Ti Punch Vieux', fruits: 'Rhum vieux', price: 7, img: '/menu/rhum.jpg' },
  { name: 'Martini Blanc / Rouge', fruits: 'Verre 10cl', price: 9, img: '/menu/wine.jpg' },
  { name: 'Get 27 / 31', fruits: 'Liqueur de menthe', price: 9, img: '/menu/glass-spirits.jpg' },
  { name: 'Amaretto', fruits: 'Disaronno', price: 9, img: '/menu/amaretto.jpg' },
  { name: "Bailey's", fruits: "Liqueur d'Irish Cream", price: 9, img: '/menu/baileys.jpg' },
]

const COCKTAILS = [
  {
    name: 'Le Smile ★',
    desc: 'Hennessy, crème de framboise, citron, coulis de framboise, vanille, miel',
    price: 15,
    img: '/menu/cocktail-creation.jpg',
    signature: true,
  },
  {
    name: "Maya L'abeille",
    desc: 'Rhum vieux, Amaretto, vanille, ananas, passion, cannelle, miel',
    price: 14,
    img: '/menu/mai-tai.jpg',
    signature: false,
  },
  {
    name: 'Balthazar ★',
    desc: 'Hennessy, rhum vieux, bois bandé, gingembre, vanille, citron + secret',
    price: 15,
    img: '/menu/cognac.jpg',
    signature: true,
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}
const itemAnim = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function BarSection() {
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
          {APERITIFS.map(r => (
            <motion.div key={r.name} variants={itemAnim} className="group relative rounded-xl overflow-hidden border border-white/5 hover:border-or/30 transition-all bg-noir/50">
              <div className="relative h-28 overflow-hidden">
                <img
                  src={r.img}
                  alt={r.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-70 group-hover:opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-noir via-noir/40 to-transparent" />
              </div>
              <div className="p-4">
                <p className="font-display font-bold text-creme mb-1 text-sm">{r.name}</p>
                <p className="text-xs text-white/40 mb-3 leading-relaxed">{r.fruits}</p>
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
            {COCKTAILS.map(c => (
              <motion.div
                key={c.name}
                variants={itemAnim}
                className={`group relative rounded-2xl overflow-hidden border transition-all hover:scale-[1.02] hover:shadow-2xl ${c.signature ? 'border-or/40 shadow-or/10' : 'border-white/5 hover:border-braise/20'}`}
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={c.img}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-600"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${c.signature ? 'from-noir via-noir/30 to-transparent' : 'from-noir via-noir/20 to-transparent'}`} />
                  {c.signature && (
                    <span className="absolute top-3 right-3 bg-or text-noir text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                      ★ Signature
                    </span>
                  )}
                </div>
                {/* Content */}
                <div className={`p-5 ${c.signature ? 'bg-gradient-to-b from-or/5 to-noir/80' : 'bg-noir/80'}`}>
                  <h4 className="font-bold text-creme mb-2 text-lg">{c.name}</h4>
                  <p className="text-xs text-white/40 mb-4 leading-relaxed">{c.desc}</p>
                  <span className="text-ambre font-bold text-xl">{c.price.toFixed(2)} €</span>
                </div>
              </motion.div>
            ))}
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
