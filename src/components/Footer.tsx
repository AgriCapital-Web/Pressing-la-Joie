import logoWhite from "@/assets/logo-agricapital-v2-white.png";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import Newsletter from "./Newsletter";

const Footer = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (id: string) => {
    const isHomePage = location.pathname === "/" ||
      location.pathname === "/fr" ||
      location.pathname === "/en" ||
      location.pathname.startsWith("/accueil") ||
      location.pathname.startsWith("/home");

    if (isHomePage) {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/#${id}`);
    }
  };

  const quickLinks = [
    { id: "accueil", label: t.nav.home },
    { id: "apropos", label: t.nav.about },
    { id: "approche", label: t.nav.approach },
    { id: "impact", label: t.nav.impact },
    { id: "partenariat", label: t.nav.partnership },
  ];

  return (
    <footer className="bg-agri-green text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div>
            <img src={logoWhite} alt="AgriCapital" className="h-14 w-auto mb-5" />
            <p className="text-white/75 text-sm leading-relaxed mb-4">{t.footer.description}</p>
            <p className="text-white/60 text-xs font-medium uppercase tracking-wider">{t.footer.capitalSocial}</p>
          </div>

          <div>
            <h3 className="belife-footer-heading">{t.footer.quickLinks}</h3>
            <ul className="space-y-2.5">
              {quickLinks.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className="text-white/75 hover:text-white hover:translate-x-1 transition-all text-sm inline-block"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
              <li>
                <Link
                  to="/faq"
                  className="text-white/75 hover:text-white hover:translate-x-1 transition-all text-sm inline-flex items-center gap-1.5"
                >
                  <HelpCircle size={13} />
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="belife-footer-heading">{t.contact.title}</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider mb-1">{t.contact.address.title}</p>
                <p className="text-white/85">{t.contact.address.value}</p>
              </div>
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider mb-1">{t.contact.email.title}</p>
                <a href="mailto:contact@agricapital.ci" className="text-white/85 hover:text-white transition-colors break-all">
                  {t.contact.email.value}
                </a>
              </div>
              <div>
                <p className="text-white/50 text-xs uppercase tracking-wider mb-1">{t.contact.phone.title}</p>
                <a href="https://wa.me/2250564551717" className="text-white/85 hover:text-white transition-colors">
                  +225 05 64 55 17 17
                </a>
              </div>
            </div>
          </div>

          <div>
            <h3 className="belife-footer-heading">{t.newsletter?.title || "Newsletter"}</h3>
            <p className="text-white/75 text-sm mb-4 leading-relaxed">
              {t.newsletter?.subtitle || "Restez informé de nos actualités"}
            </p>
            <Newsletter />
          </div>
        </div>

        <div className="border-t border-white/15 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/60 text-xs">© 2025 {t.footer.copyright}</p>
          <p className="text-white/50 text-xs italic">Investir la terre. Cultiver l'avenir.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
