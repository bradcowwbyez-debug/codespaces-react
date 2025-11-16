import React from 'react'
import PostComposer from '../components/PostComposer'
import { X } from 'lucide-react'

export default function CreatePost({ user, onClose, onPosted }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="w-full max-w-2xl bg-white dark:bg-twitter-900 rounded-2xl shadow-2xl p-6 animate-slide-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Nuevo post</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-800">
            <X size={20} />
          </button>
        </div>

        <PostComposer user={user} onPosted={() => { onPosted && onPosted(); onClose && onClose() }} />
      </div>
    </div>
  )
}
