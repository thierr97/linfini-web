import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Caisse — L'Infini",
  description: "Système de caisse L'Infini",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-gray-950 text-white h-screen overflow-hidden">
        {children}
      </body>
    </html>
  )
}
