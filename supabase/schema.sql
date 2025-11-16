-- Supabase SQL schema for a simple Twitter-like clone with Row Level Security (RLS)

-- profiles: details about users, linked to auth.users
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique not null,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

-- Enable RLS on profiles
alter table profiles enable row level security;

-- Allow public to read all profiles
create policy "Public profiles are viewable by everyone" on profiles
  for select using (true);

-- Allow users to update their own profile
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Allow users to insert their own profile (via trigger from auth.users)
create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- posts: the "tweets"
create table if not exists posts (
  id bigint generated always as identity primary key,
  content text not null,
  author_id uuid references profiles (id) on delete cascade not null,
  created_at timestamptz default now()
);

create index if not exists idx_posts_created_at on posts (created_at desc);
create index if not exists idx_posts_author_id on posts (author_id);

-- Enable RLS on posts
alter table posts enable row level security;

-- Allow public to read all posts
create policy "Public posts are viewable by everyone" on posts
  for select using (true);

-- Allow authenticated users to create posts
create policy "Authenticated users can create posts" on posts
  for insert with check (auth.role() = 'authenticated' and auth.uid() = author_id);

-- Allow users to update/delete their own posts
create policy "Users can update own posts" on posts
  for update using (auth.uid() = author_id);

create policy "Users can delete own posts" on posts
  for delete using (auth.uid() = author_id);

-- follows: follower / followee relationships
create table if not exists follows (
  id bigint generated always as identity primary key,
  follower_id uuid references profiles (id) on delete cascade not null,
  following_id uuid references profiles (id) on delete cascade not null,
  created_at timestamptz default now(),
  constraint unique_follow unique (follower_id, following_id)
);

create index if not exists idx_follows_follower_id on follows (follower_id);
create index if not exists idx_follows_following_id on follows (following_id);

-- Enable RLS on follows
alter table follows enable row level security;

-- Allow public to read all follow relationships
create policy "Public follows are viewable by everyone" on follows
  for select using (true);

-- Allow authenticated users to create follows
create policy "Authenticated users can create follows" on follows
  for insert with check (auth.role() = 'authenticated' and auth.uid() = follower_id);

-- Allow users to delete their own follows
create policy "Users can delete own follows" on follows
  for delete using (auth.uid() = follower_id);

-- likes: likes for posts
create table if not exists likes (
  id bigint generated always as identity primary key,
  post_id bigint references posts (id) on delete cascade not null,
  user_id uuid references profiles (id) on delete cascade not null,
  created_at timestamptz default now(),
  constraint unique_like unique (post_id, user_id)
);

create index if not exists idx_likes_post_id on likes (post_id);
create index if not exists idx_likes_user_id on likes (user_id);

-- Enable RLS on likes
alter table likes enable row level security;

-- Allow public to read all likes
create policy "Public likes are viewable by everyone" on likes
  for select using (true);

-- Allow authenticated users to create likes
create policy "Authenticated users can create likes" on likes
  for insert with check (auth.role() = 'authenticated' and auth.uid() = user_id);

-- Allow users to delete their own likes
create policy "Users can delete own likes" on likes
  for delete using (auth.uid() = user_id);

-- Helper function: auto-create profile when user signs up
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, username, created_at)
  values (new.id, new.email, now());
  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Trigger to create profile on new auth user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
