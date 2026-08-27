// Grille tarifaire location salle L'Infini (HT, TVA 8,5 % en sus) — décision août 2026 :
// le loyer est un prix d'appel, la marge se fait sur la restauration.

export interface TarifSalle {
  id: string
  label: string
  detail: string
  prix: number
  prixMax?: number
}

export const TARIFS_CRENEAUX: TarifSalle[] = [
  { id: 'journee', label: 'Location sèche journée', detail: '8h – 17h', prix: 1200 },
  { id: 'soiree', label: 'Location soirée', detail: '19h – minuit', prix: 1500 },
]

export const TARIFS_ESPACES: TarifSalle[] = [
  { id: 'exterieur', label: 'Extérieur seul', detail: 'Terrasse panoramique', prix: 1200 },
  { id: 'interieur', label: 'Intérieur seul', detail: 'Grande salle climatisée', prix: 1300 },
  { id: 'int-ext', label: 'Intérieur + extérieur', detail: 'Privatisation complète', prix: 1800 },
]

export const TARIFS_PROFILS: TarifSalle[] = [
  { id: 'entreprise', label: 'Client entreprise', detail: 'Séminaire, soirée, lancement', prix: 1500, prixMax: 1800 },
  { id: 'organisateur', label: 'Organisateur d\'événements', detail: 'Soirée ouverte au public, billetterie', prix: 2500 },
]

export const TARIFS_SALLE: TarifSalle[] = [...TARIFS_CRENEAUX, ...TARIFS_ESPACES, ...TARIFS_PROFILS]

export const MOBILIER_INCLUS_PERSONNES = 60

export const INCLUS_SALLE = [
  'Climatisation',
  'Sonorisation',
  'Paperboard',
  'Espace DJ',
  `Tables et chaises pour ${MOBILIER_INCLUS_PERSONNES} personnes`,
]

// Version phrase : « climatisation, sonorisation, paperboard, espace DJ, … »
export const INCLUS_SALLE_TEXTE = INCLUS_SALLE.map(i => i.charAt(0).toLowerCase() + i.slice(1)).join(', ')

export const NOTE_MOBILIER = `Au-delà de ${MOBILIER_INCLUS_PERSONNES} personnes, le mobilier complémentaire est facturé en supplément.`

export function fmtPrix(t: TarifSalle): string {
  const f = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return t.prixMax ? `${f(t.prix)} à ${f(t.prixMax)} €` : `${f(t.prix)} €`
}

// Formule salle déduite du type d'événement (formulaire ou chatbot, texte libre)
export function formuleSalle(typeEvenement: string): TarifSalle & { prixRetenu: number } {
  const t = (typeEvenement || '').toLowerCase()
  const has = (...k: string[]) => k.some(x => t.includes(x))
  const pick = (id: string, prixRetenu?: number) => {
    const f = TARIFS_SALLE.find(x => x.id === id)!
    return { ...f, prixRetenu: prixRetenu ?? f.prix }
  }

  if (has('organisateur', 'promoteur', 'concert', 'spectacle', 'billetterie')) return pick('organisateur')
  if (has('séminaire', 'seminaire', 'conférence', 'conference', 'formation', 'réunion')) return pick('entreprise', 1500)
  if (has('entreprise', 'corporate', 'lancement', 'showroom')) return pick('entreprise', 1800)
  if (has('mariage', 'gala', 'cocktail')) return pick('int-ext')
  if (has('baptême', 'bapteme', 'communion', 'baby', 'brunch', 'journée', 'journee')) return pick('journee')
  return pick('soiree')
}

// Texte de la grille pour le prompt du chatbot
export function grilleTarifaireTexte(): string {
  const bloc = (titre: string, list: TarifSalle[]) =>
    `${titre} :\n${list.map(t => `- ${t.label} (${t.detail}) : ${fmtPrix(t)}`).join('\n')}`
  return [
    bloc('Location salle — créneaux', TARIFS_CRENEAUX),
    bloc('Location salle — espaces', TARIFS_ESPACES),
    bloc('Location salle — profils', TARIFS_PROFILS),
    `Inclus dans le tarif de base : ${INCLUS_SALLE_TEXTE}.`,
    NOTE_MOBILIER,
  ].join('\n')
}
