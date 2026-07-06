// Boutons de connexion sociale — chaque bouton lance le flux OAuth serveur.
// Ce sont des liens <a> (navigation vers une route API qui redirige).

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.5l-6.5-5.5C29.6 34.6 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.5C41.8 36 44 30.7 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  )
}
function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l.001-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  )
}
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2" aria-hidden>
      <path d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.68 4.53-4.68 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.25h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z" />
    </svg>
  )
}

export default function SocialAuth() {
  const btn = 'flex items-center justify-center gap-3 w-full py-3 rounded-xl font-semibold text-sm transition-colors'
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 my-1">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-white/30 text-xs uppercase tracking-widest">ou</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>
      <a href="/api/auth/google" className={`${btn} bg-white text-noir hover:bg-white/90`}>
        <GoogleIcon /> Continuer avec Google
      </a>
      <a href="/api/auth/apple" className={`${btn} bg-black text-white border border-white/15 hover:bg-white/10`}>
        <AppleIcon /> Continuer avec Apple
      </a>
      <a href="/api/auth/facebook" className={`${btn} bg-[#1877F2] text-white hover:bg-[#1466d6]`}>
        <FacebookIcon /> Continuer avec Facebook
      </a>
    </div>
  )
}
