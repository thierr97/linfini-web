import { NextRequest, NextResponse } from 'next/server'

const DEV_USERS = [
  { email: 'admin@linfini.gp', password: 'admin123', role: 'ADMIN' },
]

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  // Try DB first
  try {
    const { prisma } = await import('@linfini/db')
    const bcrypt = await import('bcryptjs')
    const user = await prisma.user.findUnique({ where: { email } })
    if (user) {
      const valid = await bcrypt.default.compare(password, user.password)
      if (!valid) return NextResponse.json({ success: false, message: 'Identifiants invalides' }, { status: 401 })
      const response = NextResponse.json({ success: true, user: { email: user.email, role: user.role } })
      response.cookies.set('admin-token', Buffer.from(JSON.stringify({ id: user.id, email: user.email })).toString('base64'), {
        httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 60 * 60 * 24 * 7, path: '/',
      })
      return response
    }
  } catch { /* DB not available, fall through to dev mode */ }

  // Dev mode fallback
  const devUser = DEV_USERS.find(u => u.email === email && u.password === password)
  if (!devUser) return NextResponse.json({ success: false, message: 'Identifiants invalides' }, { status: 401 })

  const response = NextResponse.json({ success: true, user: { email: devUser.email, role: devUser.role } })
  response.cookies.set('admin-token', Buffer.from(JSON.stringify({ email: devUser.email })).toString('base64'), {
    httpOnly: true, secure: false, maxAge: 60 * 60 * 24 * 7, path: '/',
  })
  return response
}
