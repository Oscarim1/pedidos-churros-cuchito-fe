'use client'
import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { HiMenu, HiX, HiShoppingCart } from 'react-icons/hi'
import logoBanner from '../assert/logo-banner.png'
import { useCart } from '../../context/CartContext'
import { useCartDrawer } from '../../context/CartDrawerContext'
import Link from 'next/link'
import { useLoading } from '../../context/LoadingContext'
import { getUserRoleFromToken } from '@/utils/auth' // IMPORTANTE

// Definimos los links con los roles que pueden verlos
const MENU_LINKS = [
  { href: '/products', label: 'Productos', roles: ['user', 'admin', 'trabajador'] },
  { href: '/asistencias', label: 'Asistencias', roles: ['trabajador', 'admin'] },
  { href: '/perfil', label: 'Perfil', roles: ['admin'] },
  { href: '/mis-pedidos', label: 'Mis pedidos', roles: ['admin'] },
  { href: '/cierre-caja', label: 'Cierre de caja', roles: ['admin'] },
  { href: '/admin', label: 'Administración', roles: ['admin'] },
  { href: '/logout', label: 'Cerrar sesión', roles: ['user', 'admin', 'trabajador'] },
]

export default function TopBar() {
  const [open, setOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)
  const { items } = useCart()
  const { openDrawer } = useCartDrawer()
  const { setLoading } = useLoading()
  const pathname = usePathname()

  // Obtenemos el rol del usuario desde el token
  const role = getUserRoleFromToken() || 'user'

  // Filtramos los links según el rol
  const filteredLinks = MENU_LINKS.filter(link =>
    link.roles.includes(role)
  )

  function handleNavigate(href: string, closeDrawer = false) {
    if (closeDrawer) setOpen(false)
    if (href !== pathname) {
      setLoading(true)
    }
  }

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
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => handleNavigate('/')}
          >
            <img src={logoBanner.src} alt="Churros Cuchito Logo" className="h-10" />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {filteredLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="font-semibold text-gray-800 hover:text-orange-500 transition"
                onClick={() => handleNavigate(link.href)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <button
              className="relative text-gray-700 hover:text-orange-500 transition"
              aria-label="Carrito"
              onClick={openDrawer}
            >
              <HiShoppingCart size={24} />
              {items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full px-1">
                  {items.reduce((acc, i) => acc + i.quantity, 0)}
                </span>
              )}
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
          {filteredLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 px-3 rounded-lg font-semibold text-gray-800 hover:bg-orange-50 hover:text-orange-600 transition"
              onClick={() => handleNavigate(link.href, true)}
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
