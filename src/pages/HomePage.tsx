import { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import DynamicNavigation from "@/components/DynamicNavigation";
import Hero from "@/components/Hero";
import AIChatbot from "@/components/AIChatbot";
import DomainesIntervention from "@/components/DomainesIntervention";
import ClientPortalSection from "@/components/ClientPortalSection";
import Ambitions from "@/components/Ambitions";
import About from "@/components/About";
import Approach from "@/components/Approach";
import Impact from "@/components/Impact";
import Founder from "@/components/Founder";
import Team from "@/components/Team";
import Partnership from "@/components/Partnership";
import SolutionsSummary from "@/components/SolutionsSummary";
import OffersSummary from "@/components/OffersSummary";
import InaugurationSection from "@/components/InaugurationSection";


import Testimonials from "@/components/Testimonials";
import NewsSection from "@/components/NewsSection";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import SEOJsonLD from "@/components/SEOJsonLD";
import { useLanguage, Language } from "@/contexts/LanguageContext";

const sectionMap: Record<string, string> = {
  'accueil': 'hero',
  'home': 'hero',
  'hero': 'hero',
  'a-propos': 'apropos',
  'about': 'apropos',
  'apropos': 'apropos',
  'notre-approche': 'approche',
  'approach': 'approche',
  'approche': 'approche',
  'impact': 'impact',
  'jalons': 'jalons',
  'milestones': 'jalons',
  'fondateur': 'fondateur',
  'founder': 'fondateur',
  'partenariat': 'partenariat',
  'partnership': 'partenariat',
  'temoignages': 'temoignages',
  'testimonials': 'temoignages',
  'contact': 'contact',
  'actualites': 'actualites',
  'news': 'actualites',
  'equipe': 'equipe',
  'team': 'equipe',
  'solutions': 'solutions',
  'services': 'solutions',
  'domaines': 'domaines',
  'espace-client': 'espace-client',
  'client-portal': 'espace-client',
  'inauguration': 'inauguration',
  'comment-ca-marche': 'approche',
  'how-it-works': 'approche',
  'capacite': 'impact',
  'capacity': 'impact',

};

const supportedLanguages: Language[] = ['fr', 'en', 'ar', 'es', 'de', 'zh'];

const HomePage = () => {
  const { lang, section } = useParams();
  const location = useLocation();
  const { language, setLanguage } = useLanguage();

  // CRITICAL: Set language from URL on mount and when URL changes
  useEffect(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const firstPart = pathParts[0]?.toLowerCase();
    
    // Check if the first part of the path is a language code
    if (firstPart && supportedLanguages.includes(firstPart as Language)) {
      const urlLang = firstPart as Language;
      // Always update language from URL - this is critical for SEO and sharing
      if (language !== urlLang) {
        setLanguage(urlLang);
        // Also update localStorage immediately
        localStorage.setItem("language", urlLang);
      }
    } else if (lang && supportedLanguages.includes(lang as Language)) {
      const urlLang = lang as Language;
      if (language !== urlLang) {
        setLanguage(urlLang);
        localStorage.setItem("language", urlLang);
      }
    }
  }, [location.pathname, lang, setLanguage, language]);

  useEffect(() => {
    // Determine section from URL
    let targetSection: string | null = null;
    
    // Check if section is passed via params
    if (section) {
      targetSection = sectionMap[section.toLowerCase()];
    } else {
      // Extract section from pathname (e.g., /impact, /a-propos)
      const pathParts = location.pathname.split('/').filter(Boolean);
      // Skip language code if present
      const sectionPart = supportedLanguages.includes(pathParts[0] as Language) 
        ? pathParts[1] 
        : pathParts[0];
      
      if (sectionPart && sectionMap[sectionPart.toLowerCase()]) {
        targetSection = sectionMap[sectionPart.toLowerCase()];
      }
    }

    // Hash based navigation (e.g. /#approche) coming from other pages
    if (!targetSection && location.hash) {
      const raw = location.hash.replace('#', '').toLowerCase();
      targetSection = sectionMap[raw] || raw;
    }

    if (targetSection) {
      // Retry a few times: lazy sections may not be mounted on first tick
      let attempts = 0;
      const tryScroll = () => {
        const element = document.getElementById(targetSection!);
        if (element) {
          const top = element.getBoundingClientRect().top + window.scrollY - 80;
          window.scrollTo({ top, behavior: 'smooth' });
          return true;
        }
        return false;
      };
      if (tryScroll()) return;
      const interval = window.setInterval(() => {
        attempts += 1;
        if (tryScroll() || attempts > 20) window.clearInterval(interval);
      }, 120);
      return () => window.clearInterval(interval);
    }
  }, [section, location.pathname, location.hash]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden max-w-full">
      <SEOHead />
      <SEOJsonLD />
      <AIChatbot />
      <DynamicNavigation />
      <Hero />

      <OffersSummary />
      <ClientPortalSection />
      <DomainesIntervention />
      <InaugurationSection />
      <About />

      <Ambitions />
      <Approach />
      <SolutionsSummary />
      <Impact />
      <Founder />
      <Team />
      <Partnership />
      <Testimonials />
      <NewsSection />
      <Contact />
      <Footer />
    </div>
  );
};

export default HomePage;
