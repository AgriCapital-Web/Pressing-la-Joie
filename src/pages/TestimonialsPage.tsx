import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Quote, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

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

const TestimonialsPage = () => {
  const { language } = useLanguage();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestimonial, setSelectedTestimonial] = useState<Testimonial | null>(null);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const { data, error } = await (supabase as any)
          .from('testimonials_public')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error) setTestimonials(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  const getStatusDisplay = (testimonial: Testimonial) => {
    const status = (testimonial as any).status || 'other';
    return statusLabels[status]?.[language] || statusLabels[status]?.fr || statusLabels.other[language];
  };

  const titles: Record<string, { title: string; subtitle: string; back: string }> = {
    fr: { title: "Tous les témoignages", subtitle: "Découvrez ce que nos partenaires et clients disent de nous", back: "Retour à l'accueil" },
    en: { title: "All Testimonials", subtitle: "Discover what our partners and clients say about us", back: "Back to home" },
    ar: { title: "جميع الشهادات", subtitle: "اكتشف ما يقوله شركاؤنا وعملاؤنا عنا", back: "العودة إلى الرئيسية" },
    es: { title: "Todos los testimonios", subtitle: "Descubra lo que dicen nuestros socios y clientes", back: "Volver al inicio" },
    de: { title: "Alle Zeugnisse", subtitle: "Erfahren Sie, was unsere Partner und Kunden über uns sagen", back: "Zurück zur Startseite" },
    zh: { title: "所有推荐", subtitle: "了解我们的合作伙伴和客户对我们的评价", back: "返回首页" },
  };

  const t = titles[language] || titles.fr;

  return (
    <>
      <SEOHead />
      <DynamicNavigation />
      <main className="pt-16 min-h-screen bg-background">
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="mb-6 -ml-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-1.5" />
                {t.back}
              </Button>
            </Link>
            <div className="text-center mb-12">
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">{t.title}</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{t.subtitle}</p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Chargement...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="bg-card rounded-xl p-5 flex flex-col shadow-soft border border-border hover:shadow-medium transition-smooth cursor-pointer"
                    onClick={() => setSelectedTestimonial(testimonial)}
                  >
                    <Quote className="w-6 h-6 text-primary/50 mb-3 shrink-0" />
                    <p className="text-foreground text-sm italic leading-relaxed mb-4 flex-grow">
                      "{testimonial.testimonial.length > 200 ? testimonial.testimonial.slice(0, 200) + '…' : testimonial.testimonial}"
                    </p>
                    <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                      {testimonial.photo_url ? (
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
                          <img src={testimonial.photo_url} alt="" className="w-full h-full object-cover object-top" loading="lazy" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm border-2 border-primary/20 shrink-0">
                          {testimonial.first_name[0]}{testimonial.last_name[0]}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-foreground text-sm">{testimonial.first_name} {testimonial.last_name}</p>
                        <p className="text-xs text-primary font-medium">{getStatusDisplay(testimonial)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />

      <Dialog open={!!selectedTestimonial} onOpenChange={() => setSelectedTestimonial(null)}>
        <DialogContent className="max-w-lg">
          {selectedTestimonial && (
            <div className="p-2">
              <div className="flex items-center gap-4 mb-5">
                {selectedTestimonial.photo_url ? (
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-primary/20 shrink-0">
                    <img src={selectedTestimonial.photo_url} alt="" className="w-full h-full object-cover object-top" />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-lg shrink-0">
                    {selectedTestimonial.first_name[0]}{selectedTestimonial.last_name[0]}
                  </div>
                )}
                <div>
                  <p className="font-bold text-foreground text-lg">{selectedTestimonial.first_name} {selectedTestimonial.last_name}</p>
                  <p className="text-sm text-primary font-medium">{getStatusDisplay(selectedTestimonial)}</p>
                </div>
              </div>
              <div className="bg-secondary/30 rounded-xl p-5">
                <Quote className="w-6 h-6 text-primary/40 mb-3" />
                <p className="text-foreground italic leading-relaxed">"{selectedTestimonial.testimonial}"</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TestimonialsPage;
