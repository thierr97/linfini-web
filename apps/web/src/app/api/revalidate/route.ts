import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

const SECRET = process.env.REVALIDATE_SECRET ?? ''

export async function POST(req: NextRequest) {
  const { secret, path } = await req.json().catch(() => ({}))

  if (SECRET && secret !== SECRET) {
    return NextResponse.json({ error: 'Secret invalide' }, { status: 401 })
  }

  const paths = path ? [path] : ['/menu', '/', '/bar']
  paths.forEach(p => revalidatePath(p))

  return NextResponse.json({ ok: true, revalidated: paths })
}
