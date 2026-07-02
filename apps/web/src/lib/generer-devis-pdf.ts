/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit') as any

// Formatage sans espace insécable (toLocaleString fr-FR → pdfkit affiche '/')
function fmt(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

// Tarifs salle HT
const TARIFS_SEMAINE: Record<string, number> = {
  'Demi-Journée (4h)': 800,
  'Journée (8h)': 1500,
  'Soirée Int./Ext. (6h)': 4500,
  'Soirée Événementiel (6h)': 5500,
  'Week-end complet': 3500,
}
const TARIFS_WEEKEND: Record<string, number> = {
  'Demi-Journée (4h)': 1200,
  'Journée (8h)': 2200,
  'Soirée Int./Ext. (6h)': 4500,
  'Soirée Événementiel (6h)': 5500,
  'Week-end complet': 5000,
}

// Type événement → package salle par défaut
const EVENT_PACKAGE: Record<string, string> = {
  'Mariage': 'Soirée Événementiel (6h)',
  'Anniversaire': 'Soirée Int./Ext. (6h)',
  "Soirée d'entreprise": 'Soirée Événementiel (6h)',
  'Concert / Spectacle': 'Soirée Événementiel (6h)',
  'Conférence / Séminaire': 'Journée (8h)',
  'Cocktail': 'Demi-Journée (4h)',
  'Événement privé': 'Soirée Int./Ext. (6h)',
  'Autre': 'Soirée Int./Ext. (6h)',
}

// Services avec prix fixes HT
const SERVICES_LABELS: Record<string, string> = {
  salle: 'Location salle',
  restauration: 'Restauration (buffet / menu)',
  bar: 'Bar & Cocktails',
  dj: 'DJ professionnel (4h)',
  decoration: 'Décoration thématique',
  securite: 'Agent de sécurité',
}
const SERVICES_PRIX: Record<string, number | null> = {
  salle: null, // calculé séparément
  restauration: null,
  bar: null,
  dj: 400,
  decoration: null,
  securite: null,
}

export interface DevisData {
  nom: string
  email: string
  telephone: string
  type_evenement: string
  date: string
  nb_invites: string
  services: string[]
  budget: string
  message: string
  numero_devis?: string
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'À définir'
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

function isWeekend(dateStr: string): boolean {
  if (!dateStr) return false
  const d = new Date(dateStr)
  const day = d.getDay()
  return day === 0 || day === 5 || day === 6 // vendredi, samedi, dimanche
}

function getPrixSalle(typeEvenement: string, dateStr: string): { package: string; prix: number } {
  const pkg = EVENT_PACKAGE[typeEvenement] || 'Soirée Int./Ext. (6h)'
  const tarifs = isWeekend(dateStr) ? TARIFS_WEEKEND : TARIFS_SEMAINE
  const prix = tarifs[pkg] || 4500
  return { package: pkg, prix }
}

export async function genererDevisPDF(data: DevisData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks: Buffer[] = []

    doc.on('data', (chunk: Buffer) => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const OR = '#C8A45A'
    const NOIR = '#1A1A1A'
    const GRIS = '#666666'
    const VERT = '#2D6A4F'
    const num = data.numero_devis || `DEV-${Date.now()}`

    const { package: pkgSalle, prix: prixSalle } = getPrixSalle(data.type_evenement, data.date)
    const periodeLabel = isWeekend(data.date) ? 'Week-end / Férié' : 'Semaine (Lun-Jeu)'

    // ─── EN-TÊTE ─────────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, 120).fill(NOIR)
    doc.fontSize(28).font('Helvetica-Bold').fillColor(OR).text("L'INFINI", 50, 30)
    doc.fontSize(10).font('Helvetica').fillColor('#CCCCCC')
       .text('Guadeloupe — Bar · Restaurant · Lieu événementiel', 50, 65)
       .text('99 Route de Montauban, Le Gosier 97190', 50, 80)
       .text('direction.infini971@gmail.com · infinigp.fr', 50, 95)
    doc.fontSize(10).font('Helvetica').fillColor('#AAAAAA')
       .text(`N° ${num}`, 400, 30, { align: 'right', width: 150 })
       .text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 400, 45, { align: 'right', width: 150 })
       .text(`Valide 30 jours`, 400, 60, { align: 'right', width: 150 })

    // ─── TITRE ───────────────────────────────────────────────────────────────
    doc.moveDown(4)
    doc.fontSize(20).font('Helvetica-Bold').fillColor(NOIR).text('DEVIS ESTIMATIF', { align: 'center' })
    doc.fontSize(12).font('Helvetica').fillColor(GRIS).text(data.type_evenement, { align: 'center' })
    doc.moveDown(0.5)
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor(OR).lineWidth(1.5).stroke()
    doc.moveDown(1)

    // ─── INFORMATIONS CLIENT ─────────────────────────────────────────────────
    doc.fontSize(11).font('Helvetica-Bold').fillColor(NOIR).text('INFORMATIONS CLIENT')
    doc.moveDown(0.4)

    const infos: [string, string][] = [
      ['Nom', data.nom],
      ['Email', data.email],
      ['Téléphone', data.telephone],
      ["Type d'événement", data.type_evenement],
      ['Date souhaitée', formatDate(data.date)],
      ['Période tarifaire', periodeLabel],
      ["Nombre d'invités", `${data.nb_invites} personnes`],
    ]

    infos.forEach(([label, val]) => {
      const y = doc.y
      doc.fontSize(10).font('Helvetica').fillColor(GRIS).text(`${label} :`, 50, y, { width: 160 })
      doc.fontSize(10).font('Helvetica-Bold').fillColor(NOIR).text(val, 215, y)
      doc.moveDown(0.4)
    })

    doc.moveDown(0.5)
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor('#DDDDDD').lineWidth(0.5).stroke()
    doc.moveDown(1)

    // ─── PRESTATIONS ─────────────────────────────────────────────────────────
    doc.fontSize(11).font('Helvetica-Bold').fillColor(NOIR).text('DÉTAIL DES PRESTATIONS')
    doc.moveDown(0.5)

    // En-tête tableau
    const colX = [50, 280, 420]
    const hY = doc.y
    doc.rect(50, hY, doc.page.width - 100, 22).fill('#F0F0F0')
    doc.fontSize(9).font('Helvetica-Bold').fillColor(NOIR)
       .text('Prestation', colX[0] + 5, hY + 6)
       .text('Détail', colX[1], hY + 6)
       .text('Prix HT', colX[2], hY + 6)
    doc.moveDown(1.8)

    let totalHT = 0

    // Ligne location salle
    const r1Y = doc.y
    doc.fontSize(9).font('Helvetica-Bold').fillColor(NOIR).text('Location salle — L\'Infini', colX[0] + 5, r1Y)
    doc.font('Helvetica').fillColor(GRIS).text(pkgSalle, colX[1], r1Y, { width: 135 })
    doc.font('Helvetica-Bold').fillColor(VERT).text(`${fmt(prixSalle)} €`, colX[2], r1Y)
    totalHT += prixSalle
    doc.font('Helvetica').fillColor(NOIR).moveDown(1)

    // Autres services
    const services = (data.services || []).filter(s => s !== 'salle')
    services.forEach(s => {
      const label = SERVICES_LABELS[s] || s
      const prix = SERVICES_PRIX[s]
      const rY = doc.y
      doc.fontSize(9).font('Helvetica').fillColor(NOIR).text(label, colX[0] + 5, rY)
      if (prix !== null) {
        doc.text('Forfait inclus', colX[1], rY)
        doc.font('Helvetica-Bold').fillColor(VERT).text(`${fmt(prix)} €`, colX[2], rY)
        totalHT += prix
      } else {
        doc.text('Sur devis selon volume', colX[1], rY)
        doc.font('Helvetica-Bold').fillColor(OR).text('Sur devis', colX[2], rY)
      }
      doc.font('Helvetica').fillColor(NOIR).moveDown(0.9)
    })

    // Ligne de séparation
    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor('#DDDDDD').lineWidth(0.5).stroke()
    doc.moveDown(0.5)

    // ─── TOTAUX ──────────────────────────────────────────────────────────────
    const tva = totalHT * 0.085
    const ttc = totalHT + tva
    const acompte = Math.round(ttc * 0.30)

    const ROW = 18
    const labelW = colX[2] - colX[0] - 15

    // Total HT
    let ry = doc.y
    doc.fontSize(9).font('Helvetica').fillColor(GRIS)
       .text('Total HT (prestations fixes)', colX[0] + 5, ry, { width: labelW, lineBreak: false })
    doc.fontSize(9).font('Helvetica-Bold').fillColor(GRIS)
       .text(`${fmt(totalHT)} €`, colX[2], ry, { width: 100, lineBreak: false })

    // TVA
    ry += ROW
    doc.fontSize(9).font('Helvetica').fillColor(GRIS)
       .text('TVA (8,5 %)', colX[0] + 5, ry, { width: labelW, lineBreak: false })
    doc.fontSize(9).font('Helvetica-Bold').fillColor(GRIS)
       .text(`${fmt(tva)} €`, colX[2], ry, { width: 100, lineBreak: false })

    // Total TTC — fond coloré
    ry += ROW + 4
    doc.rect(50, ry - 3, doc.page.width - 100, 24).fill('#1A1A1A')
    doc.fontSize(12).font('Helvetica-Bold').fillColor(OR)
       .text('TOTAL TTC ESTIMATIF', colX[0] + 5, ry + 3, { width: labelW, lineBreak: false })
    doc.fontSize(13).font('Helvetica-Bold').fillColor(OR)
       .text(`${fmt(ttc)} €`, colX[2], ry + 3, { width: 100, lineBreak: false })

    // Acompte
    ry += 30
    doc.rect(50, ry, doc.page.width - 100, 24).fill('#FFF3CD')
    doc.fontSize(9).font('Helvetica').fillColor('#7A5500')
       .text('Acompte 30% à la réservation :', colX[0] + 5, ry + 7, { width: labelW, lineBreak: false })
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#7A5500')
       .text(`${fmt(acompte)} € TTC`, colX[2], ry + 7, { width: 100, lineBreak: false })

    doc.moveDown(6)

    // Note sur devis + majoration
    doc.fontSize(8).font('Helvetica').fillColor(GRIS)
       .text('* Les prestations "Sur devis" (restauration, bar, décoration, sécurité) seront chiffrées selon le volume et vos besoins précis.', 50, doc.y, { width: doc.page.width - 100 })
    doc.moveDown(0.5)
    doc.fontSize(8).font('Helvetica-Bold').fillColor('#8B0000')
       .text('⚠  Majoration automatique de 20 % si le nombre d\'invités réel dépasse le volume indiqué dans ce devis.', 50, doc.y, { width: doc.page.width - 100 })
    doc.moveDown(1)

    doc.moveTo(50, doc.y).lineTo(doc.page.width - 50, doc.y).strokeColor(OR).lineWidth(1).stroke()
    doc.moveDown(1)

    // ─── MESSAGE CLIENT ───────────────────────────────────────────────────────
    if (data.message) {
      doc.fontSize(10).font('Helvetica-Bold').fillColor(NOIR).text('PRÉCISIONS DU CLIENT')
      doc.moveDown(0.3)
      doc.fontSize(9).font('Helvetica').fillColor(GRIS).text(data.message, { width: doc.page.width - 100 })
      doc.moveDown(1)
    }

    // ─── CONDITIONS ──────────────────────────────────────────────────────────
    const cBoxY = doc.y
    doc.rect(50, cBoxY, doc.page.width - 100, 120).fillAndStroke('#FAFAFA', '#EEEEEE')
    doc.fontSize(9).font('Helvetica-Bold').fillColor(NOIR).text('CONDITIONS GÉNÉRALES', 65, cBoxY + 10)
    const conds = [
      '• Tarifs HT — TVA 8,5% en sus (régime fiscal Guadeloupe)',
      '• Acompte de 30% à la signature du contrat de location',
      "• Annulation possible sans frais jusqu'à 30 jours avant l'événement",
      '• Assurance responsabilité civile obligatoire pour l\'organisateur',
      '• Devis valable 30 jours — tarifs susceptibles d\'évoluer',
      '• MAJORATION : Tout dépassement du nombre d\'invités indiqué entraîne une majoration automatique de 20%.',
      '• PERSONNEL : Le personnel est obligatoirement fourni par L\'Infini. Personnel extérieur',
      '  accepté sur présentation de DPAE, contrat, pièce d\'identité et carte vitale.',
    ]
    doc.fontSize(8).font('Helvetica').fillColor(GRIS)
    conds.forEach((c, i) => {
      const isPersonnel = c.startsWith('• PERSONNEL')
      doc.fillColor(isPersonnel ? '#8B0000' : GRIS).font(isPersonnel ? 'Helvetica-Bold' : 'Helvetica')
      doc.text(c, 65, cBoxY + 26 + i * 10)
    })
    doc.moveDown(9)

    // ─── PIED DE PAGE ────────────────────────────────────────────────────────
    const footY = doc.page.height - 55
    doc.rect(0, footY, doc.page.width, 55).fill(NOIR)
    doc.fontSize(8).font('Helvetica').fillColor('#AAAAAA')
       .text("L'Infini · SAS LES 4 AS · 99 Route de Montauban, Le Gosier 97190 Guadeloupe", 50, footY + 12, { align: 'center', width: doc.page.width - 100 })
       .text('direction.infini971@gmail.com · +590 690 27 28 75 · infinigp.fr', 50, footY + 27, { align: 'center', width: doc.page.width - 100 })
       .text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, 50, footY + 40, { align: 'center', width: doc.page.width - 100 })

    doc.end()
  })
}
