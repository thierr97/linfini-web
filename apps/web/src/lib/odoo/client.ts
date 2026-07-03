// Client Odoo External JSON-RPC — endpoint /jsonrpc
// Conçu pour connexions serveur-à-serveur avec clé API ou mot de passe

// Les valeurs Vercel ont pu être ajoutées avec un retour à la ligne parasite
// (printf "...\n" | vercel env add) : on nettoie systématiquement.
const env = (v: string | undefined) => (v ?? '').replace(/\\n/g, '').trim()

const ODOO_URL      = env(process.env.ODOO_URL).replace(/\/+$/, '')
const ODOO_DB       = env(process.env.ODOO_DB)
const ODOO_USER     = env(process.env.ODOO_USER)
const ODOO_PASSWORD = env(process.env.ODOO_API_KEY) || env(process.env.ODOO_PASSWORD)

// Le site ne doit jamais attendre Odoo plus de 5 s (spec §8)
const TIMEOUT_MS = 5000

let _uid: number | null = null

async function rpc(service: string, method: string, args: any[]) {
  const res = await fetch(`${ODOO_URL}/jsonrpc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', method: 'call', id: Date.now(),
      params: { service, method, args },
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  const data = await res.json()
  if (data.error) throw new Error(data.error.data?.message ?? data.error.message ?? JSON.stringify(data.error))
  return data.result
}

async function getUid(): Promise<number> {
  if (_uid) return _uid
  const uid = await rpc('common', 'authenticate', [ODOO_DB, ODOO_USER, ODOO_PASSWORD, {}])
  if (!uid) throw new Error('Authentification Odoo échouée — vérifiez ODOO_USER et ODOO_API_KEY')
  _uid = uid
  return _uid!
}

export async function odooCall<T = any>(
  model: string,
  method: string,
  args: any[] = [],
  kwargs: Record<string, any> = {}
): Promise<T> {
  if (!isConfigured()) throw new Error('ODOO_URL / ODOO_DB / ODOO_USER / ODOO_API_KEY non configurés')
  const uid = await getUid()
  return rpc('object', 'execute_kw', [ODOO_DB, uid, ODOO_PASSWORD, model, method, args, kwargs])
}

export function imageUrl(id: number): string {
  return `${ODOO_URL}/web/image/product.template/${id}/image_512`
}

export function isConfigured(): boolean {
  return Boolean(ODOO_URL && ODOO_DB && ODOO_USER && ODOO_PASSWORD)
}
