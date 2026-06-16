import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Autoplay from "embla-carousel-autoplay";
import { Quote, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Testimonial {
  id: string;
  first_name: string;
  last_name: string;
  testimonial: string;
  photo_url: string | null;
  created_at: string;
  status?: string;
  is_agricapital_subscriber?: boolean;
}

const statusLabels: Record<string, Record<string, string>> = {
  planteur: { fr: "Planteur", en: "Farmer", ar: "مزارع", es: "Agricultor", de: "Bauer", zh: "种植者" },
  partenaire: { fr: "Partenaire", en: "Partner", ar: "شريك", es: "Socio", de: "Partner", zh: "合作伙伴" },
  investisseur: { fr: "Investisseur", en: "Investor", ar: "مستثمر", es: "Inversor", de: "Investor", zh: "投资者" },
  institution: { fr: "Institution / ONG", en: "Institution / NGO", ar: "مؤسسة", es: "Institución", de: "Institution", zh: "机构" },
  proprietaire: { fr: "Propriétaire terrien", en: "Landowner", ar: "مالك أرض", es: "Propietario", de: "Landbesitzer", zh: "土地所有者" },
  other: { fr: "Partenaire", en: "Partner", ar: "شريك", es: "Socio", de: "Partner", zh: "合作伙伴" },
};

const MAX_CHARS = 120;

const TestimonialsDisplay = () => {
  const { language } = useLanguage();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('testimonials_public')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching testimonials:', error);
        return;
      }

      setTestimonials(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusDisplay = (testimonial: Testimonial) => {
    const status = (testimonial as any).status || 'other';
    const isSubscriber = (testimonial as any).is_agricapital_subscriber;
    
    const statusLabel = statusLabels[status]?.[language] || statusLabels[status]?.fr || statusLabels.other[language];
    
    if (status === 'planteur' && isSubscriber) {
      const subscriberText: Record<string, string> = {
        fr: "Souscripteur AgriCapital",
        en: "AgriCapital Subscriber",
        ar: "مشترك أغريكابيتال",
        es: "Suscriptor AgriCapital",
        de: "AgriCapital Abonnent",
        zh: "AgriCapital订户"
      };
      return { main: statusLabel, sub: subscriberText[language] || subscriberText.fr };
    }
    
    return { main: statusLabel, sub: null };
  };

  const readMoreText: Record<string, string> = {
    fr: "Lire le témoignage complet",
    en: "Read full testimonial",
    ar: "اقرأ الشهادة الكاملة",
    es: "Leer testimonio completo",
    de: "Vollständiges Zeugnis lesen",
    zh: "阅读完整推荐",
  };

  const seeMoreText: Record<string, string> = {
    fr: "Voir plus de témoignages",
    en: "See more testimonials",
    ar: "عرض المزيد من الشهادات",
    es: "Ver más testimonios",
    de: "Mehr Zeugnisse anzeigen",
    zh: "查看更多推荐",
  };

  const leaveTestimonialText: Record<string, string> = {
    fr: "Laisser un témoignage",
    en: "Leave a testimonial",
    ar: "اترك شهادة",
    es: "Dejar un testimonio",
    de: "Zeugnis hinterlassen",
    zh: "留下推荐",
  };

  if (loading || testimonials.length === 0) {
    return null;
  }

  return (
    <section id="temoignages" className="py-16 sm:py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {language === 'fr' ? 'Témoignages' : language === 'en' ? 'Testimonials' : language === 'ar' ? 'شهادات' : language === 'es' ? 'Testimonios' : language === 'de' ? 'Zeugnisse' : '见证'}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {language === 'fr' ? 'Ce que nos partenaires disent de nous' : language === 'en' ? 'What our partners say about us' : language === 'ar' ? 'ما يقوله شركاؤنا عنا' : language === 'es' ? 'Lo que dicen nuestros socios' : language === 'de' ? 'Was unsere Partner über uns sagen' : '我们的合作伙伴如何评价我们'}
          </p>
        </div>

        <Carousel
          opts={{ align: "start", loop: true }}
          plugins={[Autoplay({ delay: 5000 })]}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent>
            {testimonials.map((testimonial) => {
              const statusDisplay = getStatusDisplay(testimonial);
              const isLong = testimonial.testimonial.length > MAX_CHARS;
              const truncated = isLong ? testimonial.testimonial.slice(0, MAX_CHARS) + "…" : testimonial.testimonial;

              return (
                <CarouselItem key={testimonial.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-3">
                    <div className="bg-card rounded-xl p-5 h-full flex flex-col shadow-soft border border-border hover:shadow-medium transition-smooth min-h-[220px]">
                      <Quote className="w-6 h-6 text-primary/60 mb-3 shrink-0" />
                      
                      <p className="text-foreground text-sm mb-3 flex-grow italic leading-relaxed">
                        "{truncated}"
                      </p>

                      {isLong && (
                        <button
                          onClick={() => setSelectedTestimonial(testimonial)}
                          className="text-xs text-primary hover:text-primary/80 font-medium mb-3 text-left transition-colors"
                        >
                          {readMoreText[language] || readMoreText.fr} →
                        </button>
                      )}
                      
                      <div className="flex items-center gap-3 mt-auto pt-3 border-t border-border/50">
                        {testimonial.photo_url ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
                            <img
                              src={testimonial.photo_url}
                              alt={`${testimonial.first_name} ${testimonial.last_name}`}
                              className="w-full h-full object-cover object-top"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm border-2 border-primary/20 shrink-0">
                            {testimonial.first_name[0]}{testimonial.last_name[0]}
                          </div>
                        )}
                        
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground text-sm truncate">
                            {testimonial.first_name} {testimonial.last_name}
                          </p>
                          <p className="text-xs text-primary font-medium">
                            {statusDisplay.main}
                          </p>
                          {statusDisplay.sub && (
                            <p className="text-xs text-muted-foreground italic truncate">
                              {statusDisplay.sub}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>

        {/* See more button moved below the testimonials form section */}
      </div>

      {/* Full testimonial dialog */}
      <Dialog open={!!selectedTestimonial} onOpenChange={() => setSelectedTestimonial(null)}>
        <DialogContent className="max-w-lg">
          {selectedTestimonial && (() => {
            const statusDisplay = getStatusDisplay(selectedTestimonial);
            return (
              <div className="p-2">
                <div className="flex items-center gap-4 mb-5">
                  {selectedTestimonial.photo_url ? (
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
                      <img
                        src={selectedTestimonial.photo_url}
                        alt={`${selectedTestimonial.first_name} ${selectedTestimonial.last_name}`}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg border-2 border-primary/20 shrink-0">
                      {selectedTestimonial.first_name[0]}{selectedTestimonial.last_name[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-foreground text-lg">
                      {selectedTestimonial.first_name} {selectedTestimonial.last_name}
                    </p>
                    <p className="text-sm text-primary font-medium">{statusDisplay.main}</p>
                    {statusDisplay.sub && (
                      <p className="text-xs text-muted-foreground italic">{statusDisplay.sub}</p>
                    )}
                  </div>
                </div>
                <div className="bg-secondary/30 rounded-xl p-5">
                  <Quote className="w-6 h-6 text-primary/40 mb-3" />
                  <p className="text-foreground italic leading-relaxed">
                    "{selectedTestimonial.testimonial}"
                  </p>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default TestimonialsDisplay;
