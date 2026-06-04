'use client'
import { useState, useEffect, useCallback, useRef } from 'react'

const WEB_API = ''
const WEB_URL = 'http://localhost:3000'

interface MenuItem {
  id: string
  name: string
  desc: string
  price: number
  img: string
  active: boolean
}
interface MenuCategory {
  id: string
  name: string
  icon: string
  items: MenuItem[]
}

export default function MenuAdminPage() {
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [editItem, setEditItem] = useState<{ catId: string; item: MenuItem } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchMenu = useCallback(async () => {
    const res = await fetch(`${WEB_API}/api/menu`)
    const data = await res.json()
    setCategories(data.categories ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchMenu() }, [fetchMenu])

  const saveItem = async () => {
    if (!editItem) return
    setSaving(editItem.item.id)
    await fetch(`${WEB_API}/api/menu`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId: editItem.catId, itemId: editItem.item.id, updates: editItem.item }),
    })
    await fetchMenu()
    setSaving(null)
    setEditItem(null)
  }

  const toggleActive = async (catId: string, item: MenuItem) => {
    setSaving(item.id)
    await fetch(`${WEB_API}/api/menu`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoryId: catId, itemId: item.id, updates: { active: !item.active } }),
    })
    await fetchMenu()
    setSaving(null)
  }

  const handleImageUpload = async (file: File) => {
    if (!editItem) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('itemId', editItem.item.id)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const data = await res.json()
      if (data.path) {
        setEditItem({ ...editItem, item: { ...editItem.item, img: data.path } })
      } else {
        alert(data.error ?? 'Erreur upload')
      }
    } finally {
      setUploading(false)
    }
  }

  const imgSrc = (img: string) => img?.startsWith('/') ? `${WEB_URL}${img}` : img

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <div className="text-center"><div className="text-3xl mb-3 animate-spin">⚙️</div><p>Chargement…</p></div>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion du Menu</h1>
          <p className="text-sm text-gray-400 mt-1">Modifiez noms, prix, descriptions et images directement ici</p>
        </div>
        <button onClick={fetchMenu} className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50">
          🔄 Actualiser
        </button>
      </div>

      {/* Catégories */}
      {categories.map(cat => (
        <div key={cat.id} className="mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span>{cat.icon}</span><span>{cat.name}</span>
            <span className="text-sm font-normal text-gray-400">({cat.items.length} articles)</span>
          </h2>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {['Image', 'Nom', 'Prix', 'Statut', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-gray-500 font-medium text-xs uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {cat.items.map(item => (
                  <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${!item.active ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <img
                        src={imgSrc(item.img)}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover bg-gray-100"
                        onError={e => { (e.target as HTMLImageElement).src = `${WEB_URL}/menu/cocktail.jpg` }}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 font-bold text-gray-900">{item.price.toFixed(2)} €</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(cat.id, item)}
                        disabled={saving === item.id}
                        className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${item.active ? 'bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700' : 'bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700'}`}
                      >
                        {saving === item.id ? '…' : item.active ? '✓ Actif' : '✗ Inactif'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setEditItem({ catId: cat.id, item: { ...item } })}
                        className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                      >
                        ✏️ Modifier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Modal édition */}
      {editItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-gray-900">Modifier l'article</h2>
              <button onClick={() => setEditItem(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
            </div>

            <div className="p-5 space-y-4">
              {/* Image actuelle + upload */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Image</label>
                <div className="flex items-start gap-4">
                  {/* Aperçu */}
                  <div className="relative shrink-0">
                    <img
                      src={imgSrc(editItem.item.img)}
                      alt={editItem.item.name}
                      className="w-24 h-24 rounded-xl object-cover bg-gray-100 border border-gray-200"
                      onError={e => { (e.target as HTMLImageElement).src = `${WEB_URL}/menu/cocktail.jpg` }}
                    />
                    {uploading && (
                      <div className="absolute inset-0 bg-white/80 rounded-xl flex items-center justify-center">
                        <div className="animate-spin text-xl">⏳</div>
                      </div>
                    )}
                  </div>

                  {/* Boutons upload */}
                  <div className="flex-1 space-y-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="w-full border-2 border-dashed border-orange-300 hover:border-orange-500 hover:bg-orange-50 text-orange-600 rounded-xl px-4 py-3 text-sm font-medium transition-colors disabled:opacity-40"
                    >
                      {uploading ? '⏳ Upload en cours…' : '📷 Choisir une photo'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file)
                        e.target.value = ''
                      }}
                    />
                    <input
                      value={editItem.item.img}
                      onChange={e => setEditItem({ ...editItem, item: { ...editItem.item, img: e.target.value } })}
                      placeholder="/menu/nom-image.jpg"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-500 focus:outline-none focus:border-orange-400"
                    />
                    <p className="text-xs text-gray-400">JPG, PNG ou WEBP · Max 10MB</p>
                  </div>
                </div>
              </div>

              {/* Nom */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Nom</label>
                <input
                  value={editItem.item.name}
                  onChange={e => setEditItem({ ...editItem, item: { ...editItem.item, name: e.target.value } })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <input
                  value={editItem.item.desc}
                  onChange={e => setEditItem({ ...editItem, item: { ...editItem.item, desc: e.target.value } })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                  placeholder="Optionnel"
                />
              </div>

              {/* Prix */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Prix (€)</label>
                <input
                  type="number" step="0.5"
                  value={editItem.item.price}
                  onChange={e => setEditItem({ ...editItem, item: { ...editItem.item, price: parseFloat(e.target.value) } })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-400"
                />
              </div>

              {/* Visible */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox" id="active"
                  checked={editItem.item.active}
                  onChange={e => setEditItem({ ...editItem, item: { ...editItem.item, active: e.target.checked } })}
                  className="rounded"
                />
                <label htmlFor="active" className="text-sm text-gray-700">Visible sur le site</label>
              </div>
            </div>

            <div className="flex gap-2 p-5 border-t">
              <button onClick={() => setEditItem(null)} className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-sm">
                Annuler
              </button>
              <button
                onClick={saveItem}
                disabled={saving === editItem.item.id || uploading}
                className="flex-1 bg-braise text-white py-2 rounded-lg text-sm font-medium hover:bg-ambre transition-colors disabled:opacity-50"
              >
                {saving ? 'Sauvegarde…' : '✓ Sauvegarder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
