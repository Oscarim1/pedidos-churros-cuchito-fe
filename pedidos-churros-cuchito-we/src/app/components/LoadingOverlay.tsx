'use client'
import { useLoading } from '../../context/LoadingContext'
import logoBanner from '../assert/logo-banner.png'

export default function LoadingOverlay() {
  const { loading } = useLoading()
  if (!loading) return null
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 to-yellow-50 gap-4">
      <img src={logoBanner.src} alt="Churros Cuchito Logo" className="h-14 animate-bounce" />
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent" />
    </div>
  )
}
