import React from 'react'
import { Home, Search, Bell, Mail, User, Plus } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function MobileNav({ page, setPage, user }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-white dark:bg-twitter-900 border-t border-gray-200 dark:border-twitter-800 md:hidden">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-2">
        <button className="flex-1 flex flex-col items-center justify-center p-2 text-gray-600 dark:text-gray-300" onClick={() => setPage('feed')}>
          <Home size={20} />
          <span className="text-xs">Inicio</span>
        </button>

        <button className="flex-1 flex flex-col items-center justify-center p-2 text-gray-600 dark:text-gray-300" onClick={() => setPage('search')}>
          <Search size={20} />
          <span className="text-xs">Explorar</span>
        </button>

        <button
          className="flex-1 flex items-center justify-center bg-twitter-600 text-white rounded-full w-12 h-12 -mt-10 shadow-2xl"
          onClick={() => setPage('compose')}
          title="Crear post"
        >
          <Plus size={20} />
        </button>

        <button className="flex-1 flex flex-col items-center justify-center p-2 text-gray-600 dark:text-gray-300" onClick={() => setPage('notifications')}>
          <Bell size={20} />
          <span className="text-xs">Notifs</span>
        </button>

        <button className="flex-1 flex flex-col items-center justify-center p-2 text-gray-600 dark:text-gray-300" onClick={() => setPage('messages')}>
          <Mail size={20} />
          <span className="text-xs">Mensajes</span>
        </button>
        {/* small theme toggle visible on mobile extra option */}
        <div className="absolute right-4 top-2">
          <ThemeToggle />
        </div>
      </div>
    </div>
  )
}
