export default function use2fa() {
  const base = import.meta.env.VITE_TOTP_URL || ''

  async function verify({ userId, token }) {
    const url = `${base || ''}/api/verify-totp`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, token })
    })
    if (!res.ok) {
      try {
        return await res.json()
      } catch (e) {
        return { ok: false, error: 'Server error' }
      }
    }
    return await res.json()
  }

  return { verify }
}
