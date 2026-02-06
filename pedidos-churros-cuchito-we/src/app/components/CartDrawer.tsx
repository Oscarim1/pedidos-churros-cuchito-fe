'use client'
import { useEffect, useRef, useState } from 'react'
import { HiX, HiTrash, HiMinus, HiPlus } from 'react-icons/hi'
import { useRouter } from 'next/navigation'
import { useCart } from '../../context/CartContext'
import { useCartDrawer } from '../../context/CartDrawerContext'
import { fetchWithAuth } from '@/utils/api'
import { generatePDF, Order } from '@/utils/pdfUtils'
import { getUserIdFromToken } from '@/utils/auth'
import { format } from 'date-fns'

export default function CartDrawer() {
  const { items, addItem, removeItem, removeOne, clearCart } = useCart()
  const { isOpen, closeDrawer } = useCartDrawer()
  const router = useRouter()
  const drawerRef = useRef<HTMLDivElement>(null)

  const [payment, setPayment] = useState<'efectivo' | 'tarjeta' | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const total = items.reduce((acc, i) => acc + i.price * i.quantity, 0)

  // Close on Escape key or click outside
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeDrawer()
    }
    function handleClickOutside(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        closeDrawer()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeDrawer])

  // Reset state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setPayment(null)
      setError(null)
      setSuccess(false)
    }
  }, [isOpen])

  function generatePDFs(order: Order) {
    const now = format(new Date(), 'yyyyMMdd_HHmm')
    const churros = order.order_items.filter((i) =>
      i.products.category.toLowerCase().includes('churros')
    )
    const others = order.order_items.filter(
      (i) => !i.products.category.toLowerCase().includes('churros')
    )

    if (churros.length) {
      const doc = generatePDF(order, churros, 'Churros Cuchito')
      doc.save(`pedido_${order.order_number}_churros_${now}.pdf`)
    }

    if (others.length) {
      const doc = generatePDF(order, others, 'Churros Cuchito')
      doc.save(`pedido_${order.order_number}_otros_${now}.pdf`)
    }
  }

  const handleConfirm = async () => {
    if (!payment || loading) return
    setLoading(true)
    setError(null)
    try {
      const userId = getUserIdFromToken()
      const orderRes = await fetchWithAuth('https://tienda-churroscuchito.cl/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          guest_name: null,
          total,
          points_used: 0,
          points_earned: 0,
          metodo_pago: payment,
          status: 'complete',
          is_active: true,
        }),
      })
      if (!orderRes.ok) {
        const txt = await orderRes.text()
        throw new Error(txt || 'Error creando orden')
      }
      const orderData = await orderRes.json()
      const orderId = orderData.id

      await Promise.all(
        items.map((item) =>
          fetchWithAuth('https://tienda-churroscuchito.cl/api/order-items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: orderId,
              product_id: item.id,
              quantity: item.quantity,
              price: item.price,
              is_active: true,
            }),
          }).then(async (res) => {
            if (!res.ok) {
              const t = await res.text()
              throw new Error(t || 'Error creando item')
            }
          })
        )
      )

      const order: Order = {
        id: orderId,
        order_number: orderData.order_number ?? orderId,
        total,
        created_at: orderData.created_at ?? new Date().toISOString(),
        order_items: items.map((i) => ({
          id: i.id,
          quantity: i.quantity,
          price: i.price,
          products: { name: i.name, category: i.category, points: 0 },
        })),
      }

      setSuccess(true)
      generatePDFs(order)

      setTimeout(() => {
        setSuccess(false)
        closeDrawer()
        clearCart()
        router.push('/products')
      }, 2000)
    } catch (err) {
      setError((err as Error).message || 'Error procesando pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!isOpen}
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 flex flex-col
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-label="Carrito de compras"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b bg-gradient-to-r from-orange-50 to-yellow-50">
          <h2 className="text-xl font-extrabold text-gray-900">🛒 Carrito</h2>
          <button
            onClick={closeDrawer}
            className="text-gray-500 hover:text-orange-600 transition p-1"
            aria-label="Cerrar carrito"
          >
            <HiX size={28} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {success ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <svg height={60} width={60} viewBox="0 0 24 24" fill="none">
                <circle cx={12} cy={12} r={12} fill="#4ade80" />
                <path
                  d="M8 12l2.5 2.5L16 9"
                  stroke="#fff"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h3 className="text-2xl font-bold text-gray-800">¡Pedido confirmado!</h3>
              <p className="text-gray-500 text-center">
                Tus comprobantes están siendo descargados...
              </p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <span className="text-6xl">🛒</span>
              <p className="text-lg font-semibold text-gray-500">Tu carrito está vacío</p>
              <button
                onClick={closeDrawer}
                className="px-6 py-2 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex gap-3"
                >
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-14 h-14 object-cover rounded-lg border border-orange-50"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">
                      ${item.price.toLocaleString('es-CL')} c/u
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => removeOne(item.id)}
                        className="bg-orange-100 hover:bg-orange-200 text-orange-500 rounded-full p-1.5 transition"
                        aria-label="Quitar uno"
                      >
                        <HiMinus size={16} />
                      </button>
                      <span className="font-bold text-gray-900 min-w-[20px] text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          addItem({
                            id: item.id,
                            name: item.name,
                            price: item.price,
                            image_url: item.image_url,
                            category: item.category,
                          })
                        }
                        className="bg-orange-100 hover:bg-orange-200 text-orange-500 rounded-full p-1.5 transition"
                        aria-label="Agregar uno"
                      >
                        <HiPlus size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <span className="font-bold text-gray-800 text-sm">
                      ${(item.price * item.quantity).toLocaleString('es-CL')}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-600 transition p-1"
                      aria-label="Eliminar producto"
                    >
                      <HiTrash size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer - Checkout */}
        {!success && items.length > 0 && (
          <div className="border-t bg-white p-4 space-y-4">
            {/* Clear cart */}
            <button
              onClick={clearCart}
              className="w-full text-sm font-semibold text-orange-600 hover:text-orange-700 transition"
            >
              Vaciar carrito
            </button>

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-extrabold text-gray-900">
                ${total.toLocaleString('es-CL')}
              </span>
            </div>

            {/* Payment methods */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPayment('efectivo')}
                className={`py-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition text-sm
                  ${
                    payment === 'efectivo'
                      ? 'bg-orange-500 text-white border-orange-500 shadow'
                      : 'bg-white text-orange-500 border-orange-200 hover:bg-orange-50'
                  }`}
              >
                💵 Efectivo
              </button>
              <button
                type="button"
                onClick={() => setPayment('tarjeta')}
                className={`py-3 rounded-xl border-2 font-bold flex items-center justify-center gap-2 transition text-sm
                  ${
                    payment === 'tarjeta'
                      ? 'bg-orange-500 text-white border-orange-500 shadow'
                      : 'bg-white text-orange-500 border-orange-200 hover:bg-orange-50'
                  }`}
              >
                💳 Tarjeta
              </button>
            </div>

            {/* Confirm button */}
            <button
              className={`w-full py-4 rounded-xl text-base font-bold bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg hover:from-orange-500 hover:to-orange-600 transition
                ${!payment || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!payment || loading}
              onClick={handleConfirm}
            >
              {loading ? 'Procesando...' : 'Confirmar pedido'}
            </button>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          </div>
        )}
      </aside>
    </>
  )
}
