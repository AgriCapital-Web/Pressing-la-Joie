import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DOMPurify from "dompurify";
import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Calendar, ArrowLeft, Share2, User, Eye, Loader2, ChevronLeft, ChevronRight, X, Facebook, Twitter, Linkedin, MessageCircle, Copy } from "lucide-react";
import { toast } from "sonner";

const translations = {
  fr: { back: "Retour aux actualités", by: "Par", share: "Partager", views: "vues", shares: "partages", notFound: "Article non trouvé", notFoundDesc: "L'article que vous recherchez n'existe pas ou a été déplacé.", gallery: "Galerie photos" },
  en: { back: "Back to news", by: "By", share: "Share", views: "views", shares: "shares", notFound: "Article not found", notFoundDesc: "The article you're looking for doesn't exist or has been moved.", gallery: "Photo gallery" },
  ar: { back: "العودة إلى الأخبار", by: "بواسطة", share: "مشاركة", views: "مشاهدات", shares: "مشاركات", notFound: "المقال غير موجود", notFoundDesc: "المقال الذي تبحث عنه غير موجود أو تم نقله.", gallery: "معرض الصور" },
  es: { back: "Volver a noticias", by: "Por", share: "Compartir", views: "vistas", shares: "compartidos", notFound: "Artículo no encontrado", notFoundDesc: "El artículo que busca no existe o ha sido movido.", gallery: "Galería de fotos" },
  de: { back: "Zurück zu Nachrichten", by: "Von", share: "Teilen", views: "Aufrufe", shares: "geteilt", notFound: "Artikel nicht gefunden", notFoundDesc: "Der Artikel, den Sie suchen, existiert nicht oder wurde verschoben.", gallery: "Fotogalerie" },
  zh: { back: "返回新闻", by: "作者", share: "分享", views: "浏览量", shares: "分享", notFound: "文章未找到", notFoundDesc: "您要查找的文章不存在或已被移动。", gallery: "图片库" }
};

const NewsArticle = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const tr = translations[language as keyof typeof translations] || translations.fr;
  const [articleViews, setArticleViews] = useState(0);
  const [articleShares, setArticleShares] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [sharePopupOpen, setSharePopupOpen] = useState(false);

  const { data: article, isLoading } = useQuery({
    queryKey: ["news-article", slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();
      if (error) return null;
      return data;
    },
    enabled: !!slug
  });

  useEffect(() => {
    if (!article) return;

    setArticleViews(article.views_count ?? 0);
    setArticleShares(article.shares_count ?? 0);

    const viewKey = `news-viewed-${article.id}`;
    if (sessionStorage.getItem(viewKey)) return;

    const incrementView = async () => {
      try {
        sessionStorage.setItem(viewKey, '1');
        const { data } = await supabase.rpc('increment_news_view', { p_news_id: article.id });
        if (typeof data === 'number') setArticleViews(data);
      } catch {
        sessionStorage.removeItem(viewKey);
      }
    };

    incrementView();
  }, [article]);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  const getLocalizedField = (item: any, field: string) => {
    if (!item) return "";
    return item[`${field}_${language}`] || item[`${field}_fr`] || item[field] || "";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(
      language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : language === 'es' ? 'es-ES' : language === 'de' ? 'de-DE' : language === 'zh' ? 'zh-CN' : 'fr-FR',
      { day: 'numeric', month: 'long', year: 'numeric' }
    );
  };

  const parseContent = (content: string) => {
    if (!content) return "";
    if (content.includes('<h2') || content.includes('<h3') || content.includes('<p ')) {
      return content;
    }
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/### (.*?)$/gm, '<h3 class="text-xl font-bold mt-8 mb-4 text-foreground">$1</h3>')
      .replace(/## (.*?)$/gm, '<h2 class="text-2xl font-bold mt-10 mb-6 text-foreground border-b pb-2">$1</h2>')
      .replace(/- (.*?)$/gm, '<li class="ml-4 mb-2">$1</li>')
      .replace(/---/g, '<hr class="my-8 border-border" />')
      .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed text-muted-foreground">')
      .replace(/\n/g, '<br />');
  };

  if (isLoading) {
    return (
      <>
        <SEOHead type="article" />
        <DynamicNavigation />
        <main className="pt-24 min-h-screen bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </>
    );
  }

  if (!article) {
    return (
      <>
        <SEOHead type="article" />
        <DynamicNavigation />
        <main className="pt-24 min-h-screen bg-background">
          <div className="container mx-auto px-4 py-20 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">{tr.notFound}</h1>
            <p className="text-muted-foreground mb-8">{tr.notFoundDesc}</p>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link to="/actualites"><ArrowLeft className="w-4 h-4 mr-2" />{tr.back}</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const parseMediaArray = (value: unknown): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const images = parseMediaArray(article.images);
  const videos = parseMediaArray(article.videos);
  const displayImages = images.length > 0 ? images : (article.featured_image ? [article.featured_image] : []);

  const seoTitle = getLocalizedField(article, 'title') || 'Actualité AgriCapital';
  const seoDescription = (getLocalizedField(article, 'excerpt') || getLocalizedField(article, 'content') || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
  const seoImage = displayImages[0] || undefined;

  const articleUrl = `https://agricapital.ci/actualites/${article.slug}`;

  const handleShare = async () => {
    setSharePopupOpen(true);
    try {
      const { data } = await supabase.rpc('increment_news_share', { p_news_id: article.id });
      if (typeof data === 'number') setArticleShares(data);
    } catch {
      // no-op
    }
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}&quote=${encodeURIComponent(seoTitle)}`, "_blank", "width=600,height=400");
  };
  const shareOnTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(`${seoTitle} — Découvrez cet article sur AgriCapital 🌴`)}`, "_blank", "width=600,height=400");
  };
  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`, "_blank", "width=600,height=400");
  };
  const shareOnWhatsApp = () => {
    const text = `${seoTitle}\n\n${seoDescription}\n\n👉 ${articleUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };
  const copyArticleLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      toast.success(language === 'fr' ? 'Lien copié !' : 'Link copied!');
    } catch {
      toast.error('Copy failed');
    }
  };

  const openLightbox = (index: number) => { setLightboxIndex(index); setLightboxOpen(true); };
  const nextImage = () => setLightboxIndex((prev) => (prev + 1) % displayImages.length);
  const prevImage = () => setLightboxIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": seoTitle,
    "description": seoDescription,
    "image": seoImage ? [seoImage] : undefined,
    "datePublished": article.published_at || article.created_at,
    "dateModified": article.updated_at || article.published_at || article.created_at,
    "author": {
      "@type": "Person",
      "name": article.author || "AgriCapital"
    },
    "publisher": {
      "@type": "Organization",
      "name": "AgriCapital",
      "logo": {
        "@type": "ImageObject",
        "url": "https://agricapital.ci/og-image.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "inLanguage": language
  };

  return (
    <>
      <SEOHead type="article" title={seoTitle} description={seoDescription} image={seoImage} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <DynamicNavigation />
      
      <main className="pt-24 min-h-screen bg-background">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
            <Link to="/actualites"><ArrowLeft className="w-4 h-4 mr-2" />{tr.back}</Link>
          </Button>
        </div>

        <article className="container mx-auto px-4 max-w-4xl">
          <Badge className="mb-4 bg-primary/20 text-primary border-0">
            {article.category || 'Actualité'}
          </Badge>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            {getLocalizedField(article, 'title')}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-8 pb-6 border-b">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(article.published_at || article.created_at)}
            </span>
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {tr.by} {article.author || 'AgriCapital'}
            </span>
            <span className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {articleViews} {tr.views}
            </span>
            {articleShares > 0 && (
              <span className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                {articleShares} {tr.shares}
              </span>
            )}
            <Button variant="ghost" size="sm" className="ml-auto" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />{tr.share}
            </Button>
          </div>

          {/* Hero Image */}
          {displayImages.length > 0 && (
            <div className="mb-8">
              <div className="rounded-xl overflow-hidden shadow-lg cursor-pointer" onClick={() => openLightbox(0)}>
                <img 
                  src={displayImages[0]} 
                  alt={getLocalizedField(article, 'title')}
                  className="w-full aspect-video object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                />
              </div>
            </div>
          )}

          {/* Image Gallery Grid */}
          {displayImages.length > 1 && (
            <div className="mb-10">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">{tr.gallery}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {displayImages.slice(1).map((img, index) => (
                  <div 
                    key={index} 
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer group relative"
                    onClick={() => openLightbox(index + 1)}
                  >
                    <img src={img} alt={`Image ${index + 2}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Video Player */}
          {videos.length > 0 && (
            <div className="mb-10 space-y-4">
              {videos.map((videoUrl, index) => (
                <div key={index} className="rounded-xl overflow-hidden shadow-lg bg-black">
                  <video 
                    controls 
                    preload="metadata"
                    className="w-full aspect-video"
                    poster={displayImages[0] || undefined}
                  >
                    <source src={videoUrl} type="video/mp4" />
                    <source src={videoUrl} type="video/webm" />
                    Votre navigateur ne supporte pas la lecture vidéo.
                  </video>
                </div>
              ))}
            </div>
          )}

          {/* Article Content - sanitized */}
          <div 
            className="prose prose-lg max-w-none mb-16 
              prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground
              prose-li:text-muted-foreground prose-a:text-primary
              prose-table:border-collapse prose-th:bg-muted prose-th:p-3 prose-td:p-3 prose-td:border prose-th:border"
            dangerouslySetInnerHTML={{ 
              __html: DOMPurify.sanitize(
                `<p class="mb-4 leading-relaxed text-muted-foreground">${parseContent(getLocalizedField(article, 'content'))}</p>`,
                { ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'strong', 'em', 'br', 'hr', 'li', 'ul', 'ol', 'a', 'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'blockquote', 'div', 'span'], ALLOWED_ATTR: ['class', 'href', 'src', 'alt', 'target', 'rel'] }
              )
            }}
          />

          <div className="flex justify-center py-8 border-t">
            <Button className="bg-primary hover:bg-primary/90" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />{tr.share}
            </Button>
          </div>
        </article>
      </main>

      {/* Share Popup */}
      <Dialog open={sharePopupOpen} onOpenChange={setSharePopupOpen}>
        <DialogContent className="max-w-sm">
          <h3 className="text-lg font-bold text-foreground mb-4">{tr.share}</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={shareOnFacebook} className="flex items-center gap-2">
              <Facebook className="w-5 h-5 text-blue-600" /> Facebook
            </Button>
            <Button variant="outline" onClick={shareOnTwitter} className="flex items-center gap-2">
              <Twitter className="w-5 h-5 text-sky-500" /> Twitter
            </Button>
            <Button variant="outline" onClick={shareOnLinkedIn} className="flex items-center gap-2">
              <Linkedin className="w-5 h-5 text-blue-700" /> LinkedIn
            </Button>
            <Button variant="outline" onClick={shareOnWhatsApp} className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" /> WhatsApp
            </Button>
          </div>
          <Button variant="secondary" onClick={copyArticleLink} className="w-full mt-3 flex items-center gap-2">
            <Copy className="w-4 h-4" /> {language === 'fr' ? 'Copier le lien' : 'Copy link'}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
          <div className="relative flex items-center justify-center min-h-[60vh]">
            <Button 
              variant="ghost" size="icon"
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-6 h-6" />
            </Button>
            
            {displayImages.length > 1 && (
              <>
                <Button variant="ghost" size="icon" className="absolute left-4 z-50 text-white hover:bg-white/20" onClick={prevImage}>
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button variant="ghost" size="icon" className="absolute right-4 z-50 text-white hover:bg-white/20" onClick={nextImage}>
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}
            
            <img 
              src={displayImages[lightboxIndex]} 
              alt={`Image ${lightboxIndex + 1}`}
              className="max-w-full max-h-[85vh] object-contain"
            />
            
            {displayImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {displayImages.map((_, i) => (
                  <button key={i} onClick={() => setLightboxIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors ${i === lightboxIndex ? 'bg-white' : 'bg-white/40'}`} />
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </>
  );
};

export default NewsArticle;
