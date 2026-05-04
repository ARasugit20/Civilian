-- Civilian — optional InsForge / Postgres schema additions
-- Run statements in the InsForge SQL editor when you are ready for auth, echoes table, waitlist, etc.

-- Posts: author display (used once NextAuth + gated posting land)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS user_id TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS user_display_name TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS user_avatar TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION;

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  phone_verified BOOLEAN DEFAULT false,
  trust_tier TEXT DEFAULT 'verified' CHECK (trust_tier IN ('verified', 'trusted', 'leader')),
  is_public BOOLEAN DEFAULT false,
  complaint_count INTEGER DEFAULT 0,
  echo_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS echoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

CREATE TABLE IF NOT EXISTS status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('submitted','drafted','sent','seen','responded','resolved','disputed')),
  note TEXT,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  feature TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_feature ON waitlist (email, feature);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  post_id TEXT,
  type TEXT NOT NULL CHECK (type IN ('status_change','echo_milestone','resolution','new_comment')),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
