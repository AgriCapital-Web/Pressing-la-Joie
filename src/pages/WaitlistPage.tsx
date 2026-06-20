import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import WaitlistForm from "@/components/WaitlistForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const WaitlistPage = () => (
  <div className="min-h-screen bg-background">
    <SEOHead title="Souscrire à AgriCapital" description="Rejoignez la liste d'attente AgriCapital pour créer votre plantation de palmier à huile avec ou sans terre." />
    <DynamicNavigation />
    <main className="container mx-auto px-4 py-28">
      <Card className="mx-auto max-w-3xl border-primary/20 shadow-strong">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl">Rejoindre la liste d'attente</CardTitle>
          <p className="text-muted-foreground">Laissez vos informations pour être contacté par AgriCapital.</p>
        </CardHeader>
        <CardContent className="p-6 md:p-8">
          <WaitlistForm sourcePage="/souscrire" />
        </CardContent>
      </Card>
    </main>
    <Footer />
  </div>
);

export default WaitlistPage;