'use client'
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { useRouter } from 'next/navigation'

interface Props {
  isOpen: boolean
  onClose: () => void
  datos: {
    totalSistemaEfectivo: number
    totalSistemaMaquina: number
    declaradoEfectivo: number
    declaradoMaquina: number
    cuadrado: boolean
  }
}

export default function ResumenModal({ isOpen, onClose, datos }: Props) {
  const {
    totalSistemaEfectivo,
    totalSistemaMaquina,
    declaradoEfectivo,
    declaradoMaquina,
    cuadrado,
  } = datos

  const router = useRouter()

  const handleClose = () => {
    onClose()
    // Redirige a la misma página para reiniciar el flujo
    router.push('/cierre-caja')
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto flex items-center justify-center px-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl">
              <Dialog.Title className="text-xl font-bold text-gray-800 mb-4">
                Resumen del cierre de caja
              </Dialog.Title>

              <div className="space-y-2 text-sm text-gray-700">
                <div>
                  <strong>Efectivo sistema:</strong> ${totalSistemaEfectivo.toLocaleString('es-CL')}
                </div>
                <div>
                  <strong>Efectivo declarado:</strong> ${declaradoEfectivo.toLocaleString('es-CL')}
                </div>
                <div>
                  <strong>Diferencia efectivo:</strong>{' '}
                  ${(declaradoEfectivo - totalSistemaEfectivo).toLocaleString('es-CL')}
                </div>

                <div className="mt-2">
                  <strong>Máquina sistema:</strong> ${totalSistemaMaquina.toLocaleString('es-CL')}
                </div>
                <div>
                  <strong>Máquina declarada:</strong> ${declaradoMaquina.toLocaleString('es-CL')}
                </div>
                <div>
                  <strong>Diferencia máquina:</strong>{' '}
                  ${(declaradoMaquina - totalSistemaMaquina).toLocaleString('es-CL')}
                </div>
              </div>

              <div
                className={`mt-6 text-center text-lg font-bold ${
                  cuadrado ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {cuadrado ? '✅ ¡La caja cuadró!' : '❌ La caja no cuadró'}
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  onClick={handleClose}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-2 rounded transition"
                >
                  Continuar
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
