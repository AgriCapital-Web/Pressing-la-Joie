import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Sprout, Target } from "lucide-react";
import palmMature from "@/assets/palm-mature-plantation.jpg";
import nurseryImage1 from "@/assets/nursery-dec-2025-1.jpg";
import nurseryApril2026 from "@/assets/palm-nursery-april2026.jpg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Milestones = () => {
  const { t, language } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Use the new authentic mature palm plantation photo for the gallery (replaces jalon-1..7)
  const galleryImages = [
    palmMature,
    palmMature,
    palmMature,
    palmMature,
  ];

  const translations = {
    fr: {
      nurseryTitle: "Pépinière 100+ Hectares",
      nurseryBadge: "Nouveau - Déc. 2025",
      nurseryDesc: "Installation complète de notre site de pépinière de plus de 100 hectares entre le 19 novembre et le 24 décembre 2025, avec système d'irrigation moderne et plants certifiés Tenera.",
      seeMore: "Voir toute l'évolution du projet",
      growthTitle: "Pépinière en Pleine Croissance",
      growthBadge: "Actuel - Avril 2026",
      growthDesc: "Plus de 100 hectares de pépinière sont actuellement en pleine croissance. La pépinière fait l'objet d'un entretien régulier et structuré. Cette étape représente une avancée concrète dans le déploiement opérationnel du projet AgriCapital.",
    },
    en: {
      nurseryTitle: "100+ Hectare Nursery",
      nurseryBadge: "New - Dec. 2025",
      nurseryDesc: "Complete installation of our 100+ hectare nursery site between November 19 and December 24, 2025, with modern irrigation system and certified Tenera seedlings.",
      seeMore: "See full project evolution",
      growthTitle: "Nursery in Full Growth",
      growthBadge: "Current - April 2026",
      growthDesc: "Over 100 hectares of nursery are currently in full growth. The nursery is regularly and systematically maintained. This stage represents a concrete advance in the operational deployment of the AgriCapital project.",
    }
  };

  const trans = translations[language as keyof typeof translations] || translations.fr;

  return (
    <section id="jalons" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.milestones.title}
          </h2>
        </div>

        {/* April 2026 Milestone - Nursery in Full Growth (FIRST in timeline) */}
        <Card className="bg-gradient-to-r from-emerald-500/10 to-agri-green/10 border-agri-green border-2 mb-6 overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="lg:w-1/3">
                <div
                  className="relative rounded-xl overflow-hidden aspect-[4/3] cursor-pointer shadow-lg"
                  onClick={() => setSelectedImage(nurseryApril2026)}
                >
                  <img
                    src={nurseryApril2026}
                    alt={trans.growthTitle}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-agri-green text-white animate-pulse">
                      <Sprout className="w-3 h-3 mr-1" />
                      {trans.growthBadge}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="lg:w-2/3 text-center lg:text-left">
                <div className="flex items-center gap-2 mb-3 justify-center lg:justify-start">
                  <Target className="w-6 h-6 text-agri-green" />
                  <h3 className="text-2xl font-bold text-agri-green">
                    {trans.growthTitle}
                  </h3>
                </div>
                <div className="flex items-center gap-2 mb-4 justify-center lg:justify-start">
                  <Badge variant="outline" className="text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    {language === 'fr' ? 'Avril 2026' : 'April 2026'}
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-2">{trans.growthDesc}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Nursery Milestone Card */}
        <Card className="bg-gradient-to-r from-agri-green/5 to-emerald-500/5 border-agri-green/30 border-2 mb-8 overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              <div className="lg:w-1/3">
                <div 
                  className="relative rounded-xl overflow-hidden aspect-[4/3] cursor-pointer shadow-lg"
                  onClick={() => setSelectedImage(nurseryImage1)}
                >
                  <img 
                    src={nurseryImage1} 
                    alt="Pépinière AgriCapital" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-agri-orange text-white animate-pulse">
                      <Sprout className="w-3 h-3 mr-1" />
                      {trans.nurseryBadge}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="lg:w-2/3 text-center lg:text-left">
                <div className="flex items-center gap-2 mb-3 justify-center lg:justify-start">
                  <Target className="w-6 h-6 text-agri-green" />
                  <h3 className="text-2xl font-bold text-agri-green">
                    {trans.nurseryTitle}
                  </h3>
                </div>
                <div className="flex items-center gap-2 mb-4 justify-center lg:justify-start">
                  <Badge variant="outline" className="text-muted-foreground">
                    <Calendar className="w-3 h-3 mr-1" />
                    19 Nov - 24 Déc 2025
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-6">{trans.nurseryDesc}</p>
                <Button asChild className="bg-agri-green hover:bg-agri-green-dark">
                  <Link to="/evolution">
                    {trans.seeMore}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border mb-8">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-agri-green mb-4">
              {t.milestones.eventTitle}
            </h3>
            
            <div className="prose max-w-none text-muted-foreground space-y-4">
              <p>{t.milestones.description1}</p>
              <p>{t.milestones.description2}</p>
              <p>{t.milestones.description3}</p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12">
          <h4 className="text-xl font-bold text-foreground mb-6 text-center">
            {t.milestones.galleryTitle}
          </h4>
          
          <Carousel
            opts={{
              align: "start",
              loop: true,
              dragFree: true,
            }}
            className="w-full max-w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {galleryImages.map((image, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 basis-full xs:basis-1/2 sm:basis-1/3 lg:basis-1/4">
                  <div
                    className="cursor-pointer overflow-hidden rounded-lg hover:shadow-medium transition-smooth aspect-[4/3]"
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image}
                      alt={`${t.milestones.galleryTitle} ${index + 1}`}
                      className="w-full h-full object-cover object-top hover:scale-105 transition-smooth"
                      loading="lazy"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="-left-2 md:-left-6" />
            <CarouselNext className="-right-2 md:-right-6" />
          </Carousel>
        </div>
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-2">
          {selectedImage && (
            <img
              src={selectedImage}
              alt={t.milestones.galleryTitle}
              className="w-full h-auto rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Milestones;
