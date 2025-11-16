import React, { useState } from 'react'
import supabase from '../supabase'
import Profile from '../components/Profile'

export default function SearchPage({ onProfile }) {
  const [query, setQuery] = useState('')
  const [profiles, setProfiles] = useState([])
  const [posts, setPosts] = useState([])

  const doSearch = async (ev) => {
    ev.preventDefault()
    // search profiles
    if (!query.trim()) {
      setProfiles([])
      setPosts([])
      return
    }
    const q = query.trim()
    const { data: profs } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${q}%`)
      .limit(10)

    const { data: psts } = await supabase
      .from('posts')
      .select('id, content, author_id, created_at, profiles(username)')
      .ilike('content', `%${q}%`)
      .order('created_at', { ascending: false })
      .limit(20)

    setProfiles(profs || [])
    setPosts(psts || [])
  }

  return (
    <div className="p-4">
      <form onSubmit={doSearch} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar usuarios o posts"
          className="flex-1 rounded-full border border-gray-200 dark:border-twitter-800 px-4 py-2 bg-white dark:bg-twitter-900"
        />
        <button className="btn-primary py-2 px-4">Buscar</button>
      </form>

      <section className="mt-6">
        <h3 className="text-lg font-semibold">Usuarios</h3>
        <div className="space-y-3 mt-3">
          {profiles.map((p) => (
            <button key={p.id} onClick={() => onProfile(p.id)} className="w-full text-left p-3 rounded-md hover:bg-gray-100 dark:hover:bg-twitter-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-twitter-600 text-white flex items-center justify-center">{p.username?.[0]?.toUpperCase()}</div>
              <div>
                <div className="font-semibold">{p.username}</div>
                <div className="text-sm text-gray-500">{p.bio}</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h3 className="text-lg font-semibold">Posts</h3>
        <div className="space-y-3 mt-3">
          {posts.map((pt) => (
            <div key={pt.id} className="tweet-card p-4">
              <div className="text-sm text-gray-500">{pt.profiles?.username}</div>
              <div className="mt-2">{pt.content}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
