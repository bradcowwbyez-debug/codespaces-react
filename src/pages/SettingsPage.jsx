import React, { useEffect, useState } from 'react'
import supabase from '../supabase'

export default function SettingsPage({ user }) {
  const [profile, setProfile] = useState({ username: '', bio: '', avatar_url: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) setProfile({ username: data.username || '', bio: data.bio || '', avatar_url: data.avatar_url || '' })
    }
    fetch()
  }, [user])

  const save = async (ev) => {
    ev.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('profiles').upsert({ id: user.id, ...profile })
    setSaving(false)
    if (error) return alert(error.message)
    alert('Cambios guardados')
  }

  if (!user) return <div className="p-4">Inicia sesión para editar ajustes</div>

  return (
    <form onSubmit={save} className="space-y-4 p-4">
      <h2 className="text-xl font-bold">Ajustes</h2>
      <div>
        <label className="block text-sm">Nombre de usuario</label>
        <input value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} className="w-full rounded-md p-2 border" />
      </div>
      <div>
        <label className="block text-sm">Bio</label>
        <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="w-full rounded-md p-2 border" />
      </div>
      <div>
        <label className="block text-sm">Avatar URL</label>
        <input value={profile.avatar_url} onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })} className="w-full rounded-md p-2 border" />
      </div>
      <div>
        <button type="submit" disabled={saving} className="btn-primary py-2 px-4">Guardar</button>
      </div>
    </form>
  )
}
