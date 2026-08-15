-- Enable Realtime for HotHarini69 tables
-- This migration enables PostgreSQL replication for real-time subscriptions

-- Alter tables to enable replication
ALTER PUBLICATION supabase_realtime ADD TABLE profile;
ALTER PUBLICATION supabase_realtime ADD TABLE services;
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE categories;
ALTER PUBLICATION supabase_realtime ADD TABLE payment_methods;
ALTER PUBLICATION supabase_realtime ADD TABLE social_contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE terms;
ALTER PUBLICATION supabase_realtime ADD TABLE message_template;
