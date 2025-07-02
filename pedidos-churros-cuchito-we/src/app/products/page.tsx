'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  price: string
  image_url?: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.replace('/login')
      return
    }
    fetch('http://localhost:3000/api/products', {
      headers: { Authorization: `Bearer ${token}` },
    })
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Cargando...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Productos</h1>
      <ul className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <li key={p.id} className="border p-4 rounded shadow">
            {p.image_url && (
              <img src={p.image_url} alt={p.name} className="w-full h-40 object-cover mb-2" />
            )}
            <h2 className="font-semibold">{p.name}</h2>
            <p className="text-sm">${p.price}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
