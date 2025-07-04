'use client'
import { useCart } from '../../context/CartContext'

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart()
  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0)

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100">
        <p className="text-lg text-gray-700">Tu carrito está vacío.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 p-4">
      <h1 className="text-2xl font-bold mb-4">Carrito de compras</h1>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between bg-white p-4 rounded shadow">
            <div className="flex items-center gap-4">
              {item.image_url && <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded" />}
              <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold">${(item.price * item.quantity).toLocaleString('es-CL')}</p>
              <button onClick={() => removeItem(item.id)} className="text-sm text-red-500 hover:underline">Quitar</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex justify-between items-center">
        <button onClick={clearCart} className="text-sm text-red-600 hover:underline">Vaciar carrito</button>
        <p className="text-xl font-bold">Total: ${total.toLocaleString('es-CL')}</p>
      </div>
    </div>
  )
}
