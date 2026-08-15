// Pure TypeScript types definition for frontend entities

export type Profile = {
  id: string;
  display_name: string;
  bio: string | null;
  languages: string[] | null;
  profile_photo: string | null;
  availability: 'available' | 'busy' | 'offline';
  overall_rating: number | null;
  updated_at: string;
};

export type Category = {
  id: string;
  name: string;
  position: number;
  created_at: string;
};

export type Service = {
  id: string;
  category_id: string | null;
  name: string;
  price: number;
  duration: string;
  short_description: string | null;
  full_description: string | null;
  important_info: string | null;
  photos: string[];
  enabled: boolean;
  position: number;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: string;
  rating: number;
  review_text: string | null;
  reviewer_name: string;
  verified: boolean;
  hidden: boolean;
  flagged: boolean;
  created_at: string;
};

export type PaymentMethod = {
  id: string;
  name: string;
  enabled: boolean;
  position: number;
  created_at: string;
};

export type SocialContact = {
  id: string;
  platform: 'whatsapp' | 'instagram' | 'telegram' | 'snapchat' | string;
  value: string;
  enabled: boolean;
  updated_at: string;
};

export type Terms = {
  id: string;
  content: string;
  updated_at: string;
};

export type MessageTemplate = {
  id: string;
  template: string;
  updated_at: string;
};

export type ServiceWithCategory = Service & {
  category: Category | null;
};

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://nxsywygcmsydlhuwqxel.supabase.co';
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_nL9T7Ec0_Q1mi3CmF9Tc_w_uiazMQ6a';

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
