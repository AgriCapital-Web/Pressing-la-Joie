import { Facebook, Twitter, Linkedin, Share2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

interface SocialShareButtonsProps {
  variant?: "hero" | "footer" | "inline";
  className?: string;
}

const SocialShareButtons = ({ variant = "inline", className = "" }: SocialShareButtonsProps) => {
  const { language, t } = useLanguage();
  
  const getShareData = () => {
    const baseUrl = "https://agricapital.ci";
    const url = language === "fr" ? baseUrl : `${baseUrl}/${language}`;
    
    const titles: Record<string, string> = {
      fr: "AgriCapital - Le partenaire idéal des producteurs agricoles",
      en: "AgriCapital - The ideal partner for agricultural producers",
      ar: "أجري كابيتال - الشريك المثالي للمنتجين الزراعيين",
      es: "AgriCapital - El socio ideal de los productores agrícolas",
      de: "AgriCapital - Der ideale Partner für landwirtschaftliche Produzenten",
      zh: "农业资本 - 农业生产者的理想合作伙伴",
    };
    
    const descriptions: Record<string, string> = {
      fr: "Découvrez AgriCapital, votre partenaire pour l'accompagnement agricole en Côte d'Ivoire. Modèle innovant pour la filière palmier à huile.",
      en: "Discover AgriCapital, your partner for agricultural support in Côte d'Ivoire. Innovative model for the oil palm industry.",
      ar: "اكتشف أجري كابيتال، شريكك للدعم الزراعي في كوت ديفوار. نموذج مبتكر لصناعة زيت النخيل.",
      es: "Descubre AgriCapital, tu socio para el apoyo agrícola en Costa de Marfil. Modelo innovador para la industria del aceite de palma.",
      de: "Entdecken Sie AgriCapital, Ihren Partner für landwirtschaftliche Unterstützung in der Elfenbeinküste. Innovatives Modell für die Palmölindustrie.",
      zh: "发现农业资本，您在科特迪瓦农业支持的合作伙伴。油棕产业的创新模式。",
    };
    
    return {
      url,
      title: titles[language] || titles.fr,
      description: descriptions[language] || descriptions.fr,
    };
  };
  
  const shareData = getShareData();
  
  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}&quote=${encodeURIComponent(shareData.title)}`,
      "_blank",
      "width=600,height=400"
    );
  };
  
  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.title)}`,
      "_blank",
      "width=600,height=400"
    );
  };
  
  const shareOnLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`,
      "_blank",
      "width=600,height=400"
    );
  };
  
  const shareOnWhatsApp = () => {
    const text = `${shareData.title}\n\n${shareData.description}\n\n${shareData.url}`;
    window.open(
      `https://wa.me/?text=${encodeURIComponent(text)}`,
      "_blank"
    );
  };
  
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url);
      toast.success(language === "fr" ? "Lien copié !" : "Link copied!");
    } catch {
      toast.error(language === "fr" ? "Erreur lors de la copie" : "Copy failed");
    }
  };
  
  if (variant === "hero") {
    return (
      <div className={`flex items-center justify-center gap-3 mt-6 ${className}`}>
        <span className="text-white/80 text-sm hidden sm:inline">
          {language === "fr" ? "Partagez :" : "Share:"}
        </span>
        <Button
          size="sm"
          variant="ghost"
          onClick={shareOnFacebook}
          className="text-white hover:bg-white/20 p-2 h-9 w-9"
          aria-label="Partager sur Facebook"
        >
          <Facebook className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={shareOnTwitter}
          className="text-white hover:bg-white/20 p-2 h-9 w-9"
          aria-label="Partager sur Twitter"
        >
          <Twitter className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={shareOnLinkedIn}
          className="text-white hover:bg-white/20 p-2 h-9 w-9"
          aria-label="Partager sur LinkedIn"
        >
          <Linkedin className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={shareOnWhatsApp}
          className="text-white hover:bg-white/20 p-2 h-9 w-9"
          aria-label="Partager sur WhatsApp"
        >
          <MessageCircle className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={copyLink}
          className="text-white hover:bg-white/20 p-2 h-9 w-9"
          aria-label="Copier le lien"
        >
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button size="icon" variant="outline" onClick={shareOnFacebook} aria-label="Facebook">
        <Facebook className="w-4 h-4" />
      </Button>
      <Button size="icon" variant="outline" onClick={shareOnTwitter} aria-label="Twitter">
        <Twitter className="w-4 h-4" />
      </Button>
      <Button size="icon" variant="outline" onClick={shareOnLinkedIn} aria-label="LinkedIn">
        <Linkedin className="w-4 h-4" />
      </Button>
      <Button size="icon" variant="outline" onClick={shareOnWhatsApp} aria-label="WhatsApp">
        <MessageCircle className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default SocialShareButtons;
