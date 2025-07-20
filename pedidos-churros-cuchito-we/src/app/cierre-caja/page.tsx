'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchWithAuth } from '@/utils/api'
import ResumenModal from '../components/ResumenModal'

interface TotalPorDia {
  fecha: string
  metodo_pago: string
  total_por_dia: string
}

export default function CierreCajaPage() {
  const [fecha, setFecha] = useState('')
  const [totales, setTotales] = useState<TotalPorDia[]>([])
  const [loadingTotales, setLoadingTotales] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [efectivo, setEfectivo] = useState('')
  const [maquina, setMaquina] = useState('')
  const [pedidosYa, setPedidosYa] = useState('')
  const [salidasEfectivo, setSalidasEfectivo] = useState('')
  const [ingresosEfectivo, setIngresosEfectivo] = useState('')
  const [observacion, setObservacion] = useState('')

  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [showResumen, setShowResumen] = useState(false)
  const [step, setStep] = useState<'seleccion' | 'datos'>('seleccion')

  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) router.replace('/login')
  }, [router])

  const obtenerTotales = async () => {
    if (!fecha) return
    setLoadingTotales(true)
    setError(null)
    setTotales([])
    try {
      const res = await fetchWithAuth(`https://tienda-churroscuchito.cl/api/orders/total-por-dia?fecha=${fecha}`)
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setTotales(data)
      setStep('datos')
    } catch (err: any) {
      setError(err.message || 'Error obteniendo totales')
    } finally {
      setLoadingTotales(false)
    }
  }

  const parseAmount = (val: string | undefined) => {
    if (!val) return 0
    return Number(val.replace(/,/g, ''))
  }

  const totalEfectivoApi = parseAmount(
    totales.find(t => t.metodo_pago === 'efectivo')?.total_por_dia,
  )
  const totalMaquinaApi = parseAmount(
    totales.find(t => t.metodo_pago === 'tarjeta')?.total_por_dia,
  )

  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token')
    if (!token) return null
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || ''))
      return payload.id || payload.user_id || payload.sub || null
    } catch {
      return null
    }
  }

  const generarCierre = async (cuadrado: boolean) => {
    const userId = getUserIdFromToken()
    if (!fecha || !userId) return
    setEnviando(true)
    setError(null)
    setMensaje(null)
    try {
      const res = await fetchWithAuth('https://tienda-churroscuchito.cl/api/cierres-caja/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha,
          maquina1: Number(maquina),
          pedidos_ya: Number(pedidosYa),
          salidas_efectivo: Number(salidasEfectivo),
          ingresos_efectivo: Number(ingresosEfectivo),
          usuario_id: userId,
          observacion,
          is_active: cuadrado,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      setMensaje('Cierre generado correctamente')
    } catch (err: any) {
      setError(err.message || 'Error generando cierre')
    } finally {
      setEnviando(false)
    }
  }

  const cuadrado =
    parseFloat(efectivo || '0') === totalEfectivoApi &&
    parseFloat(maquina || '0') === totalMaquinaApi

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 py-6 px-4">
      <div className="max-w-xl mx-auto flex flex-col gap-6">
        <h1 className="text-3xl font-extrabold text-gray-900">Cierre de caja</h1>

        {step === 'seleccion' && (
          <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-3">
            <label className="font-semibold">Selecciona la fecha</label>
            <input
              type="date"
              value={fecha}
              onChange={e => setFecha(e.target.value)}
              className="border rounded p-2"
            />
            <button
              onClick={obtenerTotales}
              className="px-4 py-2 bg-orange-500 text-white rounded font-semibold mt-2"
            >
              Continuar
            </button>
          </div>
        )}

        {step === 'datos' && totales.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-3">
              <label className="font-semibold">Total efectivo</label>
              <input type="number" value={efectivo} onChange={e => setEfectivo(e.target.value)} className="border rounded p-2" />

              <label className="font-semibold">Total máquina</label>
              <input type="number" value={maquina} onChange={e => setMaquina(e.target.value)} className="border rounded p-2" />

              <label className="font-semibold">Pedidos Ya</label>
              <input type="number" value={pedidosYa} onChange={e => setPedidosYa(e.target.value)} className="border rounded p-2" />

              <label className="font-semibold">Salidas de efectivo</label>
              <input type="number" value={salidasEfectivo} onChange={e => setSalidasEfectivo(e.target.value)} className="border rounded p-2" />

              <label className="font-semibold">Ingresos de efectivo</label>
              <input type="number" value={ingresosEfectivo} onChange={e => setIngresosEfectivo(e.target.value)} className="border rounded p-2" />

              <label className="font-semibold">Observación</label>
              <textarea value={observacion} onChange={e => setObservacion(e.target.value)} className="border rounded p-2" />

              <button
                onClick={() => setShowResumen(true)}
                disabled={enviando}
                className="px-4 py-2 bg-orange-500 text-white rounded font-semibold mt-4"
              >
                Confirmar
              </button>
            </div>
            {mensaje && <span className="text-green-600 font-semibold">{mensaje}</span>}
          </div>
        )}
      </div>

      <ResumenModal
        isOpen={showResumen}
        onClose={() => {
          setShowResumen(false)
          generarCierre(cuadrado)
        }}
        datos={{
          totalSistemaEfectivo: totalEfectivoApi,
          totalSistemaMaquina: totalMaquinaApi,
          declaradoEfectivo: parseFloat(efectivo || '0'),
          declaradoMaquina: parseFloat(maquina || '0'),
          cuadrado,
        }}
      />
    </div>
  )
}
