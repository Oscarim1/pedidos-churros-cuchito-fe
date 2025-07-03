'use client'
import { useState, useEffect, useRef } from 'react'
import { HiMenu, HiOutlineUserCircle, HiX } from 'react-icons/hi'
import logoBanner from '../assert/logo-banner.png'

const MENU_LINKS = [
  { href: '/perfil', label: 'Perfil' },
  { href: '/mis-pedidos', label: 'Mis pedidos' },
  { href: '/admin', label: 'Administración' },
  { href: '/logout', label: 'Cerrar sesión' },
]

export default function TopBar() {
  const [open, setOpen] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

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
          <a href="/" className="flex items-center gap-2">
            <img src={logoBanner.src} alt="Churros Cuchito Logo" className="h-10" />
            <span className="font-extrabold text-lg tracking-tight text-orange-600 hidden md:inline">Churros Cuchito</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            {MENU_LINKS.map(link => (
              <a key={link.href} href={link.href} className="font-semibold text-gray-800 hover:text-orange-500 transition">
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-4">
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
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-xl transform transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Menú lateral"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <a href="/" className="flex items-center gap-2">
            <img src={logoBanner.src} alt="Churros Cuchito Logo" className="h-10" />
            <span className="font-extrabold text-lg tracking-tight text-orange-600">Churros</span>
          </a>
          <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-orange-600 transition" aria-label="Cerrar menú">
            <HiX size={28} />
          </button>
        </div>
        <nav className="flex flex-col gap-2 mt-6 px-4">
          {MENU_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="block py-2 px-3 rounded-lg font-semibold text-gray-800 hover:bg-orange-50 hover:text-orange-600 transition"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto p-4 text-xs text-gray-400">© 2025 Churros Cuchito</div>
      </aside>
    </>
  )
}
