import React from "react";

// Redirige tous les boutons "liste d'attente" vers le portail leads public
const LEADS_URL = "https://app.agricapital.ci/leads/public";

const WaitlistDialog = ({ children }: { children: React.ReactNode; sourcePage?: string }) => {
  const child = React.Children.only(children) as React.ReactElement;
  return React.cloneElement(child, {
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      window.open(LEADS_URL, "_blank", "noopener,noreferrer");
    },
  });
};

export default WaitlistDialog;