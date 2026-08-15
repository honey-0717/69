/*
# HotHarini69 - Initial Database Schema

## Overview
Creates the complete database schema for a premium personal service website with a private admin panel.

## New Tables
1. `profile` - Single-row table storing the provider's public profile (name, bio, photo, availability status, languages, overall rating)
2. `categories` - Service categories (e.g. Demo, Video Call, Voice Call, Premium Services) with ordering
3. `services` - Individual services with price, duration, descriptions, photos (text array), enable/disable toggle, and category link
4. `reviews` - Customer reviews with 1-5 star rating, review text, verified status, and hide/flag moderation flags
5. `payment_methods` - Accepted payment methods (PhonePe, Google Pay, etc.) with enable/disable toggle
6. `social_contacts` - Contact platform details (WhatsApp number, Instagram/Telegram usernames) with visibility toggle
7. `terms` - Single-row table storing the published Terms & Conditions text
8. `message_template` - Single-row table storing the pre-filled contact message template with [Service Name], [Duration], [Price] placeholders

## Security
- RLS enabled on ALL tables
- SELECT (read) allowed for both anon and authenticated roles - the public website reads via anon key
- INSERT/UPDATE/DELETE restricted to authenticated role only - only the signed-in admin can modify data
- This is a single-admin app: any authenticated user can write, but only the owner has admin credentials

## Seed Data
- Default profile row (HotHarini69, available)
- 4 categories (Demo, Video Call, Voice Call, Premium Services)
- 7 initial services matching the PRD catalogue
- 5 payment methods (PhonePe, Google Pay, Paytm, UPI, PayPal)
- 3 social contacts (WhatsApp, Instagram, Telegram) with placeholder values
- Default Terms & Conditions (12 clauses from PRD)
- Default message template
- 10 sample reviews with varied ratings
*/

-- ============ TABLES ============

CREATE TABLE IF NOT EXISTS profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL DEFAULT 'HotHarini69',
  bio text DEFAULT 'Premium personal service provider. Available for video calls, voice calls, and exclusive content. Discrete, professional, and unforgettable experiences.',
  languages text[] DEFAULT ARRAY['English', 'Hindi'],
  profile_photo text,
  availability text NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'offline')),
  overall_rating numeric DEFAULT 5.0,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
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

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text,
  reviewer_name text NOT NULL DEFAULT 'Verified Customer',
  verified boolean NOT NULL DEFAULT true,
  hidden boolean NOT NULL DEFAULT false,
  flagged boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  position int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS social_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL UNIQUE CHECK (platform IN ('whatsapp', 'instagram', 'telegram')),
  value text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS message_template (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- ============ RLS ============

ALTER TABLE profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_template ENABLE ROW LEVEL SECURITY;

-- Profile: public read, admin write
DROP POLICY IF EXISTS "profile_select" ON profile;
CREATE POLICY "profile_select" ON profile FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "profile_insert" ON profile;
CREATE POLICY "profile_insert" ON profile FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "profile_update" ON profile;
CREATE POLICY "profile_update" ON profile FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "profile_delete" ON profile;
CREATE POLICY "profile_delete" ON profile FOR DELETE TO authenticated USING (true);

-- Categories: public read, admin write
DROP POLICY IF EXISTS "categories_select" ON categories;
CREATE POLICY "categories_select" ON categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "categories_insert" ON categories;
CREATE POLICY "categories_insert" ON categories FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "categories_update" ON categories;
CREATE POLICY "categories_update" ON categories FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "categories_delete" ON categories;
CREATE POLICY "categories_delete" ON categories FOR DELETE TO authenticated USING (true);

-- Services: public read, admin write
DROP POLICY IF EXISTS "services_select" ON services;
CREATE POLICY "services_select" ON services FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "services_insert" ON services;
CREATE POLICY "services_insert" ON services FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "services_update" ON services;
CREATE POLICY "services_update" ON services FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "services_delete" ON services;
CREATE POLICY "services_delete" ON services FOR DELETE TO authenticated USING (true);

-- Reviews: public read (non-hidden), admin full access
DROP POLICY IF EXISTS "reviews_select" ON reviews;
CREATE POLICY "reviews_select" ON reviews FOR SELECT TO anon, authenticated USING (hidden = false OR auth.role() = 'authenticated');
DROP POLICY IF EXISTS "reviews_insert" ON reviews;
CREATE POLICY "reviews_insert" ON reviews FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "reviews_update" ON reviews;
CREATE POLICY "reviews_update" ON reviews FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "reviews_delete" ON reviews;
CREATE POLICY "reviews_delete" ON reviews FOR DELETE TO authenticated USING (true);

-- Payment methods: public read, admin write
DROP POLICY IF EXISTS "payment_methods_select" ON payment_methods;
CREATE POLICY "payment_methods_select" ON payment_methods FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "payment_methods_insert" ON payment_methods;
CREATE POLICY "payment_methods_insert" ON payment_methods FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "payment_methods_update" ON payment_methods;
CREATE POLICY "payment_methods_update" ON payment_methods FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "payment_methods_delete" ON payment_methods;
CREATE POLICY "payment_methods_delete" ON payment_methods FOR DELETE TO authenticated USING (true);

-- Social contacts: public read, admin write
DROP POLICY IF EXISTS "social_contacts_select" ON social_contacts;
CREATE POLICY "social_contacts_select" ON social_contacts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "social_contacts_insert" ON social_contacts;
CREATE POLICY "social_contacts_insert" ON social_contacts FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "social_contacts_update" ON social_contacts;
CREATE POLICY "social_contacts_update" ON social_contacts FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "social_contacts_delete" ON social_contacts;
CREATE POLICY "social_contacts_delete" ON social_contacts FOR DELETE TO authenticated USING (true);

-- Terms: public read, admin write
DROP POLICY IF EXISTS "terms_select" ON terms;
CREATE POLICY "terms_select" ON terms FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "terms_insert" ON terms;
CREATE POLICY "terms_insert" ON terms FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "terms_update" ON terms;
CREATE POLICY "terms_update" ON terms FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "terms_delete" ON terms;
CREATE POLICY "terms_delete" ON terms FOR DELETE TO authenticated USING (true);

-- Message template: public read, admin write
DROP POLICY IF EXISTS "message_template_select" ON message_template;
CREATE POLICY "message_template_select" ON message_template FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "message_template_insert" ON message_template;
CREATE POLICY "message_template_insert" ON message_template FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "message_template_update" ON message_template;
CREATE POLICY "message_template_update" ON message_template FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "message_template_delete" ON message_template;
CREATE POLICY "message_template_delete" ON message_template FOR DELETE TO authenticated USING (true);

-- ============ SEED DATA ============

-- Profile (single row)
INSERT INTO profile (id, display_name, bio, languages, profile_photo, availability, overall_rating)
SELECT '00000000-0000-0000-0000-000000000001', 'HotHarini69',
  'Premium personal service provider. Available for video calls, voice calls, and exclusive content. Discrete, professional, and unforgettable experiences.',
  ARRAY['English', 'Hindi'],
  'https://images.pexels.com/photos/35165348/pexels-photo-35165348.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
  'available', 4.8
WHERE NOT EXISTS (SELECT 1 FROM profile);

-- Categories
INSERT INTO categories (name, position)
SELECT 'Demo', 0 WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Demo');
INSERT INTO categories (name, position)
SELECT 'Video Call', 1 WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Video Call');
INSERT INTO categories (name, position)
SELECT 'Voice Call', 2 WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Voice Call');
INSERT INTO categories (name, position)
SELECT 'Premium Services', 3 WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Premium Services');

-- Services
INSERT INTO services (category_id, name, price, duration, short_description, full_description, important_info, photos, enabled, position)
SELECT (SELECT id FROM categories WHERE name = 'Demo'), 'Quick Demo', 100, '1 Minute',
  'A quick preview demo session.',
  'Experience a brief but enticing preview demo session. Perfect for first-time customers who want to get a taste of what is offered before committing to a longer session.',
  'No refunds for demo sessions. Duration is strictly 1 minute.',
  ARRAY['https://images.pexels.com/photos/35165348/pexels-photo-35165348.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  true, 0
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Quick Demo');

INSERT INTO services (category_id, name, price, duration, short_description, full_description, important_info, photos, enabled, position)
SELECT (SELECT id FROM categories WHERE name = 'Demo'), 'Extended Demo', 150, '1 Minute',
  'An enhanced preview demo with more content.',
  'Get an extended preview demo with additional content and a more personalized experience. Still just 1 minute but packed with more value.',
  'No refunds for demo sessions. Duration is strictly 1 minute.',
  ARRAY['https://images.pexels.com/photos/21966540/pexels-photo-21966540.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  true, 1
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Extended Demo');

INSERT INTO services (category_id, name, price, duration, short_description, full_description, important_info, photos, enabled, position)
SELECT (SELECT id FROM categories WHERE name = 'Video Call'), 'Video Call - 5 Min', 500, '5 Minutes',
  'A 5-minute private video call session.',
  'Enjoy a private 5-minute video call session. Connect face-to-face in a comfortable and exclusive setting. Perfect for a quick personal interaction.',
  'Video calls are conducted via a secure platform. No recording or screenshots allowed. Duration is strictly 5 minutes.',
  ARRAY['https://images.pexels.com/photos/38290945/pexels-photo-38290945.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  true, 2
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Video Call - 5 Min');

INSERT INTO services (category_id, name, price, duration, short_description, full_description, important_info, photos, enabled, position)
SELECT (SELECT id FROM categories WHERE name = 'Video Call'), 'Video Call - 10 Min', 1000, '10 Minutes',
  'A 10-minute premium video call session.',
  'Enjoy an extended 10-minute private video call session. More time for a deeper, more personal connection. Premium quality video and audio.',
  'Video calls are conducted via a secure platform. No recording or screenshots allowed. Duration is strictly 10 minutes.',
  ARRAY['https://images.pexels.com/photos/28896930/pexels-photo-28896930.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  true, 3
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Video Call - 10 Min');

INSERT INTO services (category_id, name, price, duration, short_description, full_description, important_info, photos, enabled, position)
SELECT (SELECT id FROM categories WHERE name = 'Voice Call'), 'Voice Call - 5 Min', 400, '5 Minutes',
  'A 5-minute private voice call session.',
  'Enjoy a private 5-minute voice call session. Intimate and personal conversation in a relaxed setting. Perfect for those who prefer audio interaction.',
  'Voice calls are conducted via a secure platform. Duration is strictly 5 minutes.',
  ARRAY['https://images.pexels.com/photos/35435482/pexels-photo-35435482.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  true, 4
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Voice Call - 5 Min');

INSERT INTO services (category_id, name, price, duration, short_description, full_description, important_info, photos, enabled, position)
SELECT (SELECT id FROM categories WHERE name = 'Voice Call'), 'Voice Call - 10 Min', 750, '10 Minutes',
  'A 10-minute extended voice call session.',
  'Enjoy an extended 10-minute private voice call session. More time for meaningful conversation and a deeper connection.',
  'Voice calls are conducted via a secure platform. Duration is strictly 10 minutes.',
  ARRAY['https://images.pexels.com/photos/31824860/pexels-photo-31824860.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  true, 5
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Voice Call - 10 Min');

INSERT INTO services (category_id, name, price, duration, short_description, full_description, important_info, photos, enabled, position)
SELECT (SELECT id FROM categories WHERE name = 'Premium Services'), 'Premium Service 1', 1000, '5 Minutes',
  'Exclusive premium service with personalized attention.',
  'Experience our exclusive premium service with highly personalized attention. This is our top-tier offering for discerning customers who want the very best.',
  'Premium services require advance confirmation. No cancellations once confirmed.',
  ARRAY['https://images.pexels.com/photos/38290945/pexels-photo-38290945.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  true, 6
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Premium Service 1');

INSERT INTO services (category_id, name, price, duration, short_description, full_description, important_info, photos, enabled, position)
SELECT (SELECT id FROM categories WHERE name = 'Premium Services'), 'Premium Service 2', 1500, '5 Minutes',
  'Ultimate premium service with the highest level of exclusivity.',
  'Our ultimate premium service offering the highest level of exclusivity and personalization. The most sought-after experience we provide.',
  'Premium services require advance confirmation. No cancellations once confirmed.',
  ARRAY['https://images.pexels.com/photos/28896930/pexels-photo-28896930.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
  true, 7
WHERE NOT EXISTS (SELECT 1 FROM services WHERE name = 'Premium Service 2');

-- Reviews table initialized empty (No fake reviews)



-- Payment Methods
INSERT INTO payment_methods (name, enabled, position)
SELECT 'PhonePe', true, 0 WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE name = 'PhonePe');
INSERT INTO payment_methods (name, enabled, position)
SELECT 'Google Pay', true, 1 WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE name = 'Google Pay');
INSERT INTO payment_methods (name, enabled, position)
SELECT 'Paytm', true, 2 WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE name = 'Paytm');
INSERT INTO payment_methods (name, enabled, position)
SELECT 'UPI', true, 3 WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE name = 'UPI');
INSERT INTO payment_methods (name, enabled, position)
SELECT 'PayPal', true, 4 WHERE NOT EXISTS (SELECT 1 FROM payment_methods WHERE name = 'PayPal');

-- Social Contacts
INSERT INTO social_contacts (platform, value, enabled)
SELECT 'whatsapp', '+919999999999', true
WHERE NOT EXISTS (SELECT 1 FROM social_contacts WHERE platform = 'whatsapp');
INSERT INTO social_contacts (platform, value, enabled)
SELECT 'instagram', 'hotharini69', true
WHERE NOT EXISTS (SELECT 1 FROM social_contacts WHERE platform = 'instagram');
INSERT INTO social_contacts (platform, value, enabled)
SELECT 'telegram', 'hotharini69', true
WHERE NOT EXISTS (SELECT 1 FROM social_contacts WHERE platform = 'telegram');

-- Terms (single row)
INSERT INTO terms (content)
SELECT '1. Time-pass persons, please stay away.

2. Please contact only if you are genuinely interested in the selected service.

3. Prices are fixed. No bargaining.

4. No meet-ups or offline services.

5. Please respect the service provider and communicate politely.

6. Do not waste time with repeated or unnecessary messages.

7. Service duration and price must be confirmed before proceeding.

8. Availability can change at any time.

9. Do not share or misuse personal information.

10. Please use only the listed contact methods.

11. Any violation of these terms may result in the contact being declined or blocked.

12. By continuing, you confirm that you have read and agreed to these terms.'
WHERE NOT EXISTS (SELECT 1 FROM terms);

-- Message Template (single row)
INSERT INTO message_template (template)
SELECT 'Hi, I''m interested in [Service Name].

Duration: [Duration]
Price: [Price]

I would like to book this service.'
WHERE NOT EXISTS (SELECT 1 FROM message_template);
