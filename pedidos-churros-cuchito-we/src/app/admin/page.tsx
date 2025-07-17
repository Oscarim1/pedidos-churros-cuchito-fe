'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchWithAuth } from '@/utils/api'
import { format } from 'date-fns'

interface Order {
  id: string
  order_number: number
  total: number
  created_at: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.replace('/login')
      return
    }
    fetchWithAuth('https://tienda-churroscuchito.cl/api/orders')
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Request failed')
        }
        return res.json()
      })
      .then((data) => setOrders(data))
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false))
  }, [router])

  const grouped = orders.reduce((acc: Record<string, Record<string, Record<string, Order[]>>>, order) => {
    const date = new Date(order.created_at)
    const year = format(date, 'yyyy')
    const month = format(date, 'MM')
    const day = format(date, 'dd')
    acc[year] = acc[year] || {}
    acc[year][month] = acc[year][month] || {}
    acc[year][month][day] = acc[year][month][day] || []
    acc[year][month][day].push(order)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100">
        <span className="text-orange-500 font-bold animate-pulse text-xl">Cargando...</span>
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 p-4">
      <h1 className="text-3xl font-extrabold mb-6 text-center">Historial de Pedidos</h1>
      {Object.keys(grouped)
        .sort((a, b) => b.localeCompare(a))
        .map((year) => (
          <div key={year} className="mb-6">
            <h2 className="text-2xl font-bold mb-4">Año {year}</h2>
            {Object.keys(grouped[year])
              .sort((a, b) => b.localeCompare(a))
              .map((month) => (
                <div key={month} className="ml-4 mb-4">
                  <h3 className="text-xl font-semibold mb-2">
                    {format(new Date(`${year}-${month}-01`), 'MMMM')}
                  </h3>
                  {Object.keys(grouped[year][month])
                    .sort((a, b) => b.localeCompare(a))
                    .map((day) => (
                      <div key={day} className="ml-4 mb-3">
                        <h4 className="font-medium mb-1">Día {day}</h4>
                        <ul className="space-y-1">
                          {grouped[year][month][day].map((o) => (
                            <li key={o.id} className="bg-white rounded shadow p-2 flex justify-between">
                              <span>Pedido #{o.order_number}</span>
                              <span>${'{'}o.total.toLocaleString('es-CL'){'}'}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                </div>
              ))}
          </div>
        ))}
    </div>
  )
}
