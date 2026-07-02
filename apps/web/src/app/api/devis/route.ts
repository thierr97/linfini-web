import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { genererDevisPDF } from '@/lib/generer-devis-pdf'

function numeroDevis(): string {
  const d = new Date()
  return `DEV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}-${String(d.getTime()).slice(-4)}`
}

function formatDate(dateStr: string): string {
  if (!dateStr) return 'À définir'
  const d = new Date(dateStr)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ─── ODOO SYNC ────────────────────────────────────────────────────────────────
async function syncOdoo(data: {
  nom: string; email: string; telephone: string
  type_evenement: string; date: string; nb_invites: string
  services: string[]; budget: string; message: string; numero_devis: string
}) {
  const ODOO_URL = process.env.ODOO_URL || 'https://sas-les-4-as1.odoo.com'
  const ODOO_DB = process.env.ODOO_DB || 'sas-les-4-as1'
  const ODOO_USER = process.env.ODOO_USER
  const ODOO_KEY = process.env.ODOO_API_KEY

  if (!ODOO_USER || !ODOO_KEY) {
    console.warn('Odoo credentials manquants — sync ignorée')
    return null
  }

  // 1. Authentification
  const authRes = await fetch(`${ODOO_URL}/web/session/authenticate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', method: 'call', id: 1,
      params: { db: ODOO_DB, login: ODOO_USER, password: ODOO_KEY },
    }),
  })
  const authData = await authRes.json()
  const uid = authData?.result?.uid
  if (!uid) {
    console.error('Odoo auth échouée:', JSON.stringify(authData?.error))
    return null
  }
  const cookies = authRes.headers.get('set-cookie') || ''

  async function rpc(model: string, method: string, args: unknown[], kwargs: Record<string, unknown> = {}) {
    const res = await fetch(`${ODOO_URL}/web/dataset/call_kw`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookies },
      body: JSON.stringify({
        jsonrpc: '2.0', method: 'call', id: Math.random(),
        params: { model, method, args, kwargs },
      }),
    })
    const json = await res.json()
    if (json.error) throw new Error(JSON.stringify(json.error))
    return json.result
  }

  // 2. Trouver ou créer le client
  const existingPartners = await rpc('res.partner', 'search', [[['email', '=', data.email]]])
  let partnerId: number
  if (existingPartners.length > 0) {
    partnerId = existingPartners[0]
    await rpc('res.partner', 'write', [[partnerId], { phone: data.telephone, name: data.nom }])
  } else {
    partnerId = await rpc('res.partner', 'create', [{
      name: data.nom,
      email: data.email,
      phone: data.telephone,
      customer_rank: 1,
    }])
  }

  // 3. Créer le devis (sale.order)
  const note = [
    `Événement : ${data.type_evenement}`,
    `Date : ${formatDate(data.date)}`,
    `Invités : ${data.nb_invites} personnes`,
    `Services : ${data.services.join(', ')}`,
    `Budget estimé : ${data.budget}`,
    data.message ? `Message : ${data.message}` : '',
  ].filter(Boolean).join('\n')

  const orderId = await rpc('sale.order', 'create', [{
    partner_id: partnerId,
    name: data.numero_devis,
    client_order_ref: data.numero_devis,
    note,
    state: 'draft',
  }])

  // 4. Ajouter les lignes de devis
  const lignes = [
    { name: `Location salle — ${data.type_evenement}`, price_unit: 0, product_uom_qty: 1 },
    ...data.services.filter(s => s !== 'salle').map(s => ({
      name: s === 'dj' ? 'DJ professionnel (4h)' : s.charAt(0).toUpperCase() + s.slice(1),
      price_unit: s === 'dj' ? 400 : 0,
      product_uom_qty: 1,
    })),
  ]

  for (const ligne of lignes) {
    await rpc('sale.order.line', 'create', [{
      order_id: orderId,
      name: ligne.name,
      price_unit: ligne.price_unit,
      product_uom_qty: ligne.product_uom_qty,
    }])
  }

  console.log(`Odoo: devis ${data.numero_devis} créé (order #${orderId}, partner #${partnerId})`)
  return orderId
}

// ─── POST HANDLER ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { nom, email, telephone, type_evenement, date, nb_invites, services, budget, message } = body

  const num = numeroDevis()

  // 1. Générer le PDF
  let pdfBuffer: Buffer | null = null
  try {
    pdfBuffer = await genererDevisPDF({
      nom, email, telephone, type_evenement,
      date: date || '', nb_invites: nb_invites || '',
      services: services || [], budget: budget || '',
      message: message || '', numero_devis: num,
    })
  } catch (err) {
    console.error('PDF erreur:', err)
  }

  // 2. Sync Odoo (en parallèle, non bloquant)
  syncOdoo({ nom, email, telephone, type_evenement, date: date || '', nb_invites: nb_invites || '', services: services || [], budget: budget || '', message: message || '', numero_devis: num })
    .catch(err => console.error('Odoo sync erreur:', err))

  // 3. Envoi emails
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: 'direction.infini971@gmail.com',
      pass: process.env.GMAIL_DEVIS_PASSWORD,
    },
  })

  const attachments = pdfBuffer ? [{
    filename: `Devis-${num}-LInfini.pdf`,
    content: pdfBuffer,
    contentType: 'application/pdf',
  }] : []

  const htmlAdmin = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#1a1a1a;color:#fff;padding:32px;border-radius:12px">
      <h2 style="color:#c8a45a;margin-top:0">🎉 Nouveau devis — ${num}</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#999;width:40%">Nom</td><td style="padding:6px 0;font-weight:bold">${nom}</td></tr>
        <tr><td style="padding:6px 0;color:#999">Email</td><td><a href="mailto:${email}" style="color:#c8a45a">${email}</a></td></tr>
        <tr><td style="padding:6px 0;color:#999">Téléphone</td><td style="padding:6px 0">${telephone}</td></tr>
        <tr><td style="padding:6px 0;color:#999">Événement</td><td style="padding:6px 0;color:#e07b39;font-weight:bold">${type_evenement}</td></tr>
        <tr><td style="padding:6px 0;color:#999">Date</td><td style="padding:6px 0">${formatDate(date)}</td></tr>
        <tr><td style="padding:6px 0;color:#999">Invités</td><td style="padding:6px 0">${nb_invites} personnes</td></tr>
        <tr><td style="padding:6px 0;color:#999">Services</td><td style="padding:6px 0">${(services || []).join(', ') || 'Non précisé'}</td></tr>
        <tr><td style="padding:6px 0;color:#999">Budget</td><td style="padding:6px 0">${budget || 'Non précisé'}</td></tr>
      </table>
      ${message ? `<div style="margin-top:16px;padding:16px;background:#111;border-radius:8px;border-left:3px solid #c8a45a"><p style="color:#999;margin:0 0 8px">Message :</p><p style="margin:0">${message}</p></div>` : ''}
      <p style="color:#666;font-size:12px;margin-top:24px">Devis PDF en pièce jointe · Synchronisé sur Odoo · infinigp.fr</p>
    </div>`

  const htmlClient = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#1a1a1a;color:#fff;padding:32px;border-radius:12px">
      <h2 style="color:#c8a45a;margin-top:0">Bonjour ${nom},</h2>
      <p style="color:#ccc;line-height:1.6">Nous avons bien reçu votre demande de devis pour votre <strong style="color:#fff">${type_evenement}</strong> prévu le <strong style="color:#fff">${formatDate(date)}</strong> pour <strong style="color:#fff">${nb_invites} invités</strong>.</p>
      <p style="color:#ccc;line-height:1.6">Votre <strong style="color:#c8a45a">devis estimatif N° ${num}</strong> est en pièce jointe. Notre équipe vous contactera sous <strong style="color:#fff">24h</strong>.</p>
      <p style="color:#666;font-size:12px;margin-top:24px">L'Infini · 99 Route de Montauban, Le Gosier 97190 Guadeloupe<br>direction.infini971@gmail.com · infinigp.fr</p>
    </div>`

  try {
    await Promise.all([
      transporter.sendMail({
        from: '"L\'Infini — Site Web" <direction.infini971@gmail.com>',
        to: 'direction.infini971@gmail.com',
        replyTo: email,
        subject: `[Devis ${num}] ${type_evenement} — ${nom} · ${nb_invites} invités`,
        html: htmlAdmin,
        attachments,
      }),
      transporter.sendMail({
        from: '"L\'Infini Guadeloupe" <direction.infini971@gmail.com>',
        to: email,
        subject: `Votre devis N° ${num} — L'Infini Guadeloupe`,
        html: htmlClient,
        attachments,
      }),
    ])
    return NextResponse.json({ success: true, numero: num })
  } catch (err) {
    console.error('Email erreur:', err)
    return NextResponse.json({ success: false, error: 'Erreur envoi' }, { status: 500 })
  }
}
