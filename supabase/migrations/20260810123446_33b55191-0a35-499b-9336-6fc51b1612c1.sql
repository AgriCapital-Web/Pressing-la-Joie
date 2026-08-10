DO $$
DECLARE
  j record;
  base_url text := 'https://hbdnleumrcrinedvkuim.supabase.co/functions/v1/newsletter-auto-send';
  secret text := 'b80ad16741064121e2f310b64a8bbadd83dbfd32212ca664';
BEGIN
  FOR j IN SELECT jobname, schedule, command FROM cron.job WHERE jobname LIKE 'newsletter-%' LOOP
    PERFORM cron.schedule(
      j.jobname,
      j.schedule,
      format(
        $f$SELECT net.http_post(url:=%L, headers:=%L::jsonb, body:=%L::jsonb);$f$,
        base_url,
        json_build_object('Content-Type','application/json','x-cron-secret',secret)::text,
        json_build_object('trigger', replace(j.jobname, 'newsletter-', ''))::text
      )
    );
  END LOOP;
END $$;