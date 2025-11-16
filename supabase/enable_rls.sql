-- ============================================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- ============================================

-- Habilitar RLS en la tabla comments
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en la tabla blocks
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en la tabla notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en la tabla search_history
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en la tabla user_settings
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en la tabla profiles (si no está habilitado)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en la tabla posts (si no está habilitado)
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en la tabla follows (si no está habilitado)
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en la tabla likes (si no está habilitado)
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS PARA TABLA: COMMENTS
-- ============================================

-- Ver comentarios: todos pueden ver
CREATE POLICY "Comments are viewable by everyone"
ON comments FOR SELECT
USING (true);

-- Crear comentarios: solo usuarios autenticados
CREATE POLICY "Users can create comments"
ON comments FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- Actualizar comentarios: solo el autor
CREATE POLICY "Users can update their own comments"
ON comments FOR UPDATE
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Eliminar comentarios: solo el autor o el dueño del post
CREATE POLICY "Users can delete their own comments"
ON comments FOR DELETE
USING (
  auth.uid() = author_id OR 
  auth.uid() IN (SELECT author_id FROM posts WHERE id = post_id)
);

-- ============================================
-- POLÍTICAS PARA TABLA: BLOCKS
-- ============================================

-- Ver bloqueos: solo el usuario que bloquea
CREATE POLICY "Users can view their own blocks"
ON blocks FOR SELECT
USING (auth.uid() = blocker_id);

-- Crear bloqueo: solo el usuario autenticado
CREATE POLICY "Users can block other users"
ON blocks FOR INSERT
WITH CHECK (auth.uid() = blocker_id);

-- Eliminar bloqueo: solo el usuario que bloquea
CREATE POLICY "Users can unblock users"
ON blocks FOR DELETE
USING (auth.uid() = blocker_id);

-- ============================================
-- POLÍTICAS PARA TABLA: NOTIFICATIONS
-- ============================================

-- Ver notificaciones: solo del usuario
CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- Crear notificaciones: solo sistema (INSERT sin restricción por usuario)
CREATE POLICY "Notifications can be created"
ON notifications FOR INSERT
WITH CHECK (true);

-- Actualizar notificaciones: solo del usuario
CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Eliminar notificaciones: solo del usuario
CREATE POLICY "Users can delete their own notifications"
ON notifications FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS PARA TABLA: SEARCH_HISTORY
-- ============================================

-- Ver historial: solo del usuario
CREATE POLICY "Users can view their own search history"
ON search_history FOR SELECT
USING (auth.uid() = user_id);

-- Crear búsquedas: solo el usuario autenticado
CREATE POLICY "Users can create search history"
ON search_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Eliminar búsquedas: solo del usuario
CREATE POLICY "Users can delete their own search history"
ON search_history FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- POLÍTICAS PARA TABLA: USER_SETTINGS
-- ============================================

-- Ver configuraciones: solo del usuario
CREATE POLICY "Users can view their own settings"
ON user_settings FOR SELECT
USING (auth.uid() = id);

-- Crear configuraciones: solo el usuario autenticado
CREATE POLICY "Users can create their settings"
ON user_settings FOR INSERT
WITH CHECK (auth.uid() = id);

-- Actualizar configuraciones: solo del usuario
CREATE POLICY "Users can update their own settings"
ON user_settings FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- POLÍTICAS PARA TABLA: PROFILES
-- ============================================

-- Ver perfiles: todos pueden ver (público)
CREATE POLICY "Profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

-- Actualizar perfil: solo el usuario
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- POLÍTICAS PARA TABLA: POSTS
-- ============================================

-- Ver posts: todos pueden ver (público)
CREATE POLICY "Posts are viewable by everyone"
ON posts FOR SELECT
USING (true);

-- Crear posts: solo usuarios autenticados
CREATE POLICY "Users can create posts"
ON posts FOR INSERT
WITH CHECK (auth.uid() = author_id);

-- Actualizar posts: solo el autor
CREATE POLICY "Users can update their own posts"
ON posts FOR UPDATE
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

-- Eliminar posts: solo el autor
CREATE POLICY "Users can delete their own posts"
ON posts FOR DELETE
USING (auth.uid() = author_id);

-- ============================================
-- POLÍTICAS PARA TABLA: FOLLOWS
-- ============================================

-- Ver follows: todos pueden ver (público)
CREATE POLICY "Follows are viewable by everyone"
ON follows FOR SELECT
USING (true);

-- Crear seguimiento: solo usuarios autenticados
CREATE POLICY "Users can follow other users"
ON follows FOR INSERT
WITH CHECK (auth.uid() = follower_id);

-- Eliminar seguimiento: solo el que sigue
CREATE POLICY "Users can unfollow users"
ON follows FOR DELETE
USING (auth.uid() = follower_id);

-- ============================================
-- POLÍTICAS PARA TABLA: LIKES
-- ============================================

-- Ver likes: todos pueden ver (público)
CREATE POLICY "Likes are viewable by everyone"
ON likes FOR SELECT
USING (true);

-- Crear like: solo usuarios autenticados
CREATE POLICY "Users can like posts"
ON likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Eliminar like: solo el usuario
CREATE POLICY "Users can unlike posts"
ON likes FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
