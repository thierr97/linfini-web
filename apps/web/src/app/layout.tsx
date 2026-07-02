import type { Metadata } from 'next'
import { Syne, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import ChatWidget from '@/components/ChatWidget'

const fontDisplay = Syne({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-display',
})

const fontBody = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://infinigp.fr'),
  title: {
    default: "L'Infini Guadeloupe — Bar · Restaurant · Événements",
    template: "%s | L'Infini Guadeloupe",
  },
  description: "L'expérience nocturne premium en Guadeloupe. Restaurant Le Maestro, Smile Bar lounge et salle événementielle au Gosier.",
  keywords: ['bar guadeloupe', 'restaurant guadeloupe', 'salle événementielle guadeloupe', 'location salle guadeloupe', 'soirée guadeloupe', 'restaurant le gosier', 'mariage guadeloupe'],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'fr_GP',
    url: 'https://infinigp.fr',
    siteName: "L'Infini Guadeloupe",
    description: "Restaurant, bar lounge et salle événementielle premium au Gosier, Guadeloupe.",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: "L'Infini Guadeloupe — salle événementielle" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "L'Infini Guadeloupe — Bar · Restaurant · Événements",
    images: ['/og-image.jpg'],
  },
  robots: { index: true, follow: true },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': ['Restaurant', 'NightClub', 'EventVenue'],
  name: "L'Infini Guadeloupe",
  url: 'https://infinigp.fr',
  image: 'https://infinigp.fr/og-image.jpg',
  telephone: '+590690272875',
  email: 'direction.infini971@gmail.com',
  servesCuisine: 'Franco-créole',
  priceRange: '€€€',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '99 Route de Montauban',
    addressLocality: 'Le Gosier',
    postalCode: '97190',
    addressCountry: 'GP',
  },
  openingHoursSpecification: [
    { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '19:00', closes: '23:00' },
  ],
  sameAs: [
    'https://www.instagram.com/infinievents.gp/',
    'https://www.facebook.com/linfini.gp',
    'https://www.tiktok.com/@infinievents.gp',
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fontDisplay.variable} ${fontBody.variable}`}>
      <body className="font-body">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <ChatWidget />
      </body>
    </html>
  )
}
