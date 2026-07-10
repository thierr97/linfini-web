// Offre de lancement : remise fidélité automatique pour les 500 premiers
// comptes clients (formulaire d'inscription ET connexions sociales).
// La remise s'applique ensuite d'elle-même sur les commandes en ligne
// (relue en base côté serveur dans /api/order).

export const LAUNCH_OFFER_LIMIT = 500
export const LAUNCH_OFFER_DISCOUNT = 10
export const LAUNCH_OFFER_NOTE = 'Offre de lancement — 500 premiers inscrits (remise auto 10%)'

/** Remise à appliquer au nouveau compte, ou null si l'offre est épuisée. */
export async function launchOffer(prisma: {
  client: { count(): Promise<number> }
}): Promise<{ discount: number; notes: string } | null> {
  const count = await prisma.client.count()
  if (count >= LAUNCH_OFFER_LIMIT) return null
  return { discount: LAUNCH_OFFER_DISCOUNT, notes: LAUNCH_OFFER_NOTE }
}
