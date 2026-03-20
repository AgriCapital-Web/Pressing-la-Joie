-- Allow public online orders without assigned manager at creation time
ALTER TABLE public.orders
  ALTER COLUMN manager_id DROP NOT NULL;