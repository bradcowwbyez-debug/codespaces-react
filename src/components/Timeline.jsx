import React, { useEffect, useState } from 'react'
import supabase from '../supabase'
import { MessageCircle, Repeat, Heart, Share2 } from 'lucide-react'

export default function Timeline({ onOpenProfile }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPosts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('posts')
      .select('id, content, created_at, author_id, profiles(username, avatar_url)')
      .order('created_at', { ascending: false })

    setLoading(false)

    if (error) return console.error(error)
    setPosts(data || [])
  }

  // Helper function to format time
  function formatTime(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSecs < 60) return 'ahora'
    if (diffMins < 60) return `${diffMins}m`
    if (diffHours < 24) return `${diffHours}h`
    if (diffDays < 7) return `${diffDays}d`
    return date.toLocaleDateString('es-ES')
  }

  useEffect(() => {
    fetchPosts()

    // realtime updates
    const postsSub = supabase
      .channel('public:posts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => {
        fetchPosts()
      })
      .subscribe()

    return () => {
      postsSub.unsubscribe()
    }
  }, [])

  return (
    <div className="w-full bg-white dark:bg-twitter-900 border-r border-gray-200 dark:border-twitter-800">
      {/* Header */}
      {/** Removed duplicate page header so only `Navbar` acts as the single visible header */}

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin">
            <span className="text-4xl">🔄</span>
          </div>
        </div>
      )}

      {/* Posts list */}
      <div className="divide-y divide-gray-200 dark:divide-twitter-800">
        {/* skeleton if loading */}
        {loading && (
          <div className="p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 dark:bg-twitter-800 rounded-md p-4 mb-4 animate-pulse-subtle">
                <div className="h-4 w-1/4 bg-gray-200 dark:bg-twitter-700 rounded mb-2"></div>
                <div className="h-6 w-full bg-gray-200 dark:bg-twitter-700 rounded"></div>
              </div>
            ))}
          </div>
        )}
        {posts.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <span className="text-4xl mb-3">📝</span>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              No hay posts todavía. ¡Sé el primero en publicar!
            </p>
          </div>
        )}

        {posts.map((p, idx) => (
          <div
            key={p.id}
            className="tweet-card border-0 rounded-none p-4 hover:bg-gray-50 dark:hover:bg-twitter-800 cursor-pointer transition-colors duration-150 animate-fade-in"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            <div>
              {/* User info */}
              <div className="flex gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-twitter-400 to-twitter-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {(p.profiles?.username || p.author_id)?.[0]?.toUpperCase() ?? '?'}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                      <strong onClick={() => onOpenProfile && onOpenProfile(p.author_id)} className="text-gray-900 dark:text-white font-bold hover:underline cursor-pointer">
                        {p.profiles?.username || 'Usuario'}
                    </strong>
                    <span className="text-gray-500 dark:text-gray-600 text-sm">
                      @{(p.profiles?.username || 'user').toLowerCase().replace(/[^a-z0-9]/g, '')}
                    </span>
                    <span className="text-gray-500 dark:text-gray-600 text-sm">
                      · {formatTime(p.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Post content */}
              <p className="text-gray-900 dark:text-white text-base leading-6 mb-3 whitespace-pre-wrap break-words">
                {p.content}
              </p>

              {/* Interaction buttons */}
              <div className="flex justify-between text-gray-500 dark:text-gray-600 max-w-xs text-sm mt-3 pt-3 border-t border-gray-100 dark:border-twitter-800">
                <button className="hover:text-twitter-600 hover:bg-twitter-50 dark:hover:bg-twitter-900 rounded-full px-3 py-2 transition-colors duration-150 group flex items-center gap-2">
                  <MessageCircle size={16} />
                  <span className="group-hover:text-twitter-600 text-xs">0</span>
                </button>
                <button className="hover:text-twitter-600 hover:bg-twitter-50 dark:hover:bg-twitter-900 rounded-full px-3 py-2 transition-colors duration-150 group flex items-center gap-2">
                  <Repeat size={16} />
                  <span className="group-hover:text-twitter-600 text-xs">0</span>
                </button>
                <button className="hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900 dark:hover:bg-opacity-20 rounded-full px-3 py-2 transition-colors duration-150 group flex items-center gap-2">
                  <Heart size={16} />
                  <span className="group-hover:text-red-600 text-xs">0</span>
                </button>
                <button className="hover:text-twitter-600 hover:bg-twitter-50 dark:hover:bg-twitter-900 rounded-full px-3 py-2 transition-colors duration-150">
                  <Share2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
