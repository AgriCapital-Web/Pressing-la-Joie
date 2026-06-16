import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import PartnershipRequestForm from "@/components/PartnershipRequestForm";

const PartnershipRequest = () => {
  const { language } = useLanguage();

  const translations = {
    fr: { backHome: "Retour à l'accueil" },
    en: { backHome: "Back to home" },
    ar: { backHome: "العودة للرئيسية" },
    es: { backHome: "Volver al inicio" },
    de: { backHome: "Zurück zur Startseite" },
    zh: { backHome: "返回首页" },
  };

  const tr = translations[language as keyof typeof translations] || translations.fr;

  return (
    <>
      <SEOHead />
      <DynamicNavigation />
      
      <main className="pt-20 min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                {tr.backHome}
              </Link>
            </Button>
          </div>

          <PartnershipRequestForm />
        </div>
      </main>

      <Footer />
    </>
  );
};

export default PartnershipRequest;
