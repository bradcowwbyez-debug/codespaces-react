import React from 'react'
import { Home, Search, Bell, Mail, User, MoreHorizontal } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Navbar({ user, setPage }) {
  return (
    // single fixed header with center logo, semi-window black effect
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-twitter-900 backdrop-blur-sm border-b border-gray-200 dark:border-white/10">
      <div className="max-w-5xl mx-auto flex items-center justify-between px-4 py-3">
        {/* left - navigation icons */}
        <div className="flex items-center gap-3">
          <button className="hidden md:inline-flex items-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-800 transition-colors">
            <Home size={18} className="text-gray-700 dark:text-white" />
          </button>
          <button className="hidden md:inline-flex items-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-800 transition-colors">
            <Search size={18} className="text-gray-700 dark:text-white" />
          </button>
        </div>

        {/* center - logo (Twitter-like) */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex-none">
            <img src="/Octocat.png" alt="logo" className="h-10 w-auto rounded-md shadow-2xl" />
          </div>
        </div>

        {/* right - actions */}
        <div className="flex items-center gap-3">
          <button onClick={() => setPage('feed')} className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-800 transition-colors">
            <Home size={18} />
            <span className="hidden xl:inline text-sm font-semibold">Inicio</span>
          </button>

          <button onClick={() => setPage('search')} className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-800 transition-colors">
            <MoreHorizontal size={18} />
            <span className="hidden xl:inline text-sm font-semibold">Explorar</span>
          </button>

          <button onClick={() => setPage('notifications')} className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-800 transition-colors">
            <Bell size={18} />
          </button>

          <button onClick={() => setPage('messages')} className="hidden md:inline-flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-800 transition-colors">
            <Mail size={18} />
          </button>

          <div className="flex items-center gap-2">
            <button onClick={() => setPage('profile')} className="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-800 transition-colors">
              <User size={18} />
              <span className="hidden md:inline text-sm">{user?.email ? user.email.split('@')[0] : 'Perfil'}</span>
            </button>
          </div>
          {/* Theme toggle */}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
