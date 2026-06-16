-- Create news table for articles/actualités
CREATE TABLE public.news (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title_fr TEXT NOT NULL,
  title_en TEXT,
  title_ar TEXT,
  title_es TEXT,
  title_de TEXT,
  title_zh TEXT,
  content_fr TEXT NOT NULL,
  content_en TEXT,
  content_ar TEXT,
  content_es TEXT,
  content_de TEXT,
  content_zh TEXT,
  excerpt_fr TEXT,
  excerpt_en TEXT,
  excerpt_ar TEXT,
  excerpt_es TEXT,
  excerpt_de TEXT,
  excerpt_zh TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  videos JSONB DEFAULT '[]'::jsonb,
  featured_image TEXT,
  category TEXT DEFAULT 'general',
  is_published BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  author TEXT DEFAULT 'AgriCapital',
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admin full access news" 
ON public.news 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can read published news" 
ON public.news 
FOR SELECT 
USING (is_published = true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_news_updated_at
BEFORE UPDATE ON public.news
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_news_published_at ON public.news(published_at DESC) WHERE is_published = true;
CREATE INDEX idx_news_slug ON public.news(slug);

-- Enable realtime for news
ALTER PUBLICATION supabase_realtime ADD TABLE public.news;