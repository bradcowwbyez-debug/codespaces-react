-- ============================================
-- ARREGLAR FUNCTION SEARCH PATH MUTABLE
-- ============================================
-- Este script añade seguridad a las funciones 
-- especificando un search_path fijo

-- Primero, eliminar todas las funciones y triggers
DROP TRIGGER IF EXISTS trigger_update_followers_count ON follows CASCADE;
DROP TRIGGER IF EXISTS trigger_update_followers_count_delete ON follows CASCADE;
DROP TRIGGER IF EXISTS trigger_update_posts_count ON posts CASCADE;
DROP TRIGGER IF EXISTS trigger_update_posts_count_delete ON posts CASCADE;
DROP TRIGGER IF EXISTS trigger_update_comments_count ON comments CASCADE;
DROP TRIGGER IF EXISTS trigger_update_comments_count_delete ON comments CASCADE;
DROP TRIGGER IF EXISTS trigger_create_like_notification ON likes CASCADE;
DROP TRIGGER IF EXISTS trigger_create_follow_notification ON follows CASCADE;
DROP TRIGGER IF EXISTS trigger_create_comment_notification ON comments CASCADE;

DROP FUNCTION IF EXISTS update_profile_counts CASCADE;
DROP FUNCTION IF EXISTS update_post_counts CASCADE;
DROP FUNCTION IF EXISTS create_notification CASCADE;
DROP FUNCTION IF EXISTS handle_like_notification CASCADE;
DROP FUNCTION IF EXISTS handle_follow_notification CASCADE;
DROP FUNCTION IF EXISTS search_users(text, integer) CASCADE;
DROP FUNCTION IF EXISTS search_posts(text, integer) CASCADE;
DROP FUNCTION IF EXISTS is_following(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS get_user_suggestions(uuid, integer) CASCADE;
DROP FUNCTION IF EXISTS is_blocked(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS block_user(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS unblock_user(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS toggle_like(bigint) CASCADE;
DROP FUNCTION IF EXISTS get_unread_notifications_count(uuid) CASCADE;
DROP FUNCTION IF EXISTS mark_notifications_as_read(uuid) CASCADE;
DROP FUNCTION IF EXISTS get_timeline_feed(uuid, integer, integer) CASCADE;
DROP FUNCTION IF EXISTS update_followers_count CASCADE;
DROP FUNCTION IF EXISTS update_followers_count_delete CASCADE;
DROP FUNCTION IF EXISTS update_posts_count CASCADE;
DROP FUNCTION IF EXISTS update_posts_count_delete CASCADE;
DROP FUNCTION IF EXISTS update_comments_count CASCADE;
DROP FUNCTION IF EXISTS update_comments_count_delete CASCADE;
DROP FUNCTION IF EXISTS create_like_notification CASCADE;
DROP FUNCTION IF EXISTS create_follow_notification CASCADE;
DROP FUNCTION IF EXISTS create_comment_notification CASCADE;

-- ============================================
-- RECREAR FUNCIONES CON SEARCH_PATH SEGURO
-- ============================================

CREATE FUNCTION search_users(search_query TEXT, limit_count INT DEFAULT 20)
RETURNS TABLE(
  id UUID,
  username VARCHAR,
  bio TEXT,
  avatar_url TEXT,
  followers_count INTEGER,
  is_verified BOOLEAN
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.bio,
    p.avatar_url,
    p.followers_count,
    p.is_verified
  FROM profiles p
  WHERE p.username ILIKE '%' || search_query || '%'
    OR p.bio ILIKE '%' || search_query || '%'
  ORDER BY p.followers_count DESC
  LIMIT limit_count;
END;
$$;

CREATE FUNCTION search_posts(search_query TEXT, limit_count INT DEFAULT 30)
RETURNS TABLE(
  id BIGINT,
  author_id UUID,
  author_username VARCHAR,
  content TEXT,
  likes_count INTEGER,
  comments_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.author_id,
    pr.username,
    p.content,
    p.likes_count,
    p.comments_count,
    p.created_at
  FROM posts p
  JOIN profiles pr ON p.author_id = pr.id
  WHERE p.content ILIKE '%' || search_query || '%'
  ORDER BY p.created_at DESC
  LIMIT limit_count;
END;
$$;

CREATE FUNCTION is_following(p_follower_id UUID, p_following_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM follows
    WHERE follower_id = p_follower_id
      AND following_id = p_following_id
  );
END;
$$;

CREATE FUNCTION get_user_suggestions(p_user_id UUID, p_limit INT DEFAULT 10)
RETURNS TABLE(
  id UUID,
  username VARCHAR,
  bio TEXT,
  avatar_url TEXT,
  followers_count INTEGER
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.username,
    p.bio,
    p.avatar_url,
    p.followers_count
  FROM profiles p
  WHERE p.id != p_user_id
    AND p.id NOT IN (
      SELECT following_id FROM follows WHERE follower_id = p_user_id
    )
    AND p.id NOT IN (
      SELECT blocked_id FROM blocks WHERE blocker_id = p_user_id
    )
  ORDER BY p.followers_count DESC
  LIMIT p_limit;
END;
$$;

CREATE FUNCTION is_blocked(p_blocker_id UUID, p_blocked_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM blocks
    WHERE blocker_id = p_blocker_id
      AND blocked_id = p_blocked_id
  );
END;
$$;

CREATE FUNCTION block_user(p_blocker_id UUID, p_blocked_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO blocks(blocker_id, blocked_id)
  VALUES(p_blocker_id, p_blocked_id)
  ON CONFLICT DO NOTHING;
  
  DELETE FROM follows
  WHERE (follower_id = p_blocker_id AND following_id = p_blocked_id)
     OR (follower_id = p_blocked_id AND following_id = p_blocker_id);
END;
$$;

CREATE FUNCTION unblock_user(p_blocker_id UUID, p_blocked_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM blocks
  WHERE blocker_id = p_blocker_id
    AND blocked_id = p_blocked_id;
END;
$$;

CREATE FUNCTION toggle_like(p_post_id BIGINT)
RETURNS TABLE(liked BOOLEAN, likes_count INTEGER) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id UUID;
  v_liked BOOLEAN;
  v_likes_count INTEGER;
BEGIN
  v_user_id := AUTH.UID();
  
  v_liked := EXISTS(
    SELECT 1 FROM likes
    WHERE post_id = p_post_id AND user_id = v_user_id
  );
  
  IF v_liked THEN
    DELETE FROM likes
    WHERE post_id = p_post_id AND user_id = v_user_id;
  ELSE
    INSERT INTO likes(post_id, user_id)
    VALUES(p_post_id, v_user_id);
  END IF;
  
  v_likes_count := (SELECT COUNT(*) FROM likes WHERE post_id = p_post_id);
  
  UPDATE posts SET likes_count = v_likes_count WHERE id = p_post_id;
  
  RETURN QUERY SELECT NOT v_liked, v_likes_count;
END;
$$;

CREATE FUNCTION get_unread_notifications_count(p_user_id UUID)
RETURNS INTEGER LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM notifications
    WHERE user_id = p_user_id AND read = FALSE
  );
END;
$$;

CREATE FUNCTION mark_notifications_as_read(p_user_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE notifications
  SET read = TRUE
  WHERE user_id = p_user_id AND read = FALSE;
END;
$$;

CREATE FUNCTION get_timeline_feed(p_user_id UUID, p_limit INT DEFAULT 20, p_offset INT DEFAULT 0)
RETURNS TABLE(
  id BIGINT,
  author_id UUID,
  author_username VARCHAR,
  author_avatar_url TEXT,
  content TEXT,
  image_url TEXT,
  likes_count INTEGER,
  comments_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  liked_by_user BOOLEAN
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.author_id,
    pr.username,
    pr.avatar_url,
    p.content,
    p.image_url,
    p.likes_count,
    p.comments_count,
    p.created_at,
    EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = p_user_id) as liked_by_user
  FROM posts p
  JOIN profiles pr ON p.author_id = pr.id
  WHERE p.author_id = p_user_id
     OR p.author_id IN (
       SELECT following_id FROM follows WHERE follower_id = p_user_id
     )
    AND p.author_id NOT IN (
      SELECT blocked_id FROM blocks WHERE blocker_id = p_user_id
    )
  ORDER BY p.created_at DESC
  LIMIT p_limit OFFSET p_offset;
END;
$$;

-- ============================================
-- RECREAR TRIGGER FUNCTIONS CON SEARCH_PATH
-- ============================================

CREATE FUNCTION update_followers_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE profiles
  SET followers_count = (SELECT COUNT(*) FROM follows WHERE following_id = NEW.following_id)
  WHERE id = NEW.following_id;
  
  UPDATE profiles
  SET following_count = (SELECT COUNT(*) FROM follows WHERE follower_id = NEW.follower_id)
  WHERE id = NEW.follower_id;
  
  RETURN NEW;
END;
$$;

CREATE FUNCTION update_followers_count_delete()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE profiles
  SET followers_count = (SELECT COUNT(*) FROM follows WHERE following_id = OLD.following_id)
  WHERE id = OLD.following_id;
  
  UPDATE profiles
  SET following_count = (SELECT COUNT(*) FROM follows WHERE follower_id = OLD.follower_id)
  WHERE id = OLD.follower_id;
  
  RETURN OLD;
END;
$$;

CREATE FUNCTION update_posts_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE profiles
  SET posts_count = (SELECT COUNT(*) FROM posts WHERE author_id = NEW.author_id)
  WHERE id = NEW.author_id;
  RETURN NEW;
END;
$$;

CREATE FUNCTION update_posts_count_delete()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE profiles
  SET posts_count = (SELECT COUNT(*) FROM posts WHERE author_id = OLD.author_id)
  WHERE id = OLD.author_id;
  RETURN OLD;
END;
$$;

CREATE FUNCTION update_comments_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE posts
  SET comments_count = (SELECT COUNT(*) FROM comments WHERE post_id = NEW.post_id)
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$;

CREATE FUNCTION update_comments_count_delete()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE posts
  SET comments_count = (SELECT COUNT(*) FROM comments WHERE post_id = OLD.post_id)
  WHERE id = OLD.post_id;
  RETURN OLD;
END;
$$;

CREATE FUNCTION create_like_notification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO notifications(user_id, actor_id, post_id, type, content)
  SELECT 
    p.author_id,
    NEW.user_id,
    NEW.post_id,
    'like',
    'Te dio me gusta en tu post'
  FROM posts p
  WHERE p.id = NEW.post_id AND p.author_id != NEW.user_id;
  
  RETURN NEW;
END;
$$;

CREATE FUNCTION create_follow_notification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO notifications(user_id, actor_id, type, content)
  VALUES(
    NEW.following_id,
    NEW.follower_id,
    'follow',
    'Te empezó a seguir'
  );
  
  RETURN NEW;
END;
$$;

CREATE FUNCTION create_comment_notification()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO notifications(user_id, actor_id, post_id, type, content)
  SELECT 
    p.author_id,
    NEW.author_id,
    NEW.post_id,
    'reply',
    'Comentó en tu post: ' || NEW.content
  FROM posts p
  WHERE p.id = NEW.post_id AND p.author_id != NEW.author_id;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- RECREAR TRIGGERS
-- ============================================

CREATE TRIGGER trigger_update_followers_count
AFTER INSERT ON follows
FOR EACH ROW
EXECUTE FUNCTION update_followers_count();

CREATE TRIGGER trigger_update_followers_count_delete
AFTER DELETE ON follows
FOR EACH ROW
EXECUTE FUNCTION update_followers_count_delete();

CREATE TRIGGER trigger_update_posts_count
AFTER INSERT ON posts
FOR EACH ROW
EXECUTE FUNCTION update_posts_count();

CREATE TRIGGER trigger_update_posts_count_delete
AFTER DELETE ON posts
FOR EACH ROW
EXECUTE FUNCTION update_posts_count_delete();

CREATE TRIGGER trigger_update_comments_count
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION update_comments_count();

CREATE TRIGGER trigger_update_comments_count_delete
AFTER DELETE ON comments
FOR EACH ROW
EXECUTE FUNCTION update_comments_count_delete();

CREATE TRIGGER trigger_create_like_notification
AFTER INSERT ON likes
FOR EACH ROW
EXECUTE FUNCTION create_like_notification();

CREATE TRIGGER trigger_create_follow_notification
AFTER INSERT ON follows
FOR EACH ROW
EXECUTE FUNCTION create_follow_notification();

CREATE TRIGGER trigger_create_comment_notification
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION create_comment_notification();

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
