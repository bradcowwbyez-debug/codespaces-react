import { useState, useEffect } from 'react';
import { ArrowLeft, Check } from 'lucide-react';
import { supabase } from '../supabase';

export default function EditProfilePage({ user, setPage, setActiveProfile }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (!user) {
      setPage('feed');
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error: err } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (err) throw err;

        setProfile(data);
        setFormData({
          username: data.username || '',
          bio: data.bio || '',
          avatar_url: data.avatar_url || ''
        });
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, setPage]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      setError('El nombre de usuario es requerido');
      return;
    }

    try {
      setSaving(true);
      setError('');

      const { error: err } = await supabase
        .from('profiles')
        .update({
          username: formData.username.trim(),
          bio: formData.bio.trim(),
          avatar_url: formData.avatar_url.trim()
        })
        .eq('id', user.id);

      if (err) throw err;

      setSuccess(true);
      setProfile({ ...profile, ...formData });
      setActiveProfile({ ...profile, ...formData });

      setTimeout(() => {
        setPage('profile');
      }, 1500);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Error al guardar el perfil. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 rounded-full border-2 border-twitter-400 border-t-twitter-600 animate-spin mx-auto"></div>
          <p className="text-twitter-700 dark:text-twitter-200 mt-4">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-white dark:bg-twitter-900 flex flex-col pt-16 md:pt-20">
      {/* Header */}
      <div className="border-b border-twitter-200 dark:border-twitter-700 px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => setPage('profile')}
          className="text-twitter-700 dark:text-twitter-200 hover:bg-twitter-100 dark:hover:bg-twitter-800 p-2 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-lg font-bold text-twitter-900 dark:text-white">Editar perfil</h2>
          <p className="text-sm text-twitter-500 dark:text-twitter-400">Actualiza tu información</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto">
        <form onSubmit={handleSave} className="p-4 md:p-6 max-w-2xl">
          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
              <Check size={16} />
              Perfil actualizado correctamente
            </div>
          )}

          {/* Avatar URL */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-twitter-900 dark:text-white mb-2">
              URL de Avatar
            </label>
            <input
              type="url"
              name="avatar_url"
              value={formData.avatar_url}
              onChange={handleChange}
              placeholder="https://ejemplo.com/avatar.jpg"
              className="w-full px-4 py-3 bg-twitter-50 dark:bg-twitter-800 border border-twitter-200 dark:border-twitter-700 rounded-lg text-twitter-900 dark:text-white placeholder-twitter-400 dark:placeholder-twitter-500 focus:outline-none focus:ring-2 focus:ring-twitter-500 dark:focus:ring-twitter-400 transition-all"
            />
            {formData.avatar_url && (
              <div className="mt-3">
                <p className="text-sm text-twitter-600 dark:text-twitter-400 mb-2">Vista previa:</p>
                <img
                  src={formData.avatar_url}
                  alt="Avatar preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-twitter-300 dark:border-twitter-600"
                  onError={() => setError('La URL del avatar no es válida')}
                />
              </div>
            )}
          </div>

          {/* Username */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-twitter-900 dark:text-white mb-2">
              Nombre de usuario
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Ej: @tucuenta"
              className="w-full px-4 py-3 bg-twitter-50 dark:bg-twitter-800 border border-twitter-200 dark:border-twitter-700 rounded-lg text-twitter-900 dark:text-white placeholder-twitter-400 dark:placeholder-twitter-500 focus:outline-none focus:ring-2 focus:ring-twitter-500 dark:focus:ring-twitter-400 transition-all"
              maxLength="50"
            />
            <p className="text-xs text-twitter-500 dark:text-twitter-400 mt-1">
              {formData.username.length}/50
            </p>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-twitter-900 dark:text-white mb-2">
              Biografía
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Cuéntanos sobre ti..."
              rows="5"
              className="w-full px-4 py-3 bg-twitter-50 dark:bg-twitter-800 border border-twitter-200 dark:border-twitter-700 rounded-lg text-twitter-900 dark:text-white placeholder-twitter-400 dark:placeholder-twitter-500 focus:outline-none focus:ring-2 focus:ring-twitter-500 dark:focus:ring-twitter-400 transition-all resize-none"
              maxLength="160"
            />
            <p className="text-xs text-twitter-500 dark:text-twitter-400 mt-1">
              {formData.bio.length}/160
            </p>
          </div>

          {/* Save Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setPage('profile')}
              className="flex-1 px-6 py-3 bg-twitter-100 dark:bg-twitter-800 text-twitter-900 dark:text-white font-semibold rounded-full hover:bg-twitter-200 dark:hover:bg-twitter-700 transition-colors"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || success}
              className="flex-1 px-6 py-3 bg-twitter-500 hover:bg-twitter-600 text-white font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  Guardando...
                </>
              ) : success ? (
                <>
                  <Check size={18} />
                  ¡Guardado!
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
