-- Create partnership_requests table for partnership request form
CREATE TABLE public.partnership_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_type VARCHAR(50) NOT NULL, -- landowner, producer, investor, institution, industrial, technical
  partner_type VARCHAR(50) NOT NULL, -- individual, company, ngo, institution
  category VARCHAR(100), -- agriculture, finance, technology, etc.
  
  -- Personal/Company info
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company_name VARCHAR(200),
  company_logo_url TEXT,
  photo_url TEXT,
  
  -- Contact info
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  country VARCHAR(100) DEFAULT 'Côte d''Ivoire',
  city VARCHAR(100),
  address TEXT,
  
  -- Request details
  land_area_hectares DECIMAL(10,2),
  investment_amount DECIMAL(15,2),
  message TEXT,
  preferred_offer VARCHAR(50), -- palmelite, palminvest, terrapalm
  
  -- Meta
  language VARCHAR(10) DEFAULT 'fr',
  status VARCHAR(50) DEFAULT 'pending', -- pending, contacted, approved, rejected
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partnership_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public form)
CREATE POLICY "Anyone can submit partnership request"
ON public.partnership_requests
FOR INSERT
WITH CHECK (true);

-- Only authenticated admins can view/update
CREATE POLICY "Admins can view partnership requests"
ON public.partnership_requests
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'moderator')
  )
);

CREATE POLICY "Admins can update partnership requests"
ON public.partnership_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'moderator')
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_partnership_requests_updated_at
BEFORE UPDATE ON public.partnership_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add location data to page_visits for visitor map
ALTER TABLE public.page_visits 
ADD COLUMN IF NOT EXISTS country VARCHAR(100),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8);