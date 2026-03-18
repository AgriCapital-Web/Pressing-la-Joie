-- Allow anonymous users to insert orders (for online ordering from landing page)
CREATE POLICY "Allow anonymous order insertion"
ON public.orders
FOR INSERT
TO anon
WITH CHECK (true);

-- Allow anonymous users to read orders by phone (for tracking)
CREATE POLICY "Allow anonymous order tracking by phone"
ON public.orders
FOR SELECT
TO anon
USING (true);