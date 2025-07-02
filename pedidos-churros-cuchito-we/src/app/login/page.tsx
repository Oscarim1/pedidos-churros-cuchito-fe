'use client'
import { useState, useEffect } from 'react'

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false)
  const [loading, setLoading] = useState(true)

  // login form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // register form
  const [rEmail, setREmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [rut, setRut] = useState('')
  const [rPassword, setRPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setResult(null)
    try {
      const res = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Request failed')
      }
      const data = await res.json()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    }
  }

  function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPasswordError('')
    if (rPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden')
      return
    }
    // Aquí iría la lógica para registrarse en el backend
    // Por ahora sólo limpiamos el formulario
    setREmail('')
    setFullName('')
    setRut('')
    setRPassword('')
    setConfirmPassword('')
    alert('Registro simulado')
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20(1)-toLtR7HGyMAUagARfyxSCzZOQSI06L.png"
          alt="Churros Cuchito Logo"
          className="w-24 h-24"
        />
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto p-4">
          <a href="/">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo%20(1)-toLtR7HGyMAUagARfyxSCzZOQSI06L.png"
              alt="Churros Cuchito Logo"
              className="h-10"
            />
          </a>
        </div>
      </nav>
      <main className="flex flex-col items-center justify-center flex-grow p-4">
        <div className="bg-white w-full max-w-md p-6 rounded-md shadow">
          <h2 className="text-xl font-semibold mb-4 text-center">
            {isRegister ? 'Registrarse' : 'Iniciar sesión'}
          </h2>
          {isRegister ? (
            <form onSubmit={handleRegister} className="space-y-4">
              <input
                type="email"
                className="w-full border p-2 rounded"
                placeholder="Correo electrónico"
                value={rEmail}
                onChange={e => setREmail(e.target.value)}
                required
              />
              <input
                type="text"
                className="w-full border p-2 rounded"
                placeholder="Nombre y apellido"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
              />
              <input
                type="text"
                className="w-full border p-2 rounded"
                placeholder="RUT"
                value={rut}
                onChange={e => setRut(e.target.value)}
                required
              />
              <input
                type="password"
                className="w-full border p-2 rounded"
                placeholder="Contraseña"
                value={rPassword}
                onChange={e => setRPassword(e.target.value)}
                required
              />
              <input
                type="password"
                className="w-full border p-2 rounded"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded"
              >
                Registrarse
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                className="w-full border p-2 rounded"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                className="w-full border p-2 rounded"
                placeholder="Contraseña"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded"
              >
                Iniciar sesión
              </button>
            </form>
          )}
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          {result && (
            <pre className="bg-gray-100 p-2 text-left whitespace-pre-wrap mt-2 overflow-x-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          )}
          <div className="text-center mt-4">
            <button
              className="text-sm text-orange-500 hover:underline"
              onClick={() => {
                setIsRegister(!isRegister)
                setPasswordError('')
              }}
            >
              {isRegister
                ? '¿Ya tienes cuenta? Inicia sesión'
                : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
