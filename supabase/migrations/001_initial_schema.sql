-- Habit Tracker: Initial Schema
-- Run this in Supabase SQL Editor after creating your project

-- habits (id is TEXT to support app-generated ids like "habit-xxx" or UUID)
CREATE TABLE habits (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  icon TEXT DEFAULT 'sword',
  type TEXT NOT NULL CHECK (type IN ('good', 'bad')),
  category_id TEXT NOT NULL,
  target_reps INT NOT NULL DEFAULT 1,
  current_reps INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  progress INT NOT NULL DEFAULT 0,
  difficulty TEXT DEFAULT 'medium',
  weight DECIMAL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (user_id, id)
);

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own habits" ON habits
  FOR ALL USING (auth.uid() = user_id);

-- categories
CREATE TABLE categories (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  stat_id TEXT,
  stat_key TEXT,
  PRIMARY KEY (user_id, id)
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own categories" ON categories
  FOR ALL USING (auth.uid() = user_id);

-- completions
CREATE TABLE completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  habit_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL,
  repetitions INT,
  progress INT,
  UNIQUE (user_id, date, habit_id)
);

ALTER TABLE completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own completions" ON completions
  FOR ALL USING (auth.uid() = user_id);

-- rpg_stats (user-defined stats)
CREATE TABLE rpg_stats (
  id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  PRIMARY KEY (user_id, id)
);

ALTER TABLE rpg_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own rpg_stats" ON rpg_stats
  FOR ALL USING (auth.uid() = user_id);

-- user_data (single row per user: stats_reset_date, last_active_date, last_week_seen, xp_by_date)
CREATE TABLE user_data (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  stats_reset_date DATE,
  last_active_date DATE,
  last_week_seen TEXT,
  xp_by_date JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own user_data" ON user_data
  FOR ALL USING (auth.uid() = user_id);
