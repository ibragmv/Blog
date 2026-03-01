import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Please check .env.example');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);

export type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  created_at: string;
  published: boolean;
  is_page?: boolean; // To distinguish between blog posts and static pages like Home
};

export type Link = {
  id: string;
  title: string;
  url: string;
  icon: string; // e.g., 'github', 'twitter'
  order: number;
};
