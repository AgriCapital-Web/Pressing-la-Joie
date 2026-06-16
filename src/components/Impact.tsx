import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const Impact = () => {
  const { t } = useLanguage();
  
  const results = [
    { number: t.impact.results.communities.title, label: t.impact.results.communities.desc },
    { number: t.impact.results.land.title, label: t.impact.results.land.desc },
    { number: t.impact.results.localities.title, label: t.impact.results.localities.desc },
    { number: t.impact.results.years.title, label: t.impact.results.years.desc },
  ];

  return (
    <section id="impact" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.impact.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t.impact.subtitle}
          </p>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
          {results.map((result, index) => (
            <Card key={index} className="bg-gradient-primary border-0">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                  {result.number}
                </div>
                <p className="text-xs sm:text-sm md:text-base text-white/90 font-medium leading-tight break-words">
                  {result.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Study Results */}
        <div className="bg-secondary/30 rounded-2xl p-6 md:p-8 lg:p-12">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
            {t.impact.results.title}
          </h3>
          <div className="space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed">
            <p>{t.impact.results.description1}</p>
            <p className="font-semibold text-foreground">
              {t.impact.results.description2}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Impact;
