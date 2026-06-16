-- Table pour collecter les informations des visiteurs via le chatbot
CREATE TABLE public.visitor_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  language TEXT DEFAULT 'fr',
  collected_via TEXT DEFAULT 'chatbot',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visitor_contacts ENABLE ROW LEVEL SECURITY;

-- Policies for visitor_contacts (public insert, admin read)
CREATE POLICY "Visitors can submit their contacts" 
ON public.visitor_contacts 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all visitor contacts" 
ON public.visitor_contacts 
FOR SELECT 
USING (true);

-- Add domain column to page_visits for persistent tracking
ALTER TABLE public.page_visits ADD COLUMN IF NOT EXISTS domain TEXT DEFAULT 'www.agricapital.ci';

-- Create index for faster domain queries
CREATE INDEX IF NOT EXISTS idx_page_visits_domain ON public.page_visits(domain);

-- Add trigger for updated_at
CREATE TRIGGER update_visitor_contacts_updated_at
BEFORE UPDATE ON public.visitor_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();