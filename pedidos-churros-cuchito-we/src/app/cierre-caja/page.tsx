'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchWithAuth } from '@/utils/api'
import ResumenModal from '../components/ResumenModal'
import AlertaModal from '../components/AlertaModal'
import { useLoading } from '../../context/LoadingContext'


interface TotalPorDia {
  fecha: string
  metodo_pago: string
  total_por_dia: string
}

const clpFormatter = new Intl.NumberFormat('es-CL')
const cleanAmount = (val: string) => val.replace(/\./g, '').replace(/\$/g, '').replace(/\s/g, '').trim()

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

  const [alertaAbierta, setAlertaAbierta] = useState(false)
  const [mensajeAlerta, setMensajeAlerta] = useState('')

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

      if (res.status === 409) {
        setMensajeAlerta('Ya existe un cierre de caja para esta fecha.')
        setAlertaAbierta(true)
        return
      }

      if (!res.ok) throw new Error(await res.text())

      const data = await res.json()

      if (Array.isArray(data) && data.length === 0) {
        setMensajeAlerta('No hay datos de ventas para esta fecha.')
        setAlertaAbierta(true)
        return
      }

      setTotales(data)
      setStep('datos')
    } catch (err: any) {
      setError(err.message || 'Error obteniendo totales')
    } finally {
      setLoadingTotales(false)
    }
  }

  const parseCLPAmount = (val: string | undefined) => {
    if (!val) return 0
    return Number(val.replace(/,/g, '').trim())
  }

  const parseUserAmount = (val: string | undefined) => {
    if (!val) return 0
    return parseFloat(val.replace(/\./g, '').replace(',', '.'))
  }

  const totalEfectivoApi = parseCLPAmount(
    totales.find(t => t.metodo_pago === 'efectivo')?.total_por_dia,
  )
  const totalMaquinaApi = parseCLPAmount(
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

  const validarDatos = () => {
    const campos = [efectivo, maquina, pedidosYa, salidasEfectivo, ingresosEfectivo]
    const todosCompletos = campos.every(val => val.trim() !== '')
    const todosValidos = campos.every(val => parseUserAmount(val) >= 0)

    if (!todosCompletos) {
      setMensajeAlerta('Debes completar todos los campos numéricos.')
      setAlertaAbierta(true)
      return false
    }

    if (!todosValidos) {
      setMensajeAlerta('Los montos deben ser mayores o iguales a 0.')
      setAlertaAbierta(true)
      return false
    }

    return true
  }

  const generarCierre = async (cuadrado: boolean) => {
    const userId = getUserIdFromToken()
    if (!fecha || !userId) return

    if (!validarDatos()) return

    setEnviando(true)
    setError(null)
    setMensaje(null)
    try {
      const res = await fetchWithAuth('https://tienda-churroscuchito.cl/api/cierres-caja/generar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha,
          monto_declarado_efectivo: parseUserAmount(efectivo),
          monto_declarado_tarjeta: parseUserAmount(maquina),
          monto_declarado_pedidos_ya: parseUserAmount(pedidosYa),
          salidas_efectivo: parseUserAmount(salidasEfectivo),
          ingresos_efectivo: parseUserAmount(ingresosEfectivo),
          usuario_id: userId,
          observacion,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      setShowResumen(true)
    } catch (err: any) {
      setError(err.message || 'Error generando cierre')
    } finally {
      setEnviando(false)
    }
  }

  const cuadrado =
    parseUserAmount(efectivo) === totalEfectivoApi &&
    parseUserAmount(maquina) === totalMaquinaApi

  const handleCloseResumen = () => {
    setShowResumen(false)
    setTimeout(() => {
      setStep('seleccion')
      setTotales([])
      setEfectivo('')
      setMaquina('')
      setPedidosYa('')
      setSalidasEfectivo('')
      setIngresosEfectivo('')
      setObservacion('')
      setMensaje(null)
    }, 100)
  }

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
              <input type="text" value={clpFormatter.format(Number(cleanAmount(efectivo)) || 0)} onChange={e => setEfectivo(cleanAmount(e.target.value))} className="border rounded p-2" />

              <label className="font-semibold">Total máquina</label>
              <input type="text" value={clpFormatter.format(Number(cleanAmount(maquina)) || 0)} onChange={e => setMaquina(cleanAmount(e.target.value))} className="border rounded p-2" />

              <label className="font-semibold">Pedidos Ya</label>
              <input type="text" value={clpFormatter.format(Number(cleanAmount(pedidosYa)) || 0)} onChange={e => setPedidosYa(cleanAmount(e.target.value))} className="border rounded p-2" />

              <label className="font-semibold">Salidas de efectivo</label>
              <input type="text" value={clpFormatter.format(Number(cleanAmount(salidasEfectivo)) || 0)} onChange={e => setSalidasEfectivo(cleanAmount(e.target.value))} className="border rounded p-2" />

              <label className="font-semibold">Ingresos de efectivo</label>
              <input type="text" value={clpFormatter.format(Number(cleanAmount(ingresosEfectivo)) || 0)} onChange={e => setIngresosEfectivo(cleanAmount(e.target.value))} className="border rounded p-2" />

              <label className="font-semibold">Observación</label>
              <textarea value={observacion} onChange={e => setObservacion(e.target.value)} className="border rounded p-2" />

              <button
                onClick={() => {
                  if (validarDatos()) {
                    generarCierre(cuadrado)
                  }
                }}
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
        onClose={handleCloseResumen}
        datos={{
          totalSistemaEfectivo: totalEfectivoApi,
          totalSistemaMaquina: totalMaquinaApi,
          declaradoEfectivo: parseUserAmount(efectivo),
          declaradoMaquina: parseUserAmount(maquina),
          cuadrado,
        }}
      />

      <AlertaModal
        isOpen={alertaAbierta}
        mensaje={mensajeAlerta}
        onClose={() => setAlertaAbierta(false)}
      />
    </div>
  )
}
