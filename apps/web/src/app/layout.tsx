import type { Metadata } from 'next'
import { Syne, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

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
  title: {
    default: "L'Infini Guadeloupe — Bar · Restaurant · Club",
    template: "%s | L'Infini Guadeloupe",
  },
  description: "L'expérience nocturne premium en Guadeloupe. Cocktails créoles, pizzas à composer, plateaux braise, soirées DJ au cœur du District, Baie-Mahault.",
  keywords: ['bar guadeloupe', 'restaurant guadeloupe', 'nightclub guadeloupe', 'pizza guadeloupe', 'soirée guadeloupe'],
  openGraph: {
    type: 'website',
    locale: 'fr_GP',
    siteName: "L'Infini Guadeloupe",
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fontDisplay.variable} ${fontBody.variable}`}>
      <body className="font-body">{children}</body>
    </html>
  )
}
