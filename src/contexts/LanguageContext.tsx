import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, Language } from "@/lib/translations";

export type { Language };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.fr;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const supportedLanguages: Language[] = ['fr', 'en', 'ar', 'es', 'de', 'zh'];

const detectLanguageFromURL = (): Language | null => {
  const pathname = window.location.pathname;
  const pathLang = pathname.split('/')[1]?.toLowerCase();
  
  if (pathLang && supportedLanguages.includes(pathLang as Language)) {
    return pathLang as Language;
  }
  return null;
};

const detectBrowserLanguage = (): Language => {
  // IMPORTANT: French is the PRIMARY and DEFAULT language for AgriCapital
  // This is because AgriCapital is based in Côte d'Ivoire (francophone country)
  // and the majority of users are French speakers
  
  // Check navigator language (device/system language)
  const browserLang = navigator.language || (navigator as any).userLanguage;
  const langCode = browserLang?.split('-')[0]?.toLowerCase();
  
  // If browser language is French, return French immediately
  if (langCode === 'fr') {
    return 'fr';
  }
  
  // Check navigator languages array (ordered by user preference)
  const languages = navigator.languages || [];
  
  // First priority: Check if French is in the user's preferred languages
  for (const lang of languages) {
    const code = lang.split('-')[0].toLowerCase();
    if (code === 'fr') {
      return 'fr';
    }
  }
  
  // Second priority: Check for other supported languages
  if (langCode && supportedLanguages.includes(langCode as Language)) {
    return langCode as Language;
  }
  
  for (const lang of languages) {
    const code = lang.split('-')[0].toLowerCase();
    if (supportedLanguages.includes(code as Language)) {
      return code as Language;
    }
  }
  
  // DEFAULT: Always return French as the fallback
  // This ensures French-speaking users in Côte d'Ivoire see French content
  return 'fr';
};

const getInitialLanguage = (): Language => {
  // Priority 1: URL path language (e.g., /en, /ar, /zh)
  // This allows explicit language selection via URL
  const urlLang = detectLanguageFromURL();
  if (urlLang) {
    return urlLang;
  }
  
  // Priority 2: For root URL (/) - detect device language
  // French is the default for francophone visitors
  const isRootUrl = window.location.pathname === '/' || window.location.pathname === '';
  
  if (isRootUrl) {
    // Check if user has previously selected a language
    const saved = localStorage.getItem("language");
    if (saved && supportedLanguages.includes(saved as Language)) {
      return saved as Language;
    }
    
    // Detect device/browser language
    return detectBrowserLanguage();
  }
  
  // Priority 3: Saved preference in localStorage for non-root URLs
  const saved = localStorage.getItem("language");
  if (saved && supportedLanguages.includes(saved as Language)) {
    return saved as Language;
  }
  
  // Priority 4: Browser/system language detection
  return detectBrowserLanguage();
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  // Custom setLanguage that also updates localStorage immediately
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  // Listen for URL changes
  useEffect(() => {
    const urlLang = detectLanguageFromURL();
    if (urlLang && urlLang !== language) {
      setLanguageState(urlLang);
      localStorage.setItem("language", urlLang);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};