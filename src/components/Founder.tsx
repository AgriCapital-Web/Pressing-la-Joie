import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import founderAsset from "@/assets/inocent-koffi-official.jpeg.asset.json";

const renderBoldName = (text: string) => {
  const parts = text.split('Inocent KOFFI');
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && <strong className="font-extrabold text-foreground">Inocent KOFFI</strong>}
        </span>
      ))}
    </>
  );
};

const Founder = () => {
  const { t } = useLanguage();

  return (
    <section id="fondateur" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.founder.title}
          </h2>
          <p className="text-xl text-agri-orange font-semibold">
            {t.founder.subtitle}
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <p className="text-muted-foreground text-lg leading-relaxed mb-4">
            {renderBoldName(t.founder.intro)}
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {t.founder.mission}
          </p>
        </div>

        <Card className="max-w-5xl mx-auto bg-card border-border">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-1 flex justify-center">
                <div className="relative w-full max-w-xs mx-auto">
                  <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-lg border-4 border-primary/20 bg-secondary/30">
                    <img
                      src={founderAsset.url}
                      alt={t.founder.name}
                      width={480}
                      height={640}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                      decoding="async"
                      sizes="(max-width: 768px) 80vw, 320px"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }}
                    />
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="text-center md:text-left">
                  <h3 className="text-2xl font-extrabold text-foreground mb-1">
                    Inocent KOFFI
                  </h3>
                  <p className="text-lg text-agri-orange font-semibold mb-2">
                    {t.founder.position}
                  </p>
                  <p className="text-sm text-muted-foreground italic mb-2">
                    {t.founder.signature}
                  </p>
                  <a 
                    href="https://www.ikoffi.agricapital.ci" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors underline"
                  >
                    🌐 www.ikoffi.agricapital.ci
                  </a>
                </div>

                <div className="border-l-4 border-agri-green pl-6 py-2">
                  <blockquote className="text-muted-foreground italic space-y-3 text-base leading-relaxed">
                    <p>{t.founder.quote.part1}</p>
                    <p>{renderBoldName(t.founder.quote.part2)}</p>
                    <p>{t.founder.quote.part3}</p>
                    <p className="font-bold text-foreground not-italic pt-2">
                      {t.founder.quote.part4}
                    </p>
                  </blockquote>
                  <p className="text-sm text-muted-foreground mt-4">
                    {t.founder.attribution}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Founder;
