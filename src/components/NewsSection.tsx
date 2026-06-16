import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowRight, Newspaper, TrendingUp, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const translations = {
  fr: { title: "Actualités", subtitle: "Les dernières nouvelles d'AgriCapital", moreNews: "Plus d'actualités", evolution: "Voir l'évolution", readMore: "Lire la suite", noNews: "Restez connectés pour les prochaines actualités", views: "vues" },
  en: { title: "News", subtitle: "The latest news from AgriCapital", moreNews: "More news", evolution: "See evolution", readMore: "Read more", noNews: "Stay tuned for upcoming news", views: "views" },
  ar: { title: "الأخبار", subtitle: "آخر أخبار أغريكابيتال", moreNews: "المزيد من الأخبار", evolution: "شاهد التطور", readMore: "اقرأ المزيد", noNews: "ترقبوا الأخبار القادمة", views: "مشاهدات" },
  es: { title: "Noticias", subtitle: "Las últimas noticias de AgriCapital", moreNews: "Más noticias", evolution: "Ver evolución", readMore: "Leer más", noNews: "Manténgase atento a las próximas noticias", views: "vistas" },
  de: { title: "Nachrichten", subtitle: "Die neuesten Nachrichten von AgriCapital", moreNews: "Mehr Nachrichten", evolution: "Entwicklung ansehen", readMore: "Weiterlesen", noNews: "Bleiben Sie dran für kommende Nachrichten", views: "Aufrufe" },
  zh: { title: "新闻", subtitle: "AgriCapital的最新消息", moreNews: "更多新闻", evolution: "查看发展", readMore: "阅读更多", noNews: "敬请关注即将发布的新闻", views: "浏览量" }
};

const NewsSection = () => {
  const { language } = useLanguage();
  const tr = translations[language as keyof typeof translations] || translations.fr;

  const { data: newsFromDb } = useQuery({
    queryKey: ["news-section"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data || [];
    }
  });

  const newsItems = newsFromDb || [];

  const getLocalizedField = (item: any, field: string) => {
    const langField = `${field}_${language}`;
    return item[langField] || item[`${field}_fr`] || item[field] || "";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'fr-FR', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  return (
    <section id="actualites" className="py-16 md:py-24 bg-gradient-to-br from-muted/50 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-agri-green/20 text-agri-green border-0">
            <Newspaper className="w-4 h-4 mr-2" />
            {tr.title}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {tr.subtitle}
          </h2>
        </div>

        {newsItems.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">{tr.noNews}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {newsItems.map((article: any, index) => (
              <Link 
                key={article.id}
                to={article.slug ? `/actualites/${article.slug}` : `/actualites`}
                className="block group"
              >
                <Card className={`overflow-hidden hover:shadow-lg transition-all duration-300 h-full ${
                  index === 0 ? 'border-2 border-agri-green/30' : ''
                }`}>
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={article.featured_image || "/placeholder.svg"} 
                      alt={getLocalizedField(article, 'title')}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                    />
                  </div>
                  <CardContent className="p-4 md:p-6">
                    {index === 0 && (
                      <Badge className="mb-3 bg-agri-orange/20 text-agri-orange border-0 text-xs">
                        À la une
                      </Badge>
                    )}
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                      {getLocalizedField(article, 'title')}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {getLocalizedField(article, 'excerpt')}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(article.published_at || article.created_at)}
                        </span>
                        {article.views_count > 0 && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {article.views_count}
                          </span>
                        )}
                      </div>
                      <span className="text-agri-green group-hover:text-agri-green/80 text-sm font-medium flex items-center gap-1">
                        {tr.readMore}
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="bg-agri-green hover:bg-agri-green/90">
            <Link to="/actualites" className="flex items-center gap-2">
              <Newspaper className="w-4 h-4" />
              {tr.moreNews}
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/evolution" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {tr.evolution}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
