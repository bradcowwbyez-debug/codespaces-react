import { useState } from 'react'
import use2fa from '../hooks/use2fa'

export default function TwoFactorForm({ userId, onSuccess }) {
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { verify } = use2fa()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await verify({ userId, token })
      if (res && res.ok) {
        setToken('')
        onSuccess && onSuccess()
      } else {
        setError(res?.error || 'Código inválido')
      }
    } catch (err) {
      setError(err.message || 'Error al verificar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-gray-600 dark:text-gray-400">Introduce el código TOTP desde tu app de autenticación.</p>
      <div className="flex gap-2">
        <input
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="123456"
          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-twitter-700 bg-white dark:bg-twitter-800 text-gray-900 dark:text-white"
        />
        <button
          type="submit"
          disabled={loading || token.length < 4}
          className="px-4 py-2 rounded-lg bg-twitter-500 text-white disabled:opacity-50"
        >
          {loading ? 'Verificando...' : 'Verificar'}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  )
}
