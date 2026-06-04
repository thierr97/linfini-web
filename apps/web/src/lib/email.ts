import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = 'L\'Infini Guadeloupe <billets@linfini.gp>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://linfini.gp'

function formatDate(d: Date | string) {
  return new Date(d).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(d: Date | string) {
  return new Date(d).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export async function sendTicketConfirmationEmail(ticket: {
  id: string
  code: string
  buyerFirstName: string
  buyerLastName: string
  buyerEmail: string
  quantity: number
  total: number
  unitPrice: number
  event: {
    title: string
    date: Date | string
    venue: string
    slug: string
    dressCode?: string | null
    ageRestriction?: number | null
    doorsOpen?: Date | string | null
  }
  ticketType: {
    name: string
  }
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY non configuré — email non envoyé')
    return
  }

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(ticket.code)}&bgcolor=1a1a1a&color=F5EDD8&qzone=2`
  const confirmationUrl = `${APP_URL}/evenements/confirmation?code=${ticket.code}`
  const eventUrl = `${APP_URL}/evenements/${ticket.event.slug}`

  const tvaRate = 0.085
  const htTotal = ticket.total / (1 + tvaRate)
  const tvaTotal = ticket.total - htTotal

  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Votre billet — ${ticket.event.title}</title>
</head>
<body style="margin:0;padding:0;background:#111111;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Logo + header -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="font-size:28px;font-weight:900;color:#F5EDD8;letter-spacing:0.15em;font-family:Georgia,serif;">
                L'INFINI
              </div>
              <div style="font-size:11px;color:#9CA3AF;letter-spacing:0.25em;margin-top:4px;">GUADELOUPE</div>
            </td>
          </tr>

          <!-- Success message -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="display:inline-block;width:60px;height:60px;background:#14532d;border:1px solid #166534;border-radius:50%;font-size:28px;line-height:60px;text-align:center;">✅</div>
              <h1 style="color:#F5EDD8;font-size:28px;font-weight:700;margin:16px 0 8px;font-family:Georgia,serif;">
                Paiement confirmé !
              </h1>
              <p style="color:#9CA3AF;font-size:16px;margin:0;">
                Votre billet pour <strong style="color:#D4A853;">${ticket.event.title}</strong> est enregistré.
              </p>
            </td>
          </tr>

          <!-- Ticket card -->
          <tr>
            <td style="background:#1C1C1C;border:1px solid #2A2A2A;border-radius:20px;overflow:hidden;">
              <!-- Gradient header -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg,#C0392B,#E67E22);padding:20px 24px;">
                    <div style="font-size:11px;color:rgba(255,255,255,0.7);letter-spacing:0.15em;text-transform:uppercase;margin-bottom:4px;">L'Infini Guadeloupe</div>
                    <div style="font-size:22px;font-weight:700;color:#ffffff;font-family:Georgia,serif;">${ticket.event.title}</div>
                    <div style="font-size:14px;color:rgba(255,255,255,0.8);margin-top:4px;">${ticket.ticketType.name}</div>
                  </td>
                </tr>

                <!-- Ticket body: info + QR -->
                <tr>
                  <td style="padding:24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <!-- Left: infos -->
                        <td width="55%" style="vertical-align:top;padding-right:20px;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-bottom:16px;">
                                <div style="font-size:10px;color:#6B7280;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">📅 Date</div>
                                <div style="color:#F5EDD8;font-size:14px;font-weight:600;text-transform:capitalize;">${formatDate(ticket.event.date)}</div>
                                <div style="color:#9CA3AF;font-size:12px;margin-top:2px;">${formatTime(ticket.event.date)}${ticket.event.doorsOpen ? ` · Portes ${formatTime(ticket.event.doorsOpen)}` : ''}</div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom:16px;">
                                <div style="font-size:10px;color:#6B7280;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">📍 Lieu</div>
                                <div style="color:#F5EDD8;font-size:14px;font-weight:600;">${ticket.event.venue}</div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom:16px;">
                                <div style="font-size:10px;color:#6B7280;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">👤 Acheteur</div>
                                <div style="color:#F5EDD8;font-size:14px;font-weight:600;">${ticket.buyerFirstName} ${ticket.buyerLastName}</div>
                                <div style="color:#9CA3AF;font-size:12px;">${ticket.buyerEmail}</div>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding-bottom:8px;">
                                <div style="font-size:10px;color:#6B7280;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">🎫 Billets</div>
                                <div style="color:#F5EDD8;font-size:14px;font-weight:600;">${ticket.quantity} × ${ticket.ticketType.name}</div>
                                <div style="color:#D4A853;font-size:18px;font-weight:700;margin-top:4px;">${ticket.total.toFixed(2)} €</div>
                                <div style="color:#6B7280;font-size:11px;">dont TVA 8.5% : ${tvaTotal.toFixed(2)} €</div>
                              </td>
                            </tr>
                          </table>
                        </td>

                        <!-- Right: QR -->
                        <td width="45%" style="vertical-align:middle;text-align:center;">
                          <div style="background:#111111;border:1px solid #2A2A2A;border-radius:12px;padding:16px;display:inline-block;">
                            <img src="${qrUrl}" alt="QR Code" width="160" height="160" style="display:block;border-radius:8px;" />
                            <div style="color:#6B7280;font-size:10px;margin-top:10px;font-family:monospace;word-break:break-all;">
                              ${ticket.code}
                            </div>
                          </div>
                          <div style="margin-top:12px;">
                            <a href="${confirmationUrl}" style="display:inline-block;background:#C0392B;color:#ffffff;font-size:12px;font-weight:600;padding:8px 16px;border-radius:20px;text-decoration:none;">
                              Voir mon billet
                            </a>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Dashed separator -->
                <tr>
                  <td style="padding:0 24px;">
                    <div style="border-top:2px dashed #2A2A2A;"></div>
                  </td>
                </tr>

                <!-- Statut + infos pratiques -->
                <tr>
                  <td style="padding:16px 24px 24px;">
                    <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:16px;">
                      <span style="display:inline-block;width:8px;height:8px;background:#22C55E;border-radius:50%;"></span>
                      <span style="color:#22C55E;font-size:14px;font-weight:600;">Billet confirmé et valide</span>
                    </div>
                    <div style="background:#111111;border:1px solid #1F1F1F;border-radius:12px;padding:16px;">
                      <div style="color:#9CA3AF;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:10px;">Informations pratiques</div>
                      <div style="color:#6B7280;font-size:13px;line-height:1.7;">
                        • Présentez ce QR code à l'entrée de l'événement<br/>
                        • Une pièce d'identité peut être demandée<br/>
                        ${ticket.event.dressCode ? `• Dress code : <strong style="color:#9CA3AF;">${ticket.event.dressCode}</strong><br/>` : ''}
                        ${ticket.event.ageRestriction ? `• Âge minimum : <strong style="color:#9CA3AF;">${ticket.event.ageRestriction} ans</strong><br/>` : ''}
                        • Ce billet est nominatif et non remboursable
                      </div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding-top:32px;">
              <a href="${eventUrl}" style="display:inline-block;border:1px solid #2A2A2A;color:#9CA3AF;font-size:14px;padding:12px 24px;border-radius:12px;text-decoration:none;margin-right:12px;">
                ← Retour à l'événement
              </a>
              <a href="${APP_URL}/evenements" style="display:inline-block;background:#C0392B;color:#ffffff;font-size:14px;font-weight:600;padding:12px 24px;border-radius:12px;text-decoration:none;">
                Tous les événements
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:40px;padding-bottom:20px;">
              <div style="color:#374151;font-size:12px;line-height:1.6;">
                L'Infini Guadeloupe · Route de Montauban, Le Gosier<br/>
                <a href="https://www.instagram.com/infinievents.gp/" style="color:#374151;">@infinievents.gp</a>
                · <a href="${APP_URL}" style="color:#374151;">${APP_URL.replace('https://', '')}</a>
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `

  try {
    await resend.emails.send({
      from: FROM,
      to: ticket.buyerEmail,
      subject: `🎫 Votre billet — ${ticket.event.title}`,
      html,
    })
    console.log(`[email] Confirmation envoyée à ${ticket.buyerEmail}`)
  } catch (err) {
    console.error('[email] Erreur envoi:', err)
  }
}
