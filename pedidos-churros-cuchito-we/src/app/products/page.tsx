'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HiPlus } from 'react-icons/hi'
import { fetchWithAuth } from '@/utils/api'

interface Product {
  id: string
  name: string
  price: string        // viene como string del backend
  points: number
  image_url?: string
  description: string
  category: string     // "Churros", "Otros", etc.
}

const CATEGORIES = [
  { label: 'Churros', value: 'churros' },
  { label: 'Churros rellenos', value: 'churros rellenos' },
  { label: 'Papas fritas', value: 'papas fritas' },
  { label: 'Bebidas', value: 'bebidas' },
  { label: 'Otros', value: 'otros' },
]

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('churros')
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.replace('/login')
      return
    }

    fetchWithAuth('http://localhost:3000/api/products')
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Request failed')
        }
        return res.json()
      })
      .then((data) => setProducts(data))
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false))
  }, [router])

  // Filtrar productos por categoría (case-insensitive, igual que el login)
  const filteredProducts = products.filter(
    (p) => (p.category || '').trim().toLowerCase() === activeCategory
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100">
        <span className="text-orange-500 font-bold animate-pulse text-xl">Cargando productos...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 text-red-500 font-semibold">
        {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Título principal */}
        {/*<h1 className="text-4xl font-extrabold mb-8 text-black">Nuestros Productos</h1>*/}

        {/* Tabs de categorías */}
        <div className="flex gap-3 mb-8 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-5 py-2 rounded-full border font-medium transition-all duration-150
                ${
                  activeCategory === cat.value
                    ? 'bg-black text-white border-black shadow'
                    : 'bg-white text-black border-gray-300 hover:bg-orange-50'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="rounded-2xl bg-white shadow-md overflow-hidden flex flex-col border hover:shadow-xl transition-shadow group"
            >
              <div className="relative">
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                  style={{ background: '#eee' }}
                />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div>
                  <h2 className="text-lg font-bold mb-1">{p.name}</h2>
                  <p className="text-gray-600 text-sm mb-4">{p.description}</p>
                </div>
                <div className="flex items-end justify-between mt-auto">
                  <span className="text-xl font-extrabold text-gray-900">
                    ${parseInt(p.price).toLocaleString('es-CL')}
                  </span>
                  <button
                    className="ml-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2 shadow transition"
                    aria-label={`Agregar ${p.name} al carrito`}
                    tabIndex={0}
                  >
                    <HiPlus size={22} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {!filteredProducts.length && (
            <div className="col-span-full text-center text-gray-400 p-10 text-lg">
              No hay productos en esta categoría.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
