
-- 1. Extend subscribers
ALTER TABLE public.newsletter_subscribers
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'website',
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS tag text NOT NULL DEFAULT 'attente',
  ADD COLUMN IF NOT EXISTS unsubscribed_at timestamptz,
  ADD COLUMN IF NOT EXISTS unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_unsub_token_idx
  ON public.newsletter_subscribers(unsubscribe_token);

-- Backfill any nulls (defensive)
UPDATE public.newsletter_subscribers
SET unsubscribe_token = gen_random_uuid()
WHERE unsubscribe_token IS NULL;

-- 2. Cron extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 3. Remove any prior versions of the same jobs (idempotent)
DO $$
DECLARE j record;
BEGIN
  FOR j IN SELECT jobid, jobname FROM cron.job
           WHERE jobname IN ('newsletter-monday','newsletter-friday','newsletter-month-start','newsletter-month-end')
  LOOP
    PERFORM cron.unschedule(j.jobid);
  END LOOP;
END $$;

-- 4. Schedule 4 cron jobs
SELECT cron.schedule('newsletter-monday', '0 5 * * 1', $CRON$
  SELECT net.http_post(
    url:='https://hbdnleumrcrinedvkuim.supabase.co/functions/v1/newsletter-auto-send',
    headers:='{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZG5sZXVtcmNyaW5lZHZrdWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NTY4NjYsImV4cCI6MjA4OTQzMjg2Nn0.ZKJf7ihkGJLPz79_M5oqUtKS4IxF-tgNU5t5aaynUK0"}'::jsonb,
    body:='{"trigger":"monday"}'::jsonb
  );
$CRON$);

SELECT cron.schedule('newsletter-friday', '0 18 * * 5', $CRON$
  SELECT net.http_post(
    url:='https://hbdnleumrcrinedvkuim.supabase.co/functions/v1/newsletter-auto-send',
    headers:='{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZG5sZXVtcmNyaW5lZHZrdWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NTY4NjYsImV4cCI6MjA4OTQzMjg2Nn0.ZKJf7ihkGJLPz79_M5oqUtKS4IxF-tgNU5t5aaynUK0"}'::jsonb,
    body:='{"trigger":"friday"}'::jsonb
  );
$CRON$);

SELECT cron.schedule('newsletter-month-start', '0 9 1 * *', $CRON$
  SELECT net.http_post(
    url:='https://hbdnleumrcrinedvkuim.supabase.co/functions/v1/newsletter-auto-send',
    headers:='{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZG5sZXVtcmNyaW5lZHZrdWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NTY4NjYsImV4cCI6MjA4OTQzMjg2Nn0.ZKJf7ihkGJLPz79_M5oqUtKS4IxF-tgNU5t5aaynUK0"}'::jsonb,
    body:='{"trigger":"month-start"}'::jsonb
  );
$CRON$);

-- Runs every day at 18h UTC; the edge function itself skips when it is not the last day of the month.
SELECT cron.schedule('newsletter-month-end', '0 18 * * *', $CRON$
  SELECT net.http_post(
    url:='https://hbdnleumrcrinedvkuim.supabase.co/functions/v1/newsletter-auto-send',
    headers:='{"Content-Type":"application/json","apikey":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZG5sZXVtcmNyaW5lZHZrdWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NTY4NjYsImV4cCI6MjA4OTQzMjg2Nn0.ZKJf7ihkGJLPz79_M5oqUtKS4IxF-tgNU5t5aaynUK0"}'::jsonb,
    body:='{"trigger":"month-end"}'::jsonb
  );
$CRON$);
