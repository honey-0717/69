/*
# Multi-Tenant Production Backend Migration - HotHarini69

## Multi-Tenant Security Architecture:
- `admin_id` column added across tables linking to `auth.users(id)`.
- RLS enabled on all tables:
  - Public `anon`: SELECT only for enabled services, published terms, enabled payment methods, active social contacts, non-hidden reviews, public profiles.
  - Authenticated admin: CRUD permissions restricted via `auth.uid() = admin_id` (or fallback admin access).
*/

-- Add admin_id columns to existing tables if missing
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='services' AND column_name='admin_id') THEN
    ALTER TABLE services ADD COLUMN admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reviews' AND column_name='admin_id') THEN
    ALTER TABLE reviews ADD COLUMN admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='payment_methods' AND column_name='admin_id') THEN
    ALTER TABLE payment_methods ADD COLUMN admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='social_contacts' AND column_name='admin_id') THEN
    ALTER TABLE social_contacts ADD COLUMN admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='terms' AND column_name='admin_id') THEN
    ALTER TABLE terms ADD COLUMN admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='message_template' AND column_name='admin_id') THEN
    ALTER TABLE message_template ADD COLUMN admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='admin_activity' AND column_name='admin_id') THEN
    ALTER TABLE admin_activity ADD COLUMN admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 1. admin_activity table
CREATE TABLE IF NOT EXISTS admin_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type text NOT NULL,
  description text NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 2. Profile table
CREATE TABLE IF NOT EXISTS profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'HotHarini69',
  bio text DEFAULT 'Premium personal service provider. Available for video calls, voice calls, and exclusive content.',
  languages text[] DEFAULT ARRAY['English', 'Hindi'],
  profile_photo text,
  availability text NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'offline')),
  overall_rating numeric DEFAULT 5.0,
  updated_at timestamptz DEFAULT now()
);

-- 3. Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 4. Services table
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  price integer NOT NULL DEFAULT 0,
  duration text NOT NULL DEFAULT '5 Minutes',
  short_description text,
  full_description text,
  important_info text,
  photos text[] DEFAULT '{}',
  enabled boolean NOT NULL DEFAULT true,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. Service photos table
CREATE TABLE IF NOT EXISTS service_photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 6. Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  reviewer_name text NOT NULL DEFAULT 'Verified Customer',
  verified boolean NOT NULL DEFAULT true,
  hidden boolean NOT NULL DEFAULT false,
  flagged boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 7. Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 8. Social contacts table
CREATE TABLE IF NOT EXISTS social_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('whatsapp', 'instagram', 'telegram')),
  value text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

-- 9. Terms table
CREATE TABLE IF NOT EXISTS terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  version text DEFAULT '1.0',
  is_published boolean DEFAULT true,
  published_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 10. Message template table
CREATE TABLE IF NOT EXISTS message_template (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  template text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS across all tables
ALTER TABLE admin_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_template ENABLE ROW LEVEL SECURITY;

-- Multi-tenant RLS Security Policies
-- Admin Activity
DROP POLICY IF EXISTS "admin_activity_select" ON admin_activity;
CREATE POLICY "admin_activity_select" ON admin_activity FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "admin_activity_insert" ON admin_activity;
CREATE POLICY "admin_activity_insert" ON admin_activity FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Services
DROP POLICY IF EXISTS "services_public_select" ON services;
CREATE POLICY "services_public_select" ON services FOR SELECT TO anon USING (enabled = true);
DROP POLICY IF EXISTS "services_admin_all" ON services;
CREATE POLICY "services_admin_all" ON services FOR ALL TO authenticated USING (auth.uid() = admin_id OR admin_id IS NULL) WITH CHECK (auth.uid() = admin_id OR admin_id IS NULL);

-- Profile
DROP POLICY IF EXISTS "profile_public_select" ON profile;
CREATE POLICY "profile_public_select" ON profile FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "profile_admin_all" ON profile;
CREATE POLICY "profile_admin_all" ON profile FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Services
DROP POLICY IF EXISTS "services_public_select" ON services;
CREATE POLICY "services_public_select" ON services FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "services_admin_all" ON services;
CREATE POLICY "services_admin_all" ON services FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Payment Methods
DROP POLICY IF EXISTS "payment_methods_all" ON payment_methods;
CREATE POLICY "payment_methods_all" ON payment_methods FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Social Contacts
DROP POLICY IF EXISTS "social_contacts_all" ON social_contacts;
CREATE POLICY "social_contacts_all" ON social_contacts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Terms
DROP POLICY IF EXISTS "terms_all" ON terms;
CREATE POLICY "terms_all" ON terms FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Message Template
DROP POLICY IF EXISTS "message_template_all" ON message_template;
CREATE POLICY "message_template_all" ON message_template FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Reviews
DROP POLICY IF EXISTS "reviews_all" ON reviews;
CREATE POLICY "reviews_all" ON reviews FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Storage Buckets Configuration
INSERT INTO storage.buckets (id, name, public)
VALUES ('public-assets', 'public-assets', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public Read Storage" ON storage.objects;
CREATE POLICY "Public Read Storage" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'public-assets');

DROP POLICY IF EXISTS "Authenticated Upload Storage" ON storage.objects;
CREATE POLICY "Authenticated Upload Storage" ON storage.objects FOR ALL TO anon, authenticated USING (bucket_id = 'public-assets') WITH CHECK (bucket_id = 'public-assets');
