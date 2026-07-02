'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'

const ESPACES = [
  {
    logo: '/logos/infini-events.jpg',
    logoAlt: 'Infini Events',
    image: '/images/salle-event.jpg',
    title: "L'Infini Club",
    sub: 'Soirées & Événements',
    desc: "Un espace premium pour vos soirées DJ, concerts et événements privés. La nuit caribéenne à son apogée.",
    accentClass: 'from-braise/80 via-braise/40 to-transparent',
    borderClass: 'border-braise/20 hover:border-braise/60',
    glowClass: 'group-hover:shadow-braise/20',
    tag: 'ERP type P',
    href: '/club',
    cta: 'Billetterie & Réservations →',
  },
  {
    logo: '/logos/maestro.jpg',
    logoAlt: 'Smile Bar',
    image: '/images/cocktail.jpg',
    title: 'Le Smile Bar',
    sub: 'Bar Lounge',
    desc: "Cocktails créoles signatures, rhums arrangés maison, sélection de vins. L'endroit parfait pour commencer ou finir la soirée.",
    accentClass: 'from-or/80 via-or/40 to-transparent',
    borderClass: 'border-or/20 hover:border-or/60',
    glowClass: 'group-hover:shadow-or/20',
    tag: 'Cocktails & Rhums',
    href: '/bar',
    cta: 'Voir la carte →',
  },
  {
    logo: '/logos/smile-bar.png',
    logoAlt: 'Maestro Restaurant',
    image: '/menu/braise-duo.jpg',
    title: 'Le Maestro',
    sub: 'Restaurant',
    desc: 'Cuisine franco-créole, pizzas à composer, plateaux braise, tapas. Le ticket moyen à 35-40€ pour une expérience gastronomique unique.',
    accentClass: 'from-ambre/80 via-ambre/40 to-transparent',
    borderClass: 'border-ambre/20 hover:border-ambre/60',
    glowClass: 'group-hover:shadow-ambre/20',
    tag: 'Franco-Créole',
    href: '/menu',
    cta: 'Voir le menu →',
  },
]

const STATS = [
  { value: '500+', label: 'Convives' },
  { value: '3', label: 'Espaces' },
  { value: '52', label: 'Soirées / an' },
  { value: '5★', label: 'Expérience' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
}
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export default function ConceptSection() {
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
          <p className="text-braise text-sm font-semibold tracking-widest uppercase mb-3">Le complexe</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-creme">
            Trois espaces,<br />
            <span className="text-gradient">une expérience</span>
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {ESPACES.map((e, i) => (
            <motion.div key={e.title} variants={item}>
              <Link
                href={e.href}
                className={`group relative rounded-2xl border ${e.borderClass} overflow-hidden transition-all duration-400 cursor-pointer hover:scale-[1.02] hover:shadow-2xl ${e.glowClass} flex flex-col h-full`}
              >
                {/* Image background */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={e.image}
                    alt={e.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${e.accentClass}`} />
                  {/* Tag badge */}
                  <span className="absolute top-3 left-3 text-xs font-semibold tracking-widest uppercase text-white/80 bg-noir/50 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                    {e.tag}
                  </span>
                  {/* Number */}
                  <div className="absolute top-3 right-3 font-display text-5xl font-bold text-white/10 select-none">0{i + 1}</div>
                </div>

                {/* Content */}
                <div className="p-6 bg-gradient-to-b from-charbon/95 to-charbon flex flex-col flex-1">
                  {/* Logo */}
                  <div className="h-12 mb-4 flex items-center">
                    <Image
                      src={e.logo}
                      alt={e.logoAlt}
                      width={140}
                      height={56}
                      className="h-10 w-auto object-contain"
                    />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-creme mb-1">{e.title}</h3>
                  <p className="text-sm text-braise font-medium mb-3">{e.sub}</p>
                  <p className="text-white/50 text-sm leading-relaxed flex-1">{e.desc}</p>
                  <p className="text-white/30 text-xs mt-5 group-hover:text-white/70 transition-colors inline-flex items-center gap-1">
                    {e.cta}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {STATS.map(s => (
            <div key={s.label} className="text-center py-6 rounded-xl glass-card card-glow">
              <p className="font-display text-4xl font-bold text-gradient mb-1">{s.value}</p>
              <p className="text-white/40 text-sm tracking-wide uppercase">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
