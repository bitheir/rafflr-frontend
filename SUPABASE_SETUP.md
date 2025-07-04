# Supabase Setup Guide

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Choose your organization
5. Enter project name: `rafflhub-social-tasks`
6. Enter database password (save this!)
7. Choose a region close to you
8. Click "Create new project"

## Step 2: Get Your Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the "Project URL" and "anon public" key
3. Create a `.env` file in your project root with:

```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 3: Create Database Tables

Run these SQL commands in your Supabase SQL Editor:

```sql
-- Social media tasks for each raffle
CREATE TABLE raffle_social_tasks (
  id SERIAL PRIMARY KEY,
  raffle_address TEXT NOT NULL,
  task_type TEXT NOT NULL,
  title TEXT,
  description TEXT,
  url TEXT,
  required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Task completions by users
CREATE TABLE task_completions (
  id SERIAL PRIMARY KEY,
  user_address TEXT NOT NULL,
  raffle_address TEXT NOT NULL,
  task_id INTEGER REFERENCES raffle_social_tasks(id),
  status TEXT DEFAULT 'pending',
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_address, raffle_address, task_id)
);

-- User activity tracking
CREATE TABLE user_activity (
  id SERIAL PRIMARY KEY,
  user_address TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  raffle_address TEXT,
  tx_hash TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_raffle_social_tasks_raffle ON raffle_social_tasks(raffle_address);
CREATE INDEX idx_task_completions_user ON task_completions(user_address);
CREATE INDEX idx_task_completions_raffle ON task_completions(raffle_address);
CREATE INDEX idx_user_activity_user ON user_activity(user_address);
```

## Step 4: Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE raffle_social_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access to raffle tasks" ON raffle_social_tasks
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to task completions" ON task_completions
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to user activity" ON user_activity
  FOR SELECT USING (true);

-- Create policies for authenticated users to insert/update
CREATE POLICY "Allow users to insert task completions" ON task_completions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update their task completions" ON task_completions
  FOR UPDATE USING (user_address = current_user);

CREATE POLICY "Allow users to insert activity" ON user_activity
  FOR INSERT WITH CHECK (true);
```

## Step 5: Test the Connection

Once you've set up the environment variables, restart your development server and the social media features should work! 