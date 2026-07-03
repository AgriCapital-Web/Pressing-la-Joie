import { useEffect } from "react";

const WaitlistPage = () => {
  useEffect(() => {
    window.location.replace("https://app.agricapital.ci/leads/public");
  }, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-muted-foreground">Redirection vers le portail AgriCapital...</p>
    </div>
  );
};

export default WaitlistPage;