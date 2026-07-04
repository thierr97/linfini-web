// Emailing clients L'Infini — liste opt-in, envoi par lots, RGPD.
// Canal : Gmail SMTP (lib/mailer). Désinscription + open-tracking obligatoires.

import { getTransporter, MAIL_FROM } from '@/lib/mailer'

// on nettoie les \n/espaces parasites hérités des env Vercel (printf "...\n")
const SITE = (process.env.NEWSLETTER_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://infinigp.fr')
  .replace(/\\n/g, '').trim().replace(/\/+$/, '')
const DAILY_CAP = Number(process.env.NEWSLETTER_DAILY_CAP ?? 450)  // marge sous le plafond Gmail
const BATCH_DELAY_MS = 1200                                        // throttle anti-spam

async function db() {
  const { prisma } = await import('@linfini/db')
  return prisma
}

// ── Synchronisation des contacts depuis les données clients existantes ────────
export async function syncContacts(): Promise<{ added: number; total: number }> {
  const prisma = await db()

  const seen = new Map<string, { name: string | null; source: string }>()
  const add = (email: unknown, name: unknown, source: string) => {
    const e = String(email ?? '').trim().toLowerCase()
    if (!e || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return
    if (!seen.has(e)) seen.set(e, { name: (name ? String(name) : null), source })
  }

  const [reservations, tickets, pickups, clients] = await Promise.all([
    prisma.reservation.findMany({ select: { email: true, name: true } }),
    prisma.ticket.findMany({ select: { buyerEmail: true, buyerFirstName: true, buyerLastName: true } }),
    prisma.pickupOrder.findMany({ select: { customerEmail: true, customerName: true } }),
    prisma.client.findMany({ select: { email: true, name: true } }),
  ])

  reservations.forEach(r => add(r.email, r.name, 'reservation'))
  tickets.forEach(t => add(t.buyerEmail, `${t.buyerFirstName ?? ''} ${t.buyerLastName ?? ''}`.trim(), 'ticket'))
  pickups.forEach(p => add(p.customerEmail, p.customerName, 'pickup'))
  clients.forEach(c => add(c.email, c.name, 'client'))

  let added = 0
  for (const [email, { name, source }] of seen) {
    const existing = await prisma.emailContact.findUnique({ where: { email } })
    if (existing) {
      // on ne réabonne jamais un désinscrit ; on complète juste le nom manquant
      if (!existing.name && name) {
        await prisma.emailContact.update({ where: { email }, data: { name } })
      }
      continue
    }
    await prisma.emailContact.create({ data: { email, name, source } })
    added++
  }

  const total = await prisma.emailContact.count()
  return { added, total }
}

export async function contactStats() {
  const prisma = await db()
  const [total, subscribed, unsubscribed, bounced] = await Promise.all([
    prisma.emailContact.count(),
    prisma.emailContact.count({ where: { subscribed: true, bounced: false } }),
    prisma.emailContact.count({ where: { subscribed: false } }),
    prisma.emailContact.count({ where: { bounced: true } }),
  ])
  return { total, sendable: subscribed, unsubscribed, bounced }
}

// ── Rendu HTML : wrapper + désinscription + pixel d'ouverture ─────────────────
function renderEmail(campaignId: string, contact: { email: string; unsubscribeToken: string }, subject: string, preheader: string | null, body: string) {
  const unsubUrl = `${SITE}/api/newsletter/unsubscribe?token=${contact.unsubscribeToken}`
  const pixel = `${SITE}/api/newsletter/open?c=${campaignId}&e=${encodeURIComponent(contact.email)}`
  return `<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px;background:#0d0d0d;font-family:Arial,Helvetica,sans-serif;">
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#161616;border-radius:16px;overflow:hidden;">
      <tr><td style="background:linear-gradient(135deg,#1a1a1a,#241a10);padding:28px;text-align:center;">
        <p style="color:#E8823A;font-size:13px;letter-spacing:4px;margin:0;text-transform:uppercase;">L'Infini · Le Gosier</p>
        <h1 style="color:#F5EDD8;font-size:24px;margin:8px 0 0;">${subject}</h1>
      </td></tr>
      <tr><td style="padding:28px;color:#e8e2d4;font-size:15px;line-height:1.7;">
        ${body}
      </td></tr>
      <tr><td style="padding:20px 28px;background:#111;text-align:center;border-top:1px solid #2a2a2a;">
        <p style="color:#777;font-size:12px;margin:0 0 6px;">L'Infini — Le Gosier, Guadeloupe · <a href="${SITE}" style="color:#E8823A;text-decoration:none;">infinigp.fr</a></p>
        <p style="color:#555;font-size:11px;margin:0;">Vous recevez cet email en tant que client de L'Infini.<br/>
          <a href="${unsubUrl}" style="color:#888;text-decoration:underline;">Se désinscrire</a>
        </p>
      </td></tr>
    </table>
  </td></tr></table>
  <img src="${pixel}" width="1" height="1" alt="" style="display:block;border:0;" />
</body></html>`
}

// ── Envoi d'une campagne (idempotent, repris tranche par tranche) ─────────────
// maxThisRun borne le nombre d'envois par appel (timeout serverless) ; l'UI
// rappelle en boucle tant que remaining > 0. DAILY_CAP borne le total/jour.
export async function sendCampaign(campaignId: string, maxThisRun = 30): Promise<{ sent: number; failed: number; remaining: number }> {
  const prisma = await db()
  const campaign = await prisma.emailCampaign.findUnique({ where: { id: campaignId } })
  if (!campaign) throw new Error('Campagne introuvable')

  const contacts = await prisma.emailContact.findMany({
    where: { subscribed: true, bounced: false },
    orderBy: { createdAt: 'asc' },
  })

  // destinataires pas encore traités pour cette campagne
  const doneRows = await prisma.emailSend.findMany({
    where: { campaignId, status: { in: ['SENT', 'FAILED'] } },
    select: { email: true },
  })
  const done = new Set(doneRows.map(r => r.email))
  const pending = contacts.filter(c => !done.has(c.email))

  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: { status: 'SENDING', totalCount: contacts.length },
  })

  const alreadySent = await prisma.emailSend.count({ where: { campaignId, status: 'SENT' } })
  const capRemaining = Math.max(0, DAILY_CAP - alreadySent)
  const transporter = getTransporter()
  const toSend = pending.slice(0, Math.min(maxThisRun, capRemaining))
  let sent = 0
  let failed = 0

  for (const contact of toSend) {
    const html = renderEmail(campaignId, contact, campaign.subject, campaign.preheader, campaign.body)
    try {
      await transporter.sendMail({
        from: MAIL_FROM,
        to: contact.email,
        subject: campaign.subject,
        html,
        headers: {
          'List-Unsubscribe': `<${SITE}/api/newsletter/unsubscribe?token=${contact.unsubscribeToken}>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
      })
      await prisma.emailSend.upsert({
        where: { campaignId_email: { campaignId, email: contact.email } },
        create: { campaignId, email: contact.email, status: 'SENT', sentAt: new Date() },
        update: { status: 'SENT', sentAt: new Date(), error: null },
      })
      sent++
    } catch (e: any) {
      await prisma.emailSend.upsert({
        where: { campaignId_email: { campaignId, email: contact.email } },
        create: { campaignId, email: contact.email, status: 'FAILED', error: String(e?.message ?? e).slice(0, 300) },
        update: { status: 'FAILED', error: String(e?.message ?? e).slice(0, 300) },
      })
      failed++
    }
    await new Promise(r => setTimeout(r, BATCH_DELAY_MS))
  }
  transporter.close()

  const totalSent = await prisma.emailSend.count({ where: { campaignId, status: 'SENT' } })
  const totalFailed = await prisma.emailSend.count({ where: { campaignId, status: 'FAILED' } })
  const remaining = pending.length - toSend.length

  await prisma.emailCampaign.update({
    where: { id: campaignId },
    data: {
      sentCount: totalSent,
      failedCount: totalFailed,
      status: remaining > 0 ? 'SENDING' : 'SENT',
      sentAt: campaign.sentAt ?? new Date(),
    },
  })

  return { sent, failed, remaining }
}

// ── Désinscription (RGPD) ─────────────────────────────────────────────────────
export async function unsubscribeByToken(token: string): Promise<{ email: string } | null> {
  const prisma = await db()
  const contact = await prisma.emailContact.findUnique({ where: { unsubscribeToken: token } })
  if (!contact) return null
  if (contact.subscribed) {
    await prisma.emailContact.update({
      where: { id: contact.id },
      data: { subscribed: false, unsubscribedAt: new Date() },
    })
  }
  return { email: contact.email }
}

// ── Tracking d'ouverture ──────────────────────────────────────────────────────
export async function recordOpen(campaignId: string, email: string) {
  const prisma = await db()
  const row = await prisma.emailSend.findUnique({
    where: { campaignId_email: { campaignId, email } },
  }).catch(() => null)
  if (row && !row.openedAt) {
    await prisma.emailSend.update({ where: { id: row.id }, data: { openedAt: new Date() } })
    await prisma.emailCampaign.update({ where: { id: campaignId }, data: { openCount: { increment: 1 } } })
  }
}

// Envoi d'un email de test (aperçu réel) sans créer de campagne
export async function sendTest(subject: string, preheader: string | null, body: string, to: string) {
  const transporter = getTransporter()
  const html = renderEmail('test', { email: to, unsubscribeToken: 'test' }, subject, preheader, body)
  await transporter.sendMail({ from: MAIL_FROM, to, subject: `[TEST] ${subject}`, html })
  transporter.close()
}

export async function listCampaigns() {
  const prisma = await db()
  return prisma.emailCampaign.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
}
