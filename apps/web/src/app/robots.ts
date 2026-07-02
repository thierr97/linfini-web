import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/mon-compte', '/connexion', '/inscription'],
    },
    sitemap: 'https://infinigp.fr/sitemap.xml',
  }
}
