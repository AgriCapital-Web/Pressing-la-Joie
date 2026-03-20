-- Tighten public insert policy for online customer orders
DROP POLICY IF EXISTS "Allow anonymous order insertion" ON public.orders;

CREATE POLICY "Allow anonymous order insertion"
ON public.orders
FOR INSERT
TO anon
WITH CHECK (
  status = 'pending'::public.order_status
  AND is_paid = false
  AND manager_id IS NULL
  AND total >= 0
  AND char_length(btrim(customer_name)) BETWEEN 2 AND 120
  AND char_length(regexp_replace(customer_phone, '\\s+', '', 'g')) BETWEEN 8 AND 15
  AND jsonb_typeof(items) = 'array'
);