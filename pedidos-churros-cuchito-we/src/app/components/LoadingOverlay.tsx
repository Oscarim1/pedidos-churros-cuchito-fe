'use client'
import { useLoading } from '../../context/LoadingContext'

export default function LoadingOverlay() {
  const { loading } = useLoading()
  if (!loading) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
