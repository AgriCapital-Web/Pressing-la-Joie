import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, ArrowRight, Newspaper, Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const translations = {
  fr: { title: "Actualités", subtitle: "Suivez les dernières nouvelles et évolutions d'AgriCapital", noNews: "Aucune actualité pour le moment", readMore: "Lire la suite", evolution: "Voir l'évolution", views: "vues", by: "Par", seeAll: "Toutes les actualités", featured: "À la une" },
  en: { title: "News", subtitle: "Follow the latest news and developments from AgriCapital", noNews: "No news at the moment", readMore: "Read more", evolution: "See evolution", views: "views", by: "By", seeAll: "All news", featured: "Featured" },
  ar: { title: "الأخبار", subtitle: "تابع آخر الأخبار والتطورات من أغريكابيتال", noNews: "لا توجد أخبار حالياً", readMore: "اقرأ المزيد", evolution: "شاهد التطور", views: "مشاهدات", by: "بواسطة", seeAll: "جميع الأخبار", featured: "مميز" },
  es: { title: "Noticias", subtitle: "Siga las últimas noticias y desarrollos de AgriCapital", noNews: "No hay noticias por el momento", readMore: "Leer más", evolution: "Ver evolución", views: "vistas", by: "Por", seeAll: "Todas las noticias", featured: "Destacado" },
  de: { title: "Nachrichten", subtitle: "Verfolgen Sie die neuesten Nachrichten und Entwicklungen von AgriCapital", noNews: "Derzeit keine Nachrichten", readMore: "Weiterlesen", evolution: "Entwicklung ansehen", views: "Aufrufe", by: "Von", seeAll: "Alle Nachrichten", featured: "Aktuell" },
  zh: { title: "新闻", subtitle: "关注AgriCapital的最新新闻和发展动态", noNews: "暂无新闻", readMore: "阅读更多", evolution: "查看发展", views: "浏览量", by: "作者", seeAll: "所有新闻", featured: "头条" }
};

const News = () => {
  const { language } = useLanguage();
  const tr = translations[language as keyof typeof translations] || translations.fr;

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const { data: newsFromDb } = useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    }
  });

  const getLocalizedField = (item: any, field: string) => {
    return item[`${field}_${language}`] || item[`${field}_fr`] || item[field] || "";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const featuredArticle = newsFromDb?.find(a => a.is_featured) || newsFromDb?.[0];
  const otherArticles = newsFromDb?.filter(a => a.id !== featuredArticle?.id) || [];

  // Parse images from JSON
  const getFeaturedImages = (article: any): string[] => {
    if (!article) return [];
    const imgs = article.images
      ? (Array.isArray(article.images) ? article.images : JSON.parse(article.images || '[]'))
      : [];
    return imgs.length > 0 ? imgs : (article.featured_image ? [article.featured_image] : []);
  };

  const getVideos = (article: any): string[] => {
    if (!article) return [];
    const vids = article.videos
      ? (Array.isArray(article.videos) ? article.videos : JSON.parse(article.videos || '[]'))
      : [];
    return vids;
  };

  return (
    <>
      <SEOHead />
      <DynamicNavigation />
      
      <main className="pt-20 min-h-screen bg-background">
        {/* Hero */}
        <section className="py-12 md:py-16 bg-gradient-to-br from-primary/10 to-accent/5">
          <div className="container mx-auto px-4 text-center">
            <Badge className="mb-4 bg-primary/20 text-primary border-0">
              <Newspaper className="w-4 h-4 mr-2" />
              {tr.title}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">{tr.title}</h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">{tr.subtitle}</p>
          </div>
        </section>

        {/* Featured Article */}
        {featuredArticle && (
          <section className="py-12">
            <div className="container mx-auto px-4">
              <Card className="overflow-hidden border-2 border-primary/20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="relative">
                    {getFeaturedImages(featuredArticle).length > 0 ? (
                      <Carousel className="w-full">
                        <CarouselContent>
                          {getFeaturedImages(featuredArticle).map((img: string, index: number) => (
                            <CarouselItem key={index}>
                              <div className="aspect-video">
                                <img src={img} alt={`Image ${index + 1}`} className="w-full h-full object-cover" loading="lazy" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        {getFeaturedImages(featuredArticle).length > 1 && (
                          <>
                            <CarouselPrevious className="left-2" />
                            <CarouselNext className="right-2" />
                          </>
                        )}
                      </Carousel>
                    ) : (
                      <div className="aspect-video bg-muted flex items-center justify-center">
                        <Newspaper className="w-16 h-16 text-muted-foreground/30" />
                      </div>
                    )}
                    {getVideos(featuredArticle).length > 0 && (
                      <div className="absolute bottom-3 right-3">
                        <Badge className="bg-black/70 text-white border-0">
                          <Play className="w-3 h-3 mr-1" /> Vidéo
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-6 md:p-8 flex flex-col justify-center">
                    <Badge className="w-fit mb-4 bg-accent/20 text-accent-foreground border-0">{tr.featured}</Badge>
                    <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                      {getLocalizedField(featuredArticle, 'title')}
                    </h2>
                    <p className="text-muted-foreground mb-4 line-clamp-4">
                      {getLocalizedField(featuredArticle, 'excerpt') || getLocalizedField(featuredArticle, 'content').replace(/<[^>]*>/g, '').substring(0, 200)}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(featuredArticle.published_at || featuredArticle.created_at)}
                      </span>
                      <span>{tr.by} {featuredArticle.author || 'AgriCapital'}</span>
                      {(featuredArticle.views_count ?? 0) > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" /> {featuredArticle.views_count} {tr.views}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button asChild className="bg-primary hover:bg-primary/90">
                        <Link to={`/actualites/${featuredArticle.slug}`}>
                          {tr.readMore}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/evolution">{tr.evolution}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>
          </section>
        )}

        {/* News Grid */}
        {otherArticles.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8">{tr.seeAll}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherArticles.map((article: any) => (
                  <Link key={article.id} to={`/actualites/${article.slug}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full group">
                      <div className="relative">
                        {article.featured_image ? (
                          <div className="aspect-video overflow-hidden">
                            <img 
                              src={article.featured_image} 
                              alt={getLocalizedField(article, 'title')}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                              onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                            />
                          </div>
                        ) : (
                          <div className="aspect-video bg-muted flex items-center justify-center">
                            <Newspaper className="w-10 h-10 text-muted-foreground/30" />
                          </div>
                        )}
                        {getVideos(article).length > 0 && (
                          <div className="absolute bottom-2 right-2">
                            <Badge className="bg-black/70 text-white border-0 text-[10px]">
                              <Play className="w-2.5 h-2.5 mr-0.5" /> Vidéo
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                          {getLocalizedField(article, 'title')}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                          {getLocalizedField(article, 'excerpt') || getLocalizedField(article, 'content').replace(/<[^>]*>/g, '').substring(0, 150)}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(article.published_at || article.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {article.views_count || 0} {tr.views}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* No news fallback */}
        {(!newsFromDb || newsFromDb.length === 0) && (
          <section className="py-20">
            <div className="container mx-auto px-4 text-center">
              <Newspaper className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <p className="text-muted-foreground text-lg">{tr.noNews}</p>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
};

export default News;
