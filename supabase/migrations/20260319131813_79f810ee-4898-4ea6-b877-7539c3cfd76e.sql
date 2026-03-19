-- Order audit history table
CREATE TABLE public.order_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id integer NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  action text NOT NULL,
  details text DEFAULT '',
  performed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  performer_name text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view order history" ON public.order_history
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert order history" ON public.order_history
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

-- Order internal comments table
CREATE TABLE public.order_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id integer NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  comment text NOT NULL,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.order_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view order comments" ON public.order_comments
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert order comments" ON public.order_comments
  FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));

ALTER PUBLICATION supabase_realtime ADD TABLE public.order_history;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_comments;