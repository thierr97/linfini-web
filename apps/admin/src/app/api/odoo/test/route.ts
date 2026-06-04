import { NextRequest, NextResponse } from 'next/server'

// Odoo External JSON-RPC API — endpoint /jsonrpc (pas /web/dataset/call_kw)
// C'est l'API conçue pour les connexions serveur-à-serveur avec clé API

async function odooRpc(url: string, service: string, method: string, args: any[]) {
  const res = await fetch(`${url}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', method: 'call', id: Date.now(),
      params: { service, method, args },
    }),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.data?.message ?? data.error.message ?? JSON.stringify(data.error))
  return data.result
}

export async function POST(req: NextRequest) {
  const { url, db, user, password, apiKey, mode } = await req.json()

  if (!url || !user) return NextResponse.json({ ok: false, message: 'URL et email requis' })

  const database = db?.trim() || url.replace('https://', '').replace('.odoo.com', '')
  const pass = (mode === 'apikey' ? apiKey?.trim() : password) ?? ''

  try {
    // 1. Authentification via /jsonrpc (API externe Odoo)
    const uid = await odooRpc(url, 'common', 'authenticate', [
      database, user.trim(), pass, {}
    ])

    if (!uid) {
      return NextResponse.json({ ok: false, message: 'Identifiants invalides — uid non retourné' })
    }

    // 2. Test lecture des catégories POS
    const categories = await odooRpc(url, 'object', 'execute_kw', [
      database, uid, pass,
      'pos.category', 'search_read', [[]],
      { fields: ['id', 'name'], limit: 10 }
    ])

    const catNames = (categories ?? []).map((c: any) => c.name).join(', ')

    return NextResponse.json({
      ok: true,
      message: `✓ Connecté ! (uid: ${uid}) — ${categories?.length ?? 0} catégorie(s) POS${catNames ? ' : ' + catNames : ' (configurez votre POS dans Odoo)'}`,
    })

  } catch (e: any) {
    return NextResponse.json({ ok: false, message: `Erreur : ${e.message}` })
  }
}
