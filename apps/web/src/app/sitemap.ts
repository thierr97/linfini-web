import type { MetadataRoute } from 'next'

const BASE = 'https://infinigp.fr'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: '', priority: 1, changeFrequency: 'weekly' as const },
    { path: '/menu', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/evenements', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/bar', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/club', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/tarifs', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/galerie', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/mentions-legales', priority: 0.1, changeFrequency: 'yearly' as const },
    { path: '/politique-confidentialite', priority: 0.1, changeFrequency: 'yearly' as const },
  ]

  return routes.map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))
}
