'use client'
import { useEffect, useState } from 'react'

// Remise fidélité du client connecté (0 si non connecté / pas de remise).
export function useClientDiscount(): number {
  const [discount, setDiscount] = useState(0)
  useEffect(() => {
    let alive = true
    fetch('/api/clients/me')
      .then(r => (r.ok ? r.json() : null))
      .then(d => { if (alive && d?.discount > 0) setDiscount(d.discount) })
      .catch(() => {})
    return () => { alive = false }
  }, [])
  return discount
}
