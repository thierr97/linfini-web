export const dynamic = 'force-dynamic'

async function getTables() {
  try {
    const { prisma } = await import('@linfini/db')
    return await prisma.table.findMany({ orderBy: { number: 'asc' } })
  } catch { return [] }
}

export default async function TablesPage() {
  const tables = await getTables()
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tables & QR Codes</h1>
      {tables.length === 0 && (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-400">
          <p>Aucune table — connectez la base de données puis lancez le seed SQL.</p>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((t: any) => (
          <div key={t.id} className="bg-white rounded-xl border p-4 text-center shadow-sm">
            <div className="text-4xl mb-2">🪑</div>
            <h3 className="font-bold text-gray-900">{t.label}</h3>
            <p className="text-sm text-gray-400">{t.capacity} couverts</p>
            <div className="mt-3 bg-gray-50 rounded-lg p-2">
              <p className="text-xs text-gray-400 break-all">/table/{t.id}</p>
            </div>
            <a
              href={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://order.linfini.gp/table/${t.id}`)}`}
              target="_blank"
              className="mt-2 block text-xs text-braise hover:underline"
            >
              Télécharger QR
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
