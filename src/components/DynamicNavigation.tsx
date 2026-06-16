import { useState, useEffect, useRef } from "react";
import { Menu, X, Globe, ChevronDown, Phone, MessageCircle, UserCircle2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language, languageNames } from "@/lib/translations";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "@/assets/logo-agricapital-v2.png";

const CLIENT_PORTAL_URL = "https://pay.agricapital.ci";
const WHATSAPP_URL = "https://wa.me/2250564551717";
const PHONE_URL = "tel:+2250564551717";

const languages: Language[] = ["fr", "en", "ar", "es", "de", "zh"];

interface SubMenuItem {
  label: Record<Language, string>;
  action: string;
  isRoute?: boolean;
}

interface MenuItem {
  label: Record<Language, string>;
  action?: string;
  isRoute?: boolean;
  children?: SubMenuItem[];
}

const menuConfig: MenuItem[] = [
  {
    label: { fr: "Accueil", en: "Home", ar: "الرئيسية", es: "Inicio", de: "Startseite", zh: "首页" },
    action: "hero",
  },
  {
    label: { fr: "Découvrir", en: "Discover", ar: "اكتشف", es: "Descubrir", de: "Entdecken", zh: "发现" },
    children: [
      { label: { fr: "À Propos", en: "About", ar: "من نحن", es: "Nosotros", de: "Über uns", zh: "关于" }, action: "apropos" },
      { label: { fr: "Notre Capacité", en: "Capacity", ar: "القدرة", es: "Capacidad", de: "Kapazität", zh: "能力" }, action: "impact" },
      { label: { fr: "Évolution", en: "Evolution", ar: "التطور", es: "Evolución", de: "Entwicklung", zh: "发展" }, action: "/evolution", isRoute: true },
    ],
  },
  {
    label: { fr: "Nos Offres", en: "Offers", ar: "عروضنا", es: "Ofertas", de: "Angebote", zh: "方案" },
    children: [
      { label: { fr: "Solutions", en: "Solutions", ar: "حلول", es: "Soluciones", de: "Lösungen", zh: "解决方案" }, action: "/solutions", isRoute: true },
      { label: { fr: "Services", en: "Services", ar: "خدمات", es: "Servicios", de: "Dienste", zh: "服务" }, action: "/services", isRoute: true },
      { label: { fr: "Comment ça marche", en: "How It Works", ar: "كيف يعمل", es: "Cómo funciona", de: "So funktioniert's", zh: "运作方式" }, action: "approche" },
      { label: { fr: "Partenariats", en: "Partnerships", ar: "شراكات", es: "Asociaciones", de: "Partnerschaften", zh: "合作" }, action: "/partenariats", isRoute: true },
    ],
  },
  {
    label: { fr: "Équipe", en: "Team", ar: "الفريق", es: "Equipo", de: "Team", zh: "团队" },
    action: "equipe",
  },
  {
    label: { fr: "Ressources", en: "Resources", ar: "الموارد", es: "Recursos", de: "Ressourcen", zh: "资源" },
    children: [
      { label: { fr: "Actualités", en: "News", ar: "الأخبار", es: "Noticias", de: "Nachrichten", zh: "新闻" }, action: "/actualites", isRoute: true },
      { label: { fr: "Témoignages", en: "Testimonials", ar: "الشهادات", es: "Testimonios", de: "Referenzen", zh: "推荐" }, action: "temoignages" },
      { label: { fr: "FAQ", en: "FAQ", ar: "الأسئلة", es: "FAQ", de: "FAQ", zh: "常见问题" }, action: "/faq", isRoute: true },
    ],
  },
];

const DynamicNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [openMobileSubmenu, setOpenMobileSubmenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const langMenuRef = useRef<HTMLDivElement>(null);
  const submenuTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) setShowLangMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const scrollToSection = (id: string) => {
    setIsOpen(false);
    setOpenSubmenu(null);
    setOpenMobileSubmenu(null);
    const isHome = location.pathname === "/" || location.pathname.match(/^\/(fr|en|ar|es|de|zh)$/);
    if (isHome) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/#${id}`);
    }
  };

  const handleItemClick = (action: string, isRoute?: boolean) => {
    if (isRoute) {
      navigate(action);
      setIsOpen(false);
      setOpenSubmenu(null);
      setOpenMobileSubmenu(null);
    } else {
      scrollToSection(action);
    }
  };

  const getLabel = (labels: Record<Language, string>) => labels[language] || labels.fr;

  const handleSubmenuEnter = (label: string) => {
    clearTimeout(submenuTimeoutRef.current);
    setOpenSubmenu(label);
  };

  const handleSubmenuLeave = () => {
    submenuTimeoutRef.current = setTimeout(() => setOpenSubmenu(null), 250);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 transition-all duration-300 ${
        scrolled ? "bg-background/98 backdrop-blur-md shadow-medium" : "bg-background/95 backdrop-blur-sm"
      } border-b border-border`}
      style={{ zIndex: 2147483000 }}
    >
      <div className="container mx-auto px-4 lg:px-6 overflow-visible">
        <div className="flex items-center justify-between h-18 lg:h-22 gap-2">
          {/* Logo — enlarged */}
          <div className="flex items-center cursor-pointer shrink-0" onClick={() => scrollToSection("hero")}>
            <img src={logo} alt="AgriCapital" className="h-14 sm:h-16 lg:h-20 w-auto" />
          </div>

          {/* Desktop main nav */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1 justify-center relative z-[2147483000]">
            {menuConfig.map((item) => {
              const label = getLabel(item.label);
              const isOpenSub = openSubmenu === label;
              return (
                <div
                  key={label}
                  className="relative isolate"
                  onMouseEnter={() => item.children && handleSubmenuEnter(label)}
                  onMouseLeave={() => item.children && handleSubmenuLeave()}
                >
                  {item.children ? (
                    <>
                      <button
                        className="belife-nav-link flex items-center gap-1"
                        onClick={() => setOpenSubmenu(isOpenSub ? null : label)}
                        aria-expanded={isOpenSub}
                      >
                        {label}
                        <ChevronDown size={13} className={`transition-transform duration-200 ${isOpenSub ? "rotate-180" : ""}`} />
                      </button>
                      {isOpenSub && (
                        <div
                          className="absolute top-full left-0 pt-2 animate-in fade-in-0 zoom-in-95 duration-150"
                          style={{ zIndex: 2147483000 }}
                          onMouseEnter={() => handleSubmenuEnter(label)}
                          onMouseLeave={handleSubmenuLeave}
                        >
                          <div className="bg-card rounded-xl shadow-strong border border-border/70 py-2 min-w-[240px] relative overflow-hidden">
                            <span className="absolute top-0 left-0 right-0 h-[3px] bg-accent" />
                            {item.children.map((child) => (
                              <button
                                key={getLabel(child.label)}
                                onClick={() => handleItemClick(child.action, child.isRoute)}
                                className="group w-full px-4 py-2.5 text-left text-sm text-foreground/80 hover:text-foreground hover:bg-secondary/60 transition-colors font-medium flex items-center justify-between"
                              >
                                <span>{getLabel(child.label)}</span>
                                <span className="text-accent opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => handleItemClick(item.action!, item.isRoute)}
                      className="belife-nav-link"
                    >
                      {label}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Belife-style circle action buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <a
              href={PHONE_URL}
              aria-label="Téléphone"
              className="hidden sm:flex w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-white items-center justify-center transition-all active:scale-95"
            >
              <Phone size={18} />
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="hidden sm:flex w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-[#25D366]/15 text-[#1faa52] hover:bg-[#25D366] hover:text-white items-center justify-center transition-all active:scale-95"
            >
              <MessageCircle size={18} />
            </a>
            <a
              href={CLIENT_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={language === "en" ? "Client Portal" : "Espace Clients"}
              title={language === "en" ? "Client Portal" : language === "ar" ? "بوابة العملاء" : language === "es" ? "Portal de Clientes" : language === "de" ? "Kundenportal" : language === "zh" ? "客户门户" : "Espace Clients"}
              className="flex w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-accent text-white hover:bg-accent/90 items-center justify-center transition-all active:scale-95 shadow-soft"
            >
              <UserCircle2 size={20} />
            </a>
            <button
              onClick={() => scrollToSection("contact")}
              aria-label="Contact"
              className="hidden sm:flex w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-white items-center justify-center transition-all active:scale-95"
            >
              <MapPin size={18} />
            </button>

            {/* Language */}
            <div className="relative" ref={langMenuRef}>
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                aria-label="Language"
                className="flex w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-secondary text-foreground/70 hover:text-foreground hover:bg-secondary/80 items-center justify-center transition-all"
              >
                <Globe size={18} />
              </button>
              {showLangMenu && (
                <>
                  <div className="fixed inset-0" style={{ zIndex: 999998 }} onClick={() => setShowLangMenu(false)} />
                  <div className="absolute right-0 mt-2 rounded-xl shadow-strong py-2 min-w-[170px] bg-card border border-border" style={{ zIndex: 999999 }}>
                    {languages.map((lang) => (
                      <button
                        key={lang}
                        onClick={() => { setLanguage(lang); setShowLangMenu(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted/50 ${language === lang ? "text-primary font-semibold bg-primary/5" : "text-foreground/70"}`}
                      >
                        <span className="uppercase text-xs mr-2 text-muted-foreground">{lang}</span>
                        {languageNames[lang]}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Mobile hamburger — same full menu drawer */}
            <button
              className="lg:hidden flex w-10 h-10 rounded-full bg-accent/10 text-accent hover:bg-accent hover:text-white items-center justify-center transition-all active:scale-95"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - solid background, scrollable drawer */}
        {isOpen && (
          <>
            <div
              className="lg:hidden fixed inset-0 bg-foreground/40 backdrop-blur-sm"
              style={{ zIndex: 2147482998, top: "72px" }}
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <div
              className="lg:hidden fixed left-0 right-0 top-[72px] z-[2147482999] border-t border-border bg-background shadow-strong px-4 py-3 max-h-[calc(100dvh-72px)] overflow-y-auto"
            >
              <div className="flex flex-col gap-0.5">
                {menuConfig.map((item) => {
                  const label = getLabel(item.label);
                  return (
                    <div key={label}>
                      {item.children ? (
                        <>
                          <button
                            onClick={() => setOpenMobileSubmenu(openMobileSubmenu === label ? null : label)}
                            className="flex items-center justify-between w-full text-foreground hover:text-primary font-semibold text-left px-3 py-3 rounded-lg hover:bg-muted text-sm"
                          >
                            {label}
                            <ChevronDown size={15} className={`transition-transform ${openMobileSubmenu === label ? "rotate-180" : ""}`} />
                          </button>
                          {openMobileSubmenu === label && (
                            <div className="ml-3 border-l-2 border-primary/30 pl-3 flex flex-col gap-0.5 mb-1">
                              {item.children.map((child) => (
                                <button
                                  key={getLabel(child.label)}
                                  onClick={() => handleItemClick(child.action, child.isRoute)}
                                  className="text-sm text-foreground/80 hover:text-primary font-medium text-left px-3 py-2.5 rounded-lg hover:bg-muted"
                                >
                                  {getLabel(child.label)}
                                </button>
                              ))}
                            </div>
                          )}
                        </>
                      ) : (
                        <button
                          onClick={() => handleItemClick(item.action!, item.isRoute)}
                          className="text-foreground hover:text-primary font-semibold text-left px-3 py-3 rounded-lg hover:bg-muted text-sm w-full"
                        >
                          {label}
                        </button>
                      )}
                    </div>
                  );
                })}
                <div className="pt-3 px-3 border-t border-border mt-2">
                  <Button
                    onClick={() => scrollToSection("contact")}
                    className="bg-gradient-accent border-0 text-white hover:opacity-90 w-full rounded-lg text-sm font-semibold"
                  >
                    {t.nav.contact}
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default DynamicNavigation;
