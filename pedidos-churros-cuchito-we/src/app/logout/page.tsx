'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const refreshToken = localStorage.getItem('refreshToken')
    // Send logout request if refresh token exists
    if (refreshToken) {
      fetch('https://tienda-churroscuchito.cl/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      }).finally(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        router.replace('/login')
      })
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      router.replace('/login')
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100">
      <span className="text-orange-500 font-bold animate-pulse text-xl">Cerrando sesión...</span>
    </div>
  )
}
