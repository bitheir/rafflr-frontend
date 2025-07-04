import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  console.warn('Social media features will be disabled.');
} else {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    supabase = null;
  }
}

export { supabase };

// Database table schemas (for reference)
export const TABLES = {
  SOCIAL_TASKS: 'social_tasks',
  TASK_COMPLETIONS: 'task_completions',
  USER_ACTIVITY: 'user_activity',
  RAFFLE_SOCIAL_TASKS: 'raffle_social_tasks'
};

// Social media task types
export const TASK_TYPES = {
  TWITTER_FOLLOW: 'twitter_follow',
  TWITTER_RETWEET: 'twitter_retweet',
  TWITTER_LIKE: 'twitter_like',
  DISCORD_JOIN: 'discord_join',
  TELEGRAM_JOIN: 'telegram_join',
  INSTAGRAM_FOLLOW: 'instagram_follow',
  YOUTUBE_SUBSCRIBE: 'youtube_subscribe',
  WEBSITE_VISIT: 'website_visit'
};

// Task verification status
export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
}; 