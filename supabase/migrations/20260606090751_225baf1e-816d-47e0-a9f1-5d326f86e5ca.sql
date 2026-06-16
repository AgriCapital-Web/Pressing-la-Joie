-- Remove public exposure of partnerships table (contact_email/contact_phone leak)
DROP POLICY IF EXISTS "Public can read active partnerships" ON public.partnerships;
REVOKE SELECT ON public.partnerships FROM anon;

-- Realtime authorization: restrict subscriptions to the 'news' topic only
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can subscribe to news topic" ON realtime.messages;
CREATE POLICY "Authenticated can subscribe to news topic"
ON realtime.messages
FOR SELECT
TO authenticated
USING (realtime.topic() = 'news');
