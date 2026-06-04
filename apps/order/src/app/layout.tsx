import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "L'Infini — Commander",
  description: 'Commandez directement depuis votre table',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
