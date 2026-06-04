'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'

const PHOTOS = [
  { src: '/galerie/g1.jpg', span: 'col-span-2 row-span-2' },
  { src: '/galerie/g2.jpg', span: 'col-span-1 row-span-1' },
  { src: '/galerie/g3.jpg', span: 'col-span-1 row-span-1' },
  { src: '/galerie/g4.jpg', span: 'col-span-1 row-span-1' },
  { src: '/galerie/g5.jpg', span: 'col-span-1 row-span-1' },
  { src: '/galerie/g6.jpg', span: 'col-span-2 row-span-1' },
]

export default function GaleriePreview() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-4"
        >
          <div>
            <p className="text-braise text-sm font-semibold tracking-widest uppercase mb-3">Ambiance</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-creme">
              L&apos;Infini en <span className="text-gradient">images</span>
            </h2>
          </div>
          <Link
            href="/galerie"
            className="border border-white/20 hover:border-braise/50 text-white/60 hover:text-white px-6 py-3 rounded-full text-sm font-semibold transition-all flex-none"
          >
            Voir la galerie complète →
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-4 grid-rows-3 gap-3 h-[480px] md:h-[560px]"
        >
          {PHOTOS.map((p, i) => (
            <div
              key={p.src}
              className={`${p.span} relative overflow-hidden rounded-xl bg-charbon group cursor-pointer`}
            >
              <img
                src={p.src}
                alt={`L'Infini photo ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-noir/30 group-hover:bg-noir/10 transition-all duration-300" />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
