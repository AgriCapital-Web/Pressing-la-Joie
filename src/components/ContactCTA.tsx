import React from "react";

/** Portail public de prise de contact AgriCapital. */
export const CONTACT_PORTAL_URL = "https://app.agricapital.ci/leads/public";

/** Libellé multilingue du bouton « Faites-vous contacter ». */
export const contactCtaLabel = (language?: string) => {
  switch (language) {
    case "en":
      return "Get contacted";
    case "ar":
      return "اطلب أن نتصل بك";
    case "es":
      return "Solicite ser contactado";
    case "de":
      return "Kontaktiert werden";
    case "zh":
      return "请联系我";
    default:
      return "Faites-vous contacter";
  }
};

interface ContactCTAProps {
  children: React.ReactNode;
  className?: string;
}

/** Enveloppe un bouton pour l'ouvrir sur le portail de contact AgriCapital. */
const ContactCTA = ({ children, className }: ContactCTAProps) => (
  <a
    href={CONTACT_PORTAL_URL}
    target="_blank"
    rel="noopener noreferrer"
    className={`inline-flex ${className ?? ""}`}
  >
    {children}
  </a>
);

export default ContactCTA;
