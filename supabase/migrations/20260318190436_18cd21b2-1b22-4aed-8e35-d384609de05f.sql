INSERT INTO public.profiles (user_id, display_name, email, is_active)
VALUES ('2022d30a-5013-40d1-b277-0b554ed1e948', 'Admin', 'admin@lajoiepressing.ci', true)
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
VALUES ('2022d30a-5013-40d1-b277-0b554ed1e948', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;