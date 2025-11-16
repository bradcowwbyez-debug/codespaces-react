import React, { useEffect, useState } from 'react'
import supabase from '../supabase'

export default function Profile({ userId }) {
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    if (!userId) return
    const fetch = async () => {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
      setProfile(data)
    }
    fetch()
  }, [userId])

  if (!profile) return <div>Loading profile…</div>

  return (
    <div>
      <img src={profile.avatar_url} alt="avatar" width="64" height="64" />
      <h3>{profile.username}</h3>
      <p>{profile.bio}</p>
    </div>
  )
}
