CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "plpgsql" WITH SCHEMA "pg_catalog";
CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
BEGIN;

--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



--
-- Name: app_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.app_role AS ENUM (
    'admin',
    'moderator',
    'user'
);


--
-- Name: has_role(uuid, public.app_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


SET default_table_access_method = heap;

--
-- Name: ai_chat_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ai_chat_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    session_id text NOT NULL,
    user_message text NOT NULL,
    assistant_response text NOT NULL,
    language text DEFAULT 'fr'::text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: contact_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_messages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    subject text,
    message text NOT NULL,
    status text DEFAULT 'new'::text NOT NULL,
    read_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: email_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_logs (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    recipient_email text NOT NULL,
    recipient_name text,
    subject text NOT NULL,
    body text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    sent_at timestamp with time zone,
    error_message text,
    template_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: email_recipients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_recipients (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    name text,
    group_name text DEFAULT 'general'::text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: email_signatures; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_signatures (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    content text NOT NULL,
    is_default boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: email_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    subject text NOT NULL,
    body text NOT NULL,
    variables jsonb DEFAULT '[]'::jsonb,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: form_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.form_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    form_id uuid,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    status text DEFAULT 'new'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.newsletter_subscribers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    subscribed_at timestamp with time zone DEFAULT now() NOT NULL,
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: page_visits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.page_visits (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page_path text NOT NULL,
    visitor_id text NOT NULL,
    user_agent text,
    referrer text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: partnerships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partnerships (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    description text,
    benefits text,
    status text DEFAULT 'active'::text NOT NULL,
    partner_count integer DEFAULT 0,
    logo_url text,
    contact_email text,
    contact_phone text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: site_content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_content (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    type text DEFAULT 'text'::text NOT NULL,
    content_fr text,
    content_en text,
    content_ar text,
    content_es text,
    content_de text,
    content_zh text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: site_forms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_forms (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    fields jsonb DEFAULT '[]'::jsonb NOT NULL,
    settings jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: site_media; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_media (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    url text NOT NULL,
    alt_text_fr text,
    alt_text_en text,
    type text DEFAULT 'image'::text NOT NULL,
    category text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: site_menu; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_menu (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    parent_id uuid,
    label_fr text NOT NULL,
    label_en text,
    label_ar text,
    label_es text,
    label_de text,
    label_zh text,
    url text,
    target text DEFAULT '_self'::text,
    is_active boolean DEFAULT true NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: site_pages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_pages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title_fr text NOT NULL,
    title_en text,
    title_ar text,
    title_es text,
    title_de text,
    title_zh text,
    description_fr text,
    description_en text,
    description_ar text,
    description_es text,
    description_de text,
    description_zh text,
    meta_title_fr text,
    meta_title_en text,
    meta_title_ar text,
    meta_title_es text,
    meta_title_de text,
    meta_title_zh text,
    meta_description_fr text,
    meta_description_en text,
    meta_description_ar text,
    meta_description_es text,
    meta_description_de text,
    meta_description_zh text,
    is_active boolean DEFAULT true NOT NULL,
    is_home boolean DEFAULT false NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: site_sections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_sections (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    page_id uuid,
    name text NOT NULL,
    type text DEFAULT 'content'::text NOT NULL,
    content_fr text,
    content_en text,
    content_ar text,
    content_es text,
    content_de text,
    content_zh text,
    settings jsonb DEFAULT '{}'::jsonb,
    is_active boolean DEFAULT true NOT NULL,
    order_index integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    key text NOT NULL,
    value text,
    type text DEFAULT 'text'::text NOT NULL,
    category text DEFAULT 'general'::text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: testimonials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.testimonials (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text,
    testimonial text NOT NULL,
    photo_url text,
    approved boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'other'::text,
    is_agricapital_subscriber boolean DEFAULT false
);


--
-- Name: user_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    role public.app_role NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: ai_chat_logs ai_chat_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ai_chat_logs
    ADD CONSTRAINT ai_chat_logs_pkey PRIMARY KEY (id);


--
-- Name: contact_messages contact_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_messages
    ADD CONSTRAINT contact_messages_pkey PRIMARY KEY (id);


--
-- Name: email_logs email_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_logs
    ADD CONSTRAINT email_logs_pkey PRIMARY KEY (id);


--
-- Name: email_recipients email_recipients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_recipients
    ADD CONSTRAINT email_recipients_pkey PRIMARY KEY (id);


--
-- Name: email_signatures email_signatures_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_signatures
    ADD CONSTRAINT email_signatures_pkey PRIMARY KEY (id);


--
-- Name: email_templates email_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_templates
    ADD CONSTRAINT email_templates_pkey PRIMARY KEY (id);


--
-- Name: form_submissions form_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_submissions
    ADD CONSTRAINT form_submissions_pkey PRIMARY KEY (id);


--
-- Name: newsletter_subscribers newsletter_subscribers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_email_key UNIQUE (email);


--
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);


--
-- Name: page_visits page_visits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.page_visits
    ADD CONSTRAINT page_visits_pkey PRIMARY KEY (id);


--
-- Name: partnerships partnerships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partnerships
    ADD CONSTRAINT partnerships_pkey PRIMARY KEY (id);


--
-- Name: site_content site_content_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_content
    ADD CONSTRAINT site_content_key_key UNIQUE (key);


--
-- Name: site_content site_content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_content
    ADD CONSTRAINT site_content_pkey PRIMARY KEY (id);


--
-- Name: site_forms site_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_forms
    ADD CONSTRAINT site_forms_pkey PRIMARY KEY (id);


--
-- Name: site_forms site_forms_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_forms
    ADD CONSTRAINT site_forms_slug_key UNIQUE (slug);


--
-- Name: site_media site_media_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_media
    ADD CONSTRAINT site_media_pkey PRIMARY KEY (id);


--
-- Name: site_menu site_menu_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_menu
    ADD CONSTRAINT site_menu_pkey PRIMARY KEY (id);


--
-- Name: site_pages site_pages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_pages
    ADD CONSTRAINT site_pages_pkey PRIMARY KEY (id);


--
-- Name: site_pages site_pages_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_pages
    ADD CONSTRAINT site_pages_slug_key UNIQUE (slug);


--
-- Name: site_sections site_sections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_sections
    ADD CONSTRAINT site_sections_pkey PRIMARY KEY (id);


--
-- Name: site_settings site_settings_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_key_key UNIQUE (key);


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);


--
-- Name: testimonials testimonials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.testimonials
    ADD CONSTRAINT testimonials_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_pkey PRIMARY KEY (id);


--
-- Name: user_roles user_roles_user_id_role_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);


--
-- Name: email_signatures update_email_signatures_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_email_signatures_updated_at BEFORE UPDATE ON public.email_signatures FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: email_templates update_email_templates_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON public.email_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: partnerships update_partnerships_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_partnerships_updated_at BEFORE UPDATE ON public.partnerships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: site_content update_site_content_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_site_content_updated_at BEFORE UPDATE ON public.site_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: site_forms update_site_forms_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_site_forms_updated_at BEFORE UPDATE ON public.site_forms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: site_menu update_site_menu_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_site_menu_updated_at BEFORE UPDATE ON public.site_menu FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: site_pages update_site_pages_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_site_pages_updated_at BEFORE UPDATE ON public.site_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: site_sections update_site_sections_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_site_sections_updated_at BEFORE UPDATE ON public.site_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: site_settings update_site_settings_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: testimonials update_testimonials_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: form_submissions form_submissions_form_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.form_submissions
    ADD CONSTRAINT form_submissions_form_id_fkey FOREIGN KEY (form_id) REFERENCES public.site_forms(id) ON DELETE CASCADE;


--
-- Name: site_menu site_menu_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_menu
    ADD CONSTRAINT site_menu_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.site_menu(id) ON DELETE CASCADE;


--
-- Name: site_sections site_sections_page_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_sections
    ADD CONSTRAINT site_sections_page_id_fkey FOREIGN KEY (page_id) REFERENCES public.site_pages(id) ON DELETE CASCADE;


--
-- Name: user_roles user_roles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_roles
    ADD CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: ai_chat_logs Admin can delete chat logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can delete chat logs" ON public.ai_chat_logs FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: ai_chat_logs Admin can view chat logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin can view chat logs" ON public.ai_chat_logs FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: contact_messages Admin full access contact_messages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access contact_messages" ON public.contact_messages USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: email_logs Admin full access email_logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access email_logs" ON public.email_logs USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: email_recipients Admin full access email_recipients; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access email_recipients" ON public.email_recipients USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: email_signatures Admin full access email_signatures; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access email_signatures" ON public.email_signatures USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: email_templates Admin full access email_templates; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access email_templates" ON public.email_templates USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: form_submissions Admin full access form_submissions; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access form_submissions" ON public.form_submissions USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: partnerships Admin full access partnerships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access partnerships" ON public.partnerships USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: site_content Admin full access site_content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access site_content" ON public.site_content USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: site_forms Admin full access site_forms; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access site_forms" ON public.site_forms USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: site_media Admin full access site_media; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access site_media" ON public.site_media USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: site_menu Admin full access site_menu; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access site_menu" ON public.site_menu USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: site_pages Admin full access site_pages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access site_pages" ON public.site_pages USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: site_sections Admin full access site_sections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access site_sections" ON public.site_sections USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: site_settings Admin full access site_settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admin full access site_settings" ON public.site_settings USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: newsletter_subscribers Admins can delete newsletter subscribers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete newsletter subscribers" ON public.newsletter_subscribers FOR DELETE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: testimonials Admins can delete testimonials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete testimonials" ON public.testimonials FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can delete user roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can delete user roles" ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can insert user roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can insert user roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: newsletter_subscribers Admins can manage newsletter subscribers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can manage newsletter subscribers" ON public.newsletter_subscribers FOR UPDATE USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: testimonials Admins can update testimonials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can update testimonials" ON public.testimonials FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: testimonials Admins can view all testimonials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all testimonials" ON public.testimonials FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: user_roles Admins can view all user roles; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view all user roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: newsletter_subscribers Admins can view newsletter subscribers; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view newsletter subscribers" ON public.newsletter_subscribers FOR SELECT USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: page_visits Admins can view page visits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Admins can view page visits" ON public.page_visits FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::public.app_role));


--
-- Name: page_visits Anyone can insert page visits; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert page visits" ON public.page_visits FOR INSERT WITH CHECK (true);


--
-- Name: testimonials Anyone can insert testimonials; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can insert testimonials" ON public.testimonials FOR INSERT WITH CHECK (true);


--
-- Name: newsletter_subscribers Anyone can subscribe to newsletter; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can subscribe to newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);


--
-- Name: testimonials Only approved testimonials are viewable by everyone; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Only approved testimonials are viewable by everyone" ON public.testimonials FOR SELECT USING ((approved = true));


--
-- Name: ai_chat_logs Public can insert chat logs; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can insert chat logs" ON public.ai_chat_logs FOR INSERT WITH CHECK (true);


--
-- Name: site_content Public can read active content; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read active content" ON public.site_content FOR SELECT USING ((is_active = true));


--
-- Name: site_forms Public can read active forms; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read active forms" ON public.site_forms FOR SELECT USING ((is_active = true));


--
-- Name: site_media Public can read active media; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read active media" ON public.site_media FOR SELECT USING ((is_active = true));


--
-- Name: site_menu Public can read active menu; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read active menu" ON public.site_menu FOR SELECT USING ((is_active = true));


--
-- Name: site_pages Public can read active pages; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read active pages" ON public.site_pages FOR SELECT USING ((is_active = true));


--
-- Name: partnerships Public can read active partnerships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read active partnerships" ON public.partnerships FOR SELECT USING ((status = 'active'::text));


--
-- Name: site_sections Public can read active sections; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read active sections" ON public.site_sections FOR SELECT USING ((is_active = true));


--
-- Name: site_settings Public can read settings; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can read settings" ON public.site_settings FOR SELECT USING (true);


--
-- Name: contact_messages Public can submit contact; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can submit contact" ON public.contact_messages FOR INSERT WITH CHECK (true);


--
-- Name: form_submissions Public can submit forms; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Public can submit forms" ON public.form_submissions FOR INSERT WITH CHECK (true);


--
-- Name: ai_chat_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.ai_chat_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: contact_messages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

--
-- Name: email_logs; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

--
-- Name: email_recipients; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_recipients ENABLE ROW LEVEL SECURITY;

--
-- Name: email_signatures; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_signatures ENABLE ROW LEVEL SECURITY;

--
-- Name: email_templates; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

--
-- Name: form_submissions; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;

--
-- Name: newsletter_subscribers; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

--
-- Name: page_visits; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

--
-- Name: partnerships; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;

--
-- Name: site_content; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

--
-- Name: site_forms; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.site_forms ENABLE ROW LEVEL SECURITY;

--
-- Name: site_media; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.site_media ENABLE ROW LEVEL SECURITY;

--
-- Name: site_menu; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.site_menu ENABLE ROW LEVEL SECURITY;

--
-- Name: site_pages; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.site_pages ENABLE ROW LEVEL SECURITY;

--
-- Name: site_sections; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.site_sections ENABLE ROW LEVEL SECURITY;

--
-- Name: site_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: testimonials; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

--
-- Name: user_roles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--




COMMIT;