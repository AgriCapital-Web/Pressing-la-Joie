import { useState, useEffect, useRef } from "react";
import { Menu, X, Globe, HelpCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language, languageNames } from "@/lib/translations";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "@/assets/logo-agricapital-v2.png";

const languages: Language[] = ["fr", "en", "ar", "es", "de", "zh"];

interface SubMenuItem {
  label: string;
  action: string; // section id or route
  isRoute?: boolean;
}

interface MenuItem {
  label: string;
  action?: string;
  isRoute?: boolean;
  icon?: React.ReactNode;
  children?: SubMenuItem[];
}

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMobileLangMenu, setShowMobileLangMenu] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);
  const { language, setLanguage, t } = useLanguage();
  const langMenuRef = useRef<HTMLDivElement>(null);
  const mobileLangMenuRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
      if (mobileLangMenuRef.current && !mobileLangMenuRef.current.contains(event.target as Node)) {
        setShowMobileLangMenu(false);
      }
      if (submenuRef.current && !submenuRef.current.contains(event.target as Node)) {
        setOpenSubmenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    setOpenSubmenu(null);
    setOpenMobileSubmenu(null);

    const isHomePage = location.pathname === "/" ||
      location.pathname === "/fr" ||
      location.pathname === "/en" ||
      location.pathname.startsWith("/accueil") ||
      location.pathname.startsWith("/home");

    if (isHomePage) {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(`/#${id}`);
    }
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setShowLangMenu(false);
    setShowMobileLangMenu(false);
  };

  const menuLabels = {
    discover: language === 'fr' ? 'Découvrir' : language === 'en' ? 'Discover' : language === 'ar' ? 'اكتشف' : language === 'es' ? 'Descubrir' : language === 'de' ? 'Entdecken' : '发现',
    offers: language === 'fr' ? 'Nos Offres' : language === 'en' ? 'Our Offers' : language === 'ar' ? 'عروضنا' : language === 'es' ? 'Ofertas' : language === 'de' ? 'Angebote' : '我们的报价',
    resources: language === 'fr' ? 'Ressources' : language === 'en' ? 'Resources' : language === 'ar' ? 'الموارد' : language === 'es' ? 'Recursos' : language === 'de' ? 'Ressourcen' : '资源',
    news: language === 'fr' ? 'Actualités' : language === 'en' ? 'News' : language === 'ar' ? 'الأخبار' : language === 'es' ? 'Noticias' : language === 'de' ? 'Nachrichten' : '新闻',
    team: language === 'fr' ? 'Équipe' : language === 'en' ? 'Team' : language === 'ar' ? 'الفريق' : language === 'es' ? 'Equipo' : language === 'de' ? 'Team' : '团队',
    capacity: language === 'fr' ? 'Capacité' : language === 'en' ? 'Capacity' : language === 'ar' ? 'القدرة' : language === 'es' ? 'Capacidad' : language === 'de' ? 'Kapazität' : '能力',
    testimonials: language === 'fr' ? 'Témoignages' : language === 'en' ? 'Testimonials' : language === 'ar' ? 'الشهادات' : language === 'es' ? 'Testimonios' : language === 'de' ? 'Referenzen' : '推荐',
    evolution: language === 'fr' ? 'Évolution' : language === 'en' ? 'Evolution' : language === 'ar' ? 'التطور' : language === 'es' ? 'Evolución' : language === 'de' ? 'Entwicklung' : '发展',
  };

  const menuItems: MenuItem[] = [
    { label: t.nav.home, action: "hero" },
    {
      label: menuLabels.discover,
      children: [
        { label: t.nav.about, action: "apropos" },
        { label: menuLabels.capacity, action: "impact" },
        { label: menuLabels.evolution, action: "/evolution", isRoute: true },
      ],
    },
    {
      label: menuLabels.offers,
      children: [
        { label: t.nav.approach, action: "approche" },
        { label: t.nav.partnership, action: "partenariat" },
      ],
    },
    { label: menuLabels.team, action: "equipe" },
    {
      label: menuLabels.resources,
      children: [
        { label: menuLabels.news, action: "/actualites", isRoute: true },
        { label: menuLabels.testimonials, action: "temoignages" },
        { label: "FAQ", action: "/faq", isRoute: true },
      ],
    },
  ];

  const handleItemClick = (item: SubMenuItem | MenuItem) => {
    if (item.isRoute && item.action) {
      navigate(item.action);
      setIsOpen(false);
      setOpenSubmenu(null);
      setOpenMobileSubmenu(null);
    } else if (item.action) {
      scrollToSection(item.action);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border shadow-soft" style={{ zIndex: 99999 }}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection("hero")}>
            <img src={logo} alt="AgriCapital" className="h-16 w-auto object-contain" />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1" ref={submenuRef}>
            {menuItems.map((item) => (
              <div key={item.label} className="relative">
                {item.children ? (
                  <>
                    <button
                      onClick={() => setOpenSubmenu(openSubmenu === item.label ? null : item.label)}
                      className="flex items-center gap-1 text-foreground hover:text-primary transition-smooth font-medium px-3 py-2 rounded-lg hover:bg-secondary/50"
                    >
                      {item.label}
                      <ChevronDown size={14} className={`transition-transform ${openSubmenu === item.label ? 'rotate-180' : ''}`} />
                    </button>
                    {openSubmenu === item.label && (
                      <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 py-1 min-w-[200px]" style={{ zIndex: 999999 }}>
                        {item.children.map((child) => (
                          <button
                            key={child.label}
                            onClick={() => handleItemClick(child)}
                            className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors font-medium"
                          >
                            {child.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    onClick={() => handleItemClick(item)}
                    className="text-foreground hover:text-primary transition-smooth font-medium px-3 py-2 rounded-lg hover:bg-secondary/50"
                  >
                    {item.label}
                  </button>
                )}
              </div>
            ))}

            {/* Desktop Language Selector */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLangMenu(!showLangMenu);
                }}
                className="flex items-center gap-2 text-foreground hover:text-primary transition-smooth font-medium px-3 py-2 rounded-lg hover:bg-secondary/50"
                aria-label="Select language"
              >
                <Globe size={18} />
                <span className="uppercase text-sm">{language}</span>
              </button>
              {showLangMenu && (
                <>
                  <div className="fixed inset-0" style={{ zIndex: 999998 }} onClick={() => setShowLangMenu(false)} />
                  <div className="absolute right-0 mt-1 rounded-lg shadow-xl py-1 min-w-[160px] bg-white border border-gray-100" style={{ zIndex: 999999 }}>
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLanguageChange(lang);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 ${
                          language === lang ? "bg-primary/5 text-primary font-semibold" : "text-gray-700"
                        }`}
                      >
                        {languageNames[lang]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            <Button
              onClick={() => scrollToSection("contact")}
              className="bg-gradient-accent border-0 text-white hover:opacity-90 transition-smooth ml-2"
            >
              {t.nav.contact}
            </Button>
          </div>

          {/* Mobile Controls */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="relative" ref={mobileLangMenuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMobileLangMenu(!showMobileLangMenu);
                }}
                className="flex items-center gap-1 text-foreground hover:text-primary transition-smooth p-2 rounded-lg hover:bg-secondary/50"
                aria-label="Select language"
              >
                <Globe size={20} />
                <span className="uppercase text-xs font-medium">{language}</span>
              </button>
              {showMobileLangMenu && (
                <>
                  <div className="fixed inset-0" style={{ zIndex: 999998 }} onClick={() => setShowMobileLangMenu(false)} />
                  <div className="fixed right-4 mt-2 rounded-lg shadow-xl py-1 min-w-[170px] bg-white border border-gray-100" style={{ zIndex: 999999, top: '70px' }}>
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLanguageChange(lang);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 ${
                          language === lang ? "bg-primary/5 text-primary font-semibold" : "text-gray-700"
                        }`}
                      >
                        {languageNames[lang]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            <button className="text-foreground p-2" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-border bg-background max-h-[70vh] overflow-y-auto">
            <div className="flex flex-col gap-1">
              {menuItems.map((item) => (
                <div key={item.label}>
                  {item.children ? (
                    <>
                      <button
                        onClick={() => setOpenMobileSubmenu(openMobileSubmenu === item.label ? null : item.label)}
                        className="flex items-center justify-between w-full text-foreground hover:text-primary transition-smooth font-medium text-left px-3 py-3 rounded-lg hover:bg-secondary/30"
                      >
                        {item.label}
                        <ChevronDown size={16} className={`transition-transform ${openMobileSubmenu === item.label ? 'rotate-180' : ''}`} />
                      </button>
                      {openMobileSubmenu === item.label && (
                        <div className="ml-4 border-l-2 border-primary/20 pl-3 flex flex-col gap-0.5">
                          {item.children.map((child) => (
                            <button
                              key={child.label}
                              onClick={() => handleItemClick(child)}
                              className="text-sm text-muted-foreground hover:text-primary transition-smooth font-medium text-left px-3 py-2.5 rounded-lg hover:bg-secondary/30"
                            >
                              {child.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => handleItemClick(item)}
                      className="text-foreground hover:text-primary transition-smooth font-medium text-left px-3 py-3 rounded-lg hover:bg-secondary/30"
                    >
                      {item.label}
                    </button>
                  )}
                </div>
              ))}
              <div className="pt-2 px-3">
                <Button
                  onClick={() => scrollToSection("contact")}
                  className="bg-gradient-accent border-0 text-white hover:opacity-90 transition-smooth w-full"
                >
                  {t.nav.contact}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
