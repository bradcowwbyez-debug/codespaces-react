import React, { useEffect, useState } from 'react'
import Profile from '../components/Profile'
import supabase from '../supabase'

export default function ProfilePage({ userId }) {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    if (!userId) return
    const fetch = async () => {
      const { data } = await supabase.from('posts').select('id, content, created_at').eq('author_id', userId).order('created_at', { ascending: false })
      setPosts(data || [])
    }
    fetch()
  }, [userId])

  return (
    <div className="p-4">
      <Profile userId={userId} />
      <div className="mt-4">
        <h3 className="text-lg font-bold">Publicaciones</h3>
        <div className="mt-3 space-y-3">
          {posts.map((p) => (
            <div key={p.id} className="tweet-card p-4">{p.content}</div>
          ))}
        </div>
      </div>
    </div>
  )
}
