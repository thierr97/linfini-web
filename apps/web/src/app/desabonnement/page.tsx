import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string }>
}) {
  const { ok } = await searchParams
  const success = ok !== '0'

  return (
    <div className="min-h-screen bg-noir text-creme flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-charbon border border-white/10 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">{success ? '👋' : '⚠️'}</div>
        <h1 className="font-display text-2xl font-bold mb-3">
          {success ? 'Vous êtes désinscrit' : 'Lien invalide'}
        </h1>
        <p className="text-white/50 mb-6">
          {success
            ? 'Vous ne recevrez plus nos emails. Vous nous manquerez — vous pouvez revenir quand vous voulez.'
            : "Ce lien de désinscription n'est pas valide ou a expiré. Contactez-nous si besoin."}
        </p>
        <Link href="/" className="bg-braise hover:bg-ambre text-white px-6 py-3 rounded-full font-bold transition-colors inline-block">
          Retour au site
        </Link>
      </div>
    </div>
  )
}
