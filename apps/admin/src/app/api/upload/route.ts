import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), '..', 'web', 'public', 'menu')

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const itemId = formData.get('itemId') as string | null

    if (!file) return NextResponse.json({ error: 'Aucun fichier' }, { status: 400 })

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    if (!['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(ext)) {
      return NextResponse.json({ error: 'Format non supporté (jpg, png, webp uniquement)' }, { status: 400 })
    }

    const slug = (itemId ?? `upload-${Date.now()}`).replace(/[^a-z0-9]/gi, '-').toLowerCase()
    const filename = `${slug}.${ext}`
    const filepath = path.join(UPLOAD_DIR, filename)

    const buffer = Buffer.from(await file.arrayBuffer())
    await fs.writeFile(filepath, buffer)

    return NextResponse.json({ ok: true, path: `/menu/${filename}` })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
