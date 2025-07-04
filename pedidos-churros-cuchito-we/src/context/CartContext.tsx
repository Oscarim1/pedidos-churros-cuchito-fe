'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image_url?: string
}

interface CartContextProps {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextProps | undefined>(undefined)

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('cart')
      if (stored) setItems(JSON.parse(stored))
    } catch {}
  }, [])

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items))
  }, [items])

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const clearCart = () => setItems([])

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}
