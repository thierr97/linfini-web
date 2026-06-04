import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'Galerie',
  description: 'Photos et vidéos des soirées et événements de L\'Infini Guadeloupe.',
}

// Photos téléchargées depuis @infinievents.gp
const PHOTOS = [
  { id: 1,  src: '/galerie/g1.jpg',  label: 'Pyjama Party' },
  { id: 2,  src: '/galerie/g2.jpg',  label: 'Soirée Lousse' },
  { id: 3,  src: '/galerie/g3.jpg',  label: 'Le Deckollage' },
  { id: 4,  src: '/galerie/g4.jpg',  label: 'Soirée Mousse' },
  { id: 5,  src: '/galerie/g5.jpg',  label: 'DJ Set Terrasse' },
  { id: 6,  src: '/galerie/g6.jpg',  label: 'La Nocturna — Smile Bar' },
  { id: 7,  src: '/galerie/g8.jpg',  label: 'Paradise — St Valentin' },
  { id: 8,  src: '/galerie/g9.jpg',  label: 'KaraomiX — Smile Bar' },
  { id: 9,  src: '/galerie/g10.jpg', label: 'Carte Tapas & Burgers' },
  { id: 10, src: '/galerie/g11.jpg', label: 'Soirée Mousse — Golden Circle' },
]

export default function GaleriePage() {
  return (
    <div className="min-h-screen bg-noir">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 text-center">
        <p className="text-braise text-sm font-semibold tracking-widest uppercase mb-3">Nos soirées</p>
        <h1 className="font-display text-5xl md:text-7xl font-bold text-creme mb-4">
          <span className="text-gradient">Galerie</span>
        </h1>
        <p className="text-white/40 max-w-lg mx-auto">
          Revivez les meilleurs moments de L&apos;Infini.
        </p>
      </section>

      {/* Grid masonry */}
      <div className="max-w-6xl mx-auto px-4 pb-24">
        <div className="columns-1 sm:columns-2 md:columns-3 gap-4 space-y-4">
          {PHOTOS.map(photo => (
            <a
              key={photo.id}
              href="https://www.instagram.com/infinievents.gp/"
              target="_blank"
              rel="noopener noreferrer"
              className="block break-inside-avoid rounded-xl overflow-hidden border border-white/5 hover:border-braise/30 transition-all group cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.label}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </a>
          ))}
        </div>

        {/* CTA Instagram */}
        <div className="mt-16 text-center">
          <p className="text-white/40 mb-4">Plus de photos et vidéos sur Instagram</p>
          <a
            href="https://www.instagram.com/infinievents.gp/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition-opacity"
          >
            <span>📸</span>
            <span>@infinievents.gp</span>
          </a>
        </div>
      </div>

      <Footer />
    </div>
  )
}
