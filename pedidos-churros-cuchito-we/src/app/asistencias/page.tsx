'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { fetchWithAuth } from '@/utils/api'
import { getUserIdFromToken, getUserRoleFromToken } from '@/utils/auth'
import { useLoading } from '../../context/LoadingContext'

interface Asistencia {
  id: string
  usuario_id: string
  fecha: string
  horario_entrada: string | null
  horario_salida: string | null
  horario_inicio_colacion: string | null
  horario_fin_colacion: string | null
  created_at: string
  updated_at: string
}

type Estado =
  | 'sin_entrada'
  | 'en_jornada'
  | 'en_colacion'
  | 'colacion_terminada'
  | 'finalizada'

export default function AsistenciasPage() {
  const [asistencia, setAsistencia] = useState<Asistencia | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { setLoading } = useLoading()
  const router = useRouter()

  useEffect(() => {
    const role = getUserRoleFromToken()
    if (role !== 'admin' && role !== 'trabajador') {
      router.replace('/login')
      return
    }

    const userId = getUserIdFromToken()
    if (!userId) {
      router.replace('/login')
      return
    }

    const today = new Date().toISOString().split('T')[0]
    setLoading(true)
    fetchWithAuth(`https://tienda-churroscuchito.cl/api/asistencias/${today}/${userId}`)
      .then(async (res) => {
        if (res.status === 404) return null
        if (!res.ok) throw new Error(await res.text())
        const data = await res.json()
        if ('message' in data) return null
        return data as Asistencia
      })
      .then((data) => {
        if (
          data &&
          data.horario_entrada &&
          data.horario_inicio_colacion &&
          data.horario_fin_colacion &&
          data.horario_salida
        ) {
          setError(
            `Ya registraste tu asistencia: entrada ${data.horario_entrada}, inicio colación ${data.horario_inicio_colacion}, fin colación ${data.horario_fin_colacion}, salida ${data.horario_salida}`,
          )
        }
        setAsistencia(data)
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false))
  }, [router, setLoading])

  const estado: Estado = (() => {
    const a = asistencia
    if (!a || !a.horario_entrada) return 'sin_entrada'
    if (a.horario_salida) return 'finalizada'
    if (a.horario_inicio_colacion && !a.horario_fin_colacion) return 'en_colacion'
    if (a.horario_inicio_colacion && a.horario_fin_colacion && !a.horario_salida)
      return 'colacion_terminada'
    return 'en_jornada'
  })()

  const handleAction = async (tipo: string) => {
    if (asistencia) {
      if (
        asistencia.horario_entrada &&
        asistencia.horario_inicio_colacion &&
        asistencia.horario_fin_colacion &&
        asistencia.horario_salida
      ) {
        setError(
          `Ya registraste tu asistencia: entrada ${asistencia.horario_entrada}, inicio colación ${asistencia.horario_inicio_colacion}, fin colación ${asistencia.horario_fin_colacion}, salida ${asistencia.horario_salida}`,
        )
        return
      }

      if (tipo === 'horario_entrada' && asistencia.horario_entrada) {
        setError(`Ya marcaste tu entrada a las ${asistencia.horario_entrada}`)
        return
      }
      if (tipo === 'horario_inicio_colacion' && asistencia.horario_inicio_colacion) {
        setError(
          `Ya marcaste el inicio de colación a las ${asistencia.horario_inicio_colacion}`,
        )
        return
      }
      if (tipo === 'horario_fin_colacion' && asistencia.horario_fin_colacion) {
        setError(
          `Ya marcaste el fin de colación a las ${asistencia.horario_fin_colacion}`,
        )
        return
      }
      if (tipo === 'horario_salida' && asistencia.horario_salida) {
        setError(`Ya marcaste tu salida a las ${asistencia.horario_salida}`)
        return
      }
    }

    const userId = getUserIdFromToken()
    const today = new Date().toISOString().split('T')[0]
    setLoading(true)
    setError(null)
    try {
      const res = await fetchWithAuth(
        !asistencia && tipo === 'horario_entrada'
          ? 'https://tienda-churroscuchito.cl/api/asistencias'
          : `https://tienda-churroscuchito.cl/api/asistencias/usuario/${userId}`,
        {
          method: !asistencia && tipo === 'horario_entrada' ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            !asistencia && tipo === 'horario_entrada'
              ? { usuario_id: userId, tipo }
              : { tipo, fecha: today },
          ),
        },
      )
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setAsistencia(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-100 py-8 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
        <h1 className="text-3xl font-extrabold text-center text-gray-900">Asistencia</h1>
        <div className="grid gap-2 text-gray-700">
          <div>
            Entrada: <b>{asistencia?.horario_entrada ?? '--'}</b>
          </div>
          <div>
            Inicio colación: <b>{asistencia?.horario_inicio_colacion ?? '--'}</b>
          </div>
          <div>
            Fin colación: <b>{asistencia?.horario_fin_colacion ?? '--'}</b>
          </div>
          <div>
            Salida: <b>{asistencia?.horario_salida ?? '--'}</b>
          </div>
        </div>
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <div className="flex flex-col gap-3 mt-4">
          {estado === 'sin_entrada' && (
            <button
              onClick={() => handleAction('horario_entrada')}
              className="w-full py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition"
            >
              Marcar entrada
            </button>
          )}
          {estado === 'en_jornada' && (
            <>
              <button
                onClick={() => handleAction('horario_inicio_colacion')}
                className="w-full py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition"
              >
                Iniciar colación
              </button>
              <button
                onClick={() => handleAction('horario_salida')}
                className="w-full py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition"
              >
                Marcar salida
              </button>
            </>
          )}
          {estado === 'en_colacion' && (
            <button
              onClick={() => handleAction('horario_fin_colacion')}
              className="w-full py-2 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition"
            >
              Terminar colación
            </button>
          )}
          {estado === 'colacion_terminada' && (
            <button
              onClick={() => handleAction('horario_salida')}
              className="w-full py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition"
            >
              Marcar salida
            </button>
          )}
          {estado === 'finalizada' && (
            <div className="text-center text-gray-600 font-semibold">
              Asistencia finalizada
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

