REVOKE EXECUTE ON FUNCTION public.get_orders_by_phone(text) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_orders_by_phone(text) TO service_role;