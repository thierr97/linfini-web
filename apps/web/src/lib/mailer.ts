import nodemailer from 'nodemailer'

// Transporteur Gmail SMTP partagé (même compte que les devis).
// ⚠️ Gmail plafonne l'envoi (~500/j compte perso, ~2000/j Workspace).
export const MAIL_FROM = "L'Infini Guadeloupe <direction.infini971@gmail.com>"
export const MAIL_USER = 'direction.infini971@gmail.com'

export function getTransporter() {
  if (!process.env.GMAIL_DEVIS_PASSWORD) {
    throw new Error('GMAIL_DEVIS_PASSWORD non configuré')
  }
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: MAIL_USER, pass: process.env.GMAIL_DEVIS_PASSWORD },
    pool: true,        // réutilise la connexion pour un envoi en lots
    maxConnections: 1,
    maxMessages: 100,
  })
}
