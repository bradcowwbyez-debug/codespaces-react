import './App.css';
import Auth from './components/Auth'
import Timeline from './components/Timeline'
import PostComposer from './components/PostComposer'
import CreatePost from './pages/CreatePost'
import Navbar from './components/Navbar'
import MobileNav from './components/MobileNav'
import { Plus, Home, Search, Bell, Mail, Bookmark, List, User, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import SearchPage from './pages/SearchPage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'

function App() {
  const [user, setUser] = useState(null)
  const [page, setPage] = useState('feed') // 'feed' | 'compose'
  const [activeProfile, setActiveProfile] = useState(null)
  return (
    <div className="App flex flex-col h-screen bg-white dark:bg-twitter-900">
      {/* Header: handled by Navbar (fixed) */}
      <Navbar user={user} setPage={setPage} />
      {/* Left Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-gray-200 dark:border-twitter-800 p-4 flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="text-3xl font-bold text-twitter-600 mb-8">𝕏</div>

        {/* Navigation */}
        <nav className="flex-1 space-y-4">
          {[ 'Inicio', 'Explorar', 'Notificaciones', 'Mensajes', 'Guardados', 'Listas', 'Perfil', 'Más' ].map((item) => (
            <button
              key={item}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-full font-bold text-xl
                       text-gray-900 dark:text-white
                       hover:bg-twitter-50 dark:hover:bg-twitter-800
                       transition-all duration-200 active:scale-95 text-left"
            >
              <span className="text-twitter-600">
                {item === 'Inicio' && <Home size={20} />}
                {item === 'Explorar' && <Search size={20} />}
                {item === 'Notificaciones' && <Bell size={20} />}
                {item === 'Mensajes' && <Mail size={20} />}
                {item === 'Guardados' && <Bookmark size={20} />}
                {item === 'Listas' && <List size={20} />}
                {item === 'Perfil' && <User size={20} />}
                {item === 'Más' && <MoreHorizontal size={20} />}
              </span>
              <span className="hidden xl:inline">{item}</span>
            </button>
          ))}
        </nav>

        {/* Compose Tweet Button */}
          <button onClick={() => setPage('compose')} className="btn-primary w-full py-3 text-lg font-bold rounded-full mb-4 flex items-center justify-center gap-2">
          Publicar
        </button>
      </aside>

        {/* Removed mobile top nav to avoid duplicate headers; Navbar is the single fixed header */}
      <main className="flex-1 w-full lg:max-w-2xl border-r border-gray-200 dark:border-twitter-800 flex flex-col overflow-hidden">

        {/* Auth / User Header */}
        <div className="border-b border-gray-200 dark:border-twitter-800 px-4 py-3">
          <Auth onUser={setUser} />
        </div>

        {/* Compose Area removed: composer lives in FAB/modal page */}

        {/* Timeline Feed / Other pages */}
        <div className="flex-1 overflow-y-auto">
          {page === 'feed' && <Timeline onOpenProfile={(id) => { setActiveProfile(id); setPage('profile') }} />}
          {page === 'search' && <SearchPage onProfile={(id) => { setActiveProfile(id); setPage('profile') }} />}
          {page === 'notifications' && <NotificationsPage user={user} />}
          {page === 'settings' && <SettingsPage user={user} />}
          {page === 'profile' && <ProfilePage userId={activeProfile || user?.id} />}
        </div>
      </main>

      {/* Right Sidebar (Desktop only) */}
      <aside className="hidden xl:block w-80 px-4 py-4 space-y-4">
        {/* Search bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar en 𝕏"
            className="w-full bg-gray-100 dark:bg-twitter-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-600
                     rounded-full py-3 pl-4 pr-4 focus:outline-none focus:ring-2 focus:ring-twitter-600 focus:ring-opacity-50
                     transition-all duration-200"
          />
          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
        </div>

        {/* Trending section */}
        <div className="bg-gray-50 dark:bg-twitter-800 rounded-2xl p-4 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Qué está pasando</h2>

          {[1, 2, 3, 4].map((i) => (
            <button
              key={i}
              className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-twitter-700 rounded-2xl transition-colors duration-150 group"
            >
              <div className="text-xs text-gray-500 dark:text-gray-600 group-hover:text-twitter-600">
                Tendencia Trending
              </div>
              <div className="text-base font-bold text-gray-900 dark:text-white">
                #{i === 1 ? 'React' : i === 2 ? 'Supabase' : i === 3 ? 'WebDevelopment' : 'Twitter'}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-600">
                {Math.floor(Math.random() * 100) + 10}K posts
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Compose page overlay */}
        {page === 'compose' && <CreatePost user={user} onClose={() => setPage('feed')} onPosted={() => setPage('feed')} />}

      {/* Floating action button */}
      <button
        onClick={() => setPage('compose')}
        aria-label="Crear publicación"
        title="Crear publicación"
        className="hidden md:flex right-6 bottom-6 z-50 bg-twitter-600 hover:bg-twitter-700 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform active:scale-95 fixed"
      >
        <Plus size={20} />
      </button>

      {/* Mobile bottom navigation (mobile-first) */}
      <MobileNav page={page} setPage={setPage} user={user} />
    </div>
  );
}

export default App;

