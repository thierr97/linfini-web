interface OrderLine {
  item: { name: string }
  modifiers: unknown
  note?: string | null
}

interface OrderData {
  number: string
  table?: { label: string } | null
  total: number
  note?: string | null
  lines: OrderLine[]
}

export async function sendNotifications(order: OrderData) {
  const promises: Promise<void>[] = []
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN
  const telegramChatId = process.env.TELEGRAM_CHAT_ID
  const webhookUrl = process.env.WEBHOOK_URL
  if (telegramToken && telegramChatId) promises.push(sendTelegram(order, telegramToken, telegramChatId))
  if (webhookUrl) promises.push(sendWebhook(order, webhookUrl))
  await Promise.allSettled(promises)
}

async function sendTelegram(order: OrderData, token: string, chatId: string) {
  const lines = order.lines.map(l => {
    const mods = Array.isArray(l.modifiers) ? l.modifiers : []
    const modStr = mods.length ? '\n  ' + mods.map((m: {name:string}) => `• ${m.name}`).join('\n  ') : ''
    return `📌 ${l.item.name}${modStr}`
  }).join('\n')

  const text = [
    `🍽️ *COMMANDE #${order.number}* — L'Infini`,
    '━━━━━━━━━━━━━━━━━━',
    `📋 Table: ${order.table?.label ?? 'Sans table'}`,
    `🕐 ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
    '',
    lines,
    order.note ? `\n📝 _${order.note}_` : '',
    '',
    `💶 *Total: ${order.total.toFixed(2).replace('.', ',')} €*`,
    '━━━━━━━━━━━━━━━━━━'
  ].filter(Boolean).join('\n')

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
  })
}

async function sendWebhook(order: OrderData, url: string) {
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      source: 'linfini-order',
      order_id: order.number,
      table: order.table?.label,
      total: order.total,
      lines: order.lines,
      note: order.note,
      timestamp: new Date().toISOString()
    })
  })
}
