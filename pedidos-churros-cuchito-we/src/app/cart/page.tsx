'use client'
import { useCart } from '../../context/CartContext'
import { HiTrash } from 'react-icons/hi'
import { useState } from 'react'

export default function CartPage() {
  const { items, removeItem, clearCart } = useCart()
  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0)
  const [payment, setPayment] = useState<'efectivo' | 'tarjeta' | null>(null)

  if (!items.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100">
        <p className="text-lg text-gray-700">Tu carrito está vacío.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 py-8 px-2 sm:px-6">
      <h1 className="text-4xl font-extrabold mb-8 text-black text-center">Carrito de compras</h1>
      
      <ul className="space-y-6 max-w-3xl mx-auto">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex flex-col sm:flex-row items-center justify-between bg-white/90 border border-orange-100 rounded-2xl shadow-md px-4 py-4 gap-3"
          >
            <div className="flex items-center gap-5 w-full sm:w-auto">
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg border border-orange-50 shadow"
                />
              )}
              <div className="flex flex-col">
                <span className="font-bold text-lg text-gray-900">{item.name}</span>
                <span className="text-gray-500 text-sm mt-1">Cantidad: <span className="font-semibold">{item.quantity}</span></span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 w-full sm:w-auto mt-3 sm:mt-0">
              <span className="font-bold text-xl text-gray-800">${(item.price * item.quantity).toLocaleString('es-CL')}</span>
              <button
                onClick={() => removeItem(item.id)}
                className="flex items-center gap-1 px-3 py-1 rounded-lg text-sm bg-orange-50 text-orange-600 font-bold hover:bg-orange-100 border border-orange-200 transition"
              >
                <HiTrash className="text-orange-500" />
                Quitar
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="max-w-3xl mx-auto flex flex-col-reverse sm:flex-row justify-between items-center gap-4 mt-10 bg-white/90 border border-orange-100 rounded-2xl shadow px-6 py-5">
        <button
          onClick={clearCart}
          className="text-base font-semibold text-orange-600 hover:text-white hover:bg-orange-500 px-4 py-2 rounded-lg border border-orange-200 transition"
        >
          Vaciar carrito
        </button>
        <span className="text-2xl font-extrabold text-gray-900">
          Total: ${total.toLocaleString('es-CL')}
        </span>
      </div>

      <div className="flex gap-4 w-full max-w-3xl mx-auto mt-8 justify-center">
        <button
          type="button"
          onClick={() => setPayment('efectivo')}
          className={`flex-1 py-3 rounded-xl border-2 font-bold transition
            ${payment === 'efectivo'
              ? 'bg-orange-500 text-white border-orange-500 shadow'
              : 'bg-white text-orange-500 border-orange-200 hover:bg-orange-50'
            }`}
        >
          Efectivo
        </button>
        <button
          type="button"
          onClick={() => setPayment('tarjeta')}
          className={`flex-1 py-3 rounded-xl border-2 font-bold transition
            ${payment === 'tarjeta'
              ? 'bg-orange-500 text-white border-orange-500 shadow'
              : 'bg-white text-orange-500 border-orange-200 hover:bg-orange-50'
            }`}
        >
          Tarjeta
        </button>
      </div>

      <button
        className={`w-full max-w-3xl mx-auto mt-6 py-3 rounded-xl text-lg font-bold bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg hover:from-orange-500 hover:to-orange-600 transition
          ${!payment ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        disabled={!payment}
        onClick={() => {
          if (payment) {
            alert(`Pedido confirmado. Método de pago: ${payment}`)
          }
        }}
      >
        Confirmar pedido
      </button>
    </div>
  )
}
