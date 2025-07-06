'use client'
import { useState, useEffect, useRef } from 'react'
import { HiMenu, HiOutlineUserCircle, HiX, HiShoppingCart } from 'react-icons/hi'
import logoBanner from '../assert/logo-banner.png'
import { useCart } from '../../context/CartContext'
import Link from 'next/link'
import { useLoading } from '../../context/LoadingContext'

const MENU_LINKS = [
  { href: '/products', label: 'Productos' },
  { href: '/perfil', label: 'Perfil' },
  { href: '/mis-pedidos', label: 'Mis pedidos' },
  { href: '/admin', label: 'Administración' },
  { href: '/logout', label: 'Cerrar sesión' },
]

export default function TopBar() {
  const [open, setOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const { items } = useCart()
  const { setLoading } = useLoading()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    function handleClickOutside(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <>
      <header className="w-full bg-white shadow sticky top-0 z-30">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2" onClick={() => setLoading(true)}>
            <img src={logoBanner.src} alt="Churros Cuchito Logo" className="h-10" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {MENU_LINKS.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="font-semibold text-gray-800 hover:text-orange-500 transition"
                onClick={() => setLoading(true)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative text-gray-700 hover:text-orange-500 transition" aria-label="Carrito" onClick={() => setLoading(true)}>
              <HiShoppingCart size={24} />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full px-1">
                  {items.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
              )}
            </Link>
            <button className="text-gray-700 hover:text-orange-500 transition" aria-label="Usuario">
              <HiOutlineUserCircle size={26} />
            </button>
            <button
              className="md:hidden text-gray-700 hover:text-orange-500 transition"
              aria-label="Menú"
              onClick={() => setOpen(true)}
            >
              <HiMenu size={28} />
            </button>
          </div>
        </nav>
      </header>

      <div
        className={`fixed inset-0 z-40 bg-black bg-opacity-30 transition-opacity duration-200
          ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!open}
      />

      <aside
        ref={drawerRef}
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-xl transform transition-transform duration-300
          ${open ? 'translate-x-0' : 'translate-x-full'}`}
        aria-label="Menú lateral"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-orange-600 transition" aria-label="Cerrar menú">
            <HiX size={28} />
          </button>
        </div>
        <nav className="flex flex-col gap-2 mt-6 px-4">
          {MENU_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 px-3 rounded-lg font-semibold text-gray-800 hover:bg-orange-50 hover:text-orange-600 transition"
              onClick={() => {
                setOpen(false)
                setLoading(true)
              }}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto p-4 text-xs text-gray-400">© 2025 Churros Cuchito</div>
      </aside>
    </>
  )
}
