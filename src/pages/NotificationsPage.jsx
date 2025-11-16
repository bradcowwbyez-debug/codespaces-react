import React, { useEffect, useState } from 'react'
import supabase from '../supabase'

export default function NotificationsPage({ user }) {
  const [notifs, setNotifs] = useState([])

  useEffect(() => {
    if (!user) return

    const fetch = async () => {
      // fetch likes on posts authored by the user
      const { data } = await supabase
        .from('likes')
        .select('id, created_at, profiles(username), posts(content, author_id)')
        .filter('posts.author_id', 'eq', user.id)
        .order('created_at', { ascending: false })
      setNotifs(data || [])
    }
    fetch()
  }, [user])

  if (!user) return <div className="p-4">Inicia sesión para ver notificaciones</div>

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Notificaciones</h2>
      {notifs.length === 0 && <div className="text-gray-500">No hay notificaciones</div>}
      {notifs.map((n) => (
        <div key={n.id} className="tweet-card p-4">
          <div className="text-sm text-gray-500">{n.profiles?.username} le dio like a tu post</div>
          <div className="mt-2 text-base">{n.posts?.content}</div>
        </div>
      ))}
    </div>
  )
}
