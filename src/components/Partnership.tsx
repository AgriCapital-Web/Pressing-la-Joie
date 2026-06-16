import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Briefcase, Factory, Wrench, Heart, CheckCircle2, Handshake } from "lucide-react";
import lesPalmistesLogo from "@/assets/les-palmistes-logo.jpeg";
import { useLanguage } from "@/contexts/LanguageContext";
import PartnershipRequestForm from "@/components/PartnershipRequestForm";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Partners list - easy to extend
const partners = [
  {
    id: 1,
    logo: lesPalmistesLogo,
    nameKey: "name",
    descKey: "desc",
  },
  // Add more partners here as they join
  // {
  //   id: 2,
  //   logo: partnerLogo2,
  //   nameKey: "name2",
  //   descKey: "desc2",
  // },
];

const Partnership = () => {
  const { t } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const opportunities = [
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: t.partnership.opportunities.investor.title,
      description: t.partnership.opportunities.investor.desc,
    },
    {
      icon: <Factory className="w-8 h-8" />,
      title: t.partnership.opportunities.industrial?.title || "Partenaires Industriels",
      description: t.partnership.opportunities.industrial?.desc || "Collaborer pour sécuriser l'approvisionnement en régimes de palmier frais certifiés, traçables et de qualité supérieure.",
    },
    {
      icon: <Wrench className="w-8 h-8" />,
      title: t.partnership.opportunities.technical?.title || "Partenaires Techniques",
      description: t.partnership.opportunities.technical?.desc || "S'associer pour renforcer l'expertise agronomique, la formation des producteurs et la certification des pratiques agricoles durables.",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: t.partnership.opportunities.institution.title,
      description: t.partnership.opportunities.institution.desc,
    },
  ];

  const advantages = [
    t.partnership.advantages.demand || "Demande confirmée par une enquête terrain rigoureuse",
    t.partnership.advantages.team || "Équipe expérimentée et ancrée localement depuis plus de 10 ans",
    t.partnership.advantages.approach || "Approche innovante répondant à un besoin réel et structurel",
    t.partnership.advantages.expansion || "Fort potentiel d'expansion régional",
    t.partnership.advantages.sdg || "Impact mesurable et aligné avec les ODD",
    t.partnership.advantages.transparency || "Transparence et relations basées sur la confiance",
  ];

  const scrollToContact = () => {
    const element = document.getElementById("contact");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="partenariat" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.partnership.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t.partnership.subtitle}
          </p>
        </div>

        {/* Current Partner - compact responsive card */}
        <div className="mb-12 max-w-[260px] sm:max-w-xs mx-auto">
          <h3 className="text-base sm:text-lg font-bold text-foreground mb-3 text-center">
            {t.partnership.currentPartner.title}
          </h3>

          <Carousel className="w-full" opts={{ align: "center", loop: true }}>
            <CarouselContent>
              {partners.map((partner) => (
                <CarouselItem key={partner.id} className="basis-full">
                  <Card className="bg-primary/5 border-primary/20 rounded-lg">
                    <CardContent className="p-3 flex flex-col items-center">
                      <div className="bg-card rounded-md p-2 shadow-soft w-full max-w-[120px] mb-2">
                        <img
                          src={partner.logo}
                          alt="Les Palmistes - Fournisseur de semences certifiées"
                          className="w-full h-auto max-h-20 object-contain"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                      <h4 className="text-sm font-bold text-foreground mb-0.5 text-center leading-tight">
                        {t.partnership.currentPartner.name}
                      </h4>
                      <p className="text-xs text-muted-foreground text-center leading-snug">
                        {t.partnership.currentPartner.desc}
                      </p>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            {partners.length > 1 && (
              <>
                <CarouselPrevious className="hidden md:flex -left-10 h-8 w-8" />
                <CarouselNext className="hidden md:flex -right-10 h-8 w-8" />
              </>
            )}
          </Carousel>

          <p className="text-center text-xs text-muted-foreground mt-3 px-2">
            {t.partnership.otherPartnerships}
          </p>
        </div>

        {/* Opportunities */}
        <div className="mb-16">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-12 text-center">
            {t.partnership.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {opportunities.map((opp, index) => (
              <Card key={index} className="bg-card border-border hover:shadow-medium transition-smooth">
                <CardContent className="p-8">
                  <div className="text-accent mb-4">{opp.icon}</div>
                  <h4 className="text-xl font-bold text-foreground mb-4">{opp.title}</h4>
                  <p className="text-muted-foreground leading-relaxed mb-6">{opp.description}</p>
                  <Button
                    onClick={scrollToContact}
                    variant="outline"
                    className="border-accent text-accent hover:bg-accent hover:text-white transition-smooth"
                  >
                    {t.partnership.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA - Demande de partenariat */}
        <div className="text-center mb-16">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="bg-agri-green hover:bg-agri-green/90 text-white px-8 py-6 text-lg shadow-lg"
              >
                <Handshake className="w-6 h-6 mr-3" />
                {t.partnership.cta || "Demander un partenariat"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <PartnershipRequestForm />
            </DialogContent>
          </Dialog>
        </div>

        {/* Advantages */}
        <div className="bg-background rounded-2xl p-8 md:p-12">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-8 text-center">
            {t.partnership.advantages.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {advantages.map((advantage, index) => (
              <div key={index} className="flex items-start gap-4">
                <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                <p className="text-foreground text-lg">{advantage}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partnership;
