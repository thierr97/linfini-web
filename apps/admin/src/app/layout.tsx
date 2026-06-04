import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = { title: "L'Infini — Admin" }
export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="fr"><body>{children}</body></html>
}
