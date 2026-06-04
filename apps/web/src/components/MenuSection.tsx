import Image from 'next/image'
import Link from 'next/link'

// Photos Unsplash réalistes par catégorie (libres de droit, format 4:3)
const FALLBACK_PHOTOS: Record<string, string> = {
  pizza: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80&fit=crop&crop=center',
  salade: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80&fit=crop',
  tapas: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80&fit=crop',
  braise: 'https://images.unsplash.com/photo-1558030006-450675393462?w=600&q=80&fit=crop',
  bar: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&q=80&fit=crop',
  default: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80&fit=crop',
}

function getPhoto(item: Item): string {
  if (item.imageUrl) return item.imageUrl
  const cat = item.category.name.toLowerCase()
  if (cat.includes('pizza')) return FALLBACK_PHOTOS.pizza
  if (cat.includes('salade')) return FALLBACK_PHOTOS.salade
  if (cat.includes('tapas') || cat.includes('entrée')) return FALLBACK_PHOTOS.tapas
  if (cat.includes('braise') || cat.includes('viande') || cat.includes('plat')) return FALLBACK_PHOTOS.braise
  if (cat.includes('bar') || cat.includes('cocktail') || cat.includes('boisson')) return FALLBACK_PHOTOS.bar
  return FALLBACK_PHOTOS.default
}

interface Item {
  id: string
  name: string
  description: string | null
  basePrice: number
  imageUrl: string | null
  category: { name: string }
}

export default function MenuSection({ items }: { items: Item[] }) {
  if (items.length === 0) return null
  return (
    <section id="menu" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-braise text-sm font-semibold tracking-widest uppercase mb-3">Le Maestro</p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-creme">
            Créations <span className="text-gradient">du chef</span>
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map(item => (
            <div key={item.id} className="group bg-charbon rounded-2xl overflow-hidden border border-white/5 hover:border-braise/30 transition-all hover:scale-[1.02] duration-300">
              <div className="aspect-video relative overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getPhoto(item)}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charbon/80 to-transparent" />
              </div>
              <div className="p-4">
                <p className="text-xs text-braise uppercase tracking-wider mb-1">{item.category.name}</p>
                <h3 className="font-display font-bold text-creme mb-1">{item.name}</h3>
                {item.description && <p className="text-white/40 text-sm line-clamp-2">{item.description}</p>}
                <p className="text-ambre font-bold mt-3 text-lg">{item.basePrice.toFixed(2)} €</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/menu" className="border border-white/20 hover:border-braise/60 text-white/70 hover:text-white px-8 py-3 rounded-full font-semibold transition-all inline-flex items-center gap-2">
            Voir tout le menu →
          </Link>
        </div>
      </div>
    </section>
  )
}
