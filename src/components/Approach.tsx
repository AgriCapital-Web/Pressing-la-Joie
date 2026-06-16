import { Card, CardContent } from "@/components/ui/card";
import nurseryImage from "@/assets/nursery-pepiniere-daloa.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const convertNumber = (num: string, language: string): string => {
  if (language === "ar") {
    const arabicNumerals = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num.split("").map(digit => arabicNumerals[parseInt(digit)] || digit).join("");
  }
  if (language === "zh") {
    const chineseNumerals = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    return num.split("").map(digit => chineseNumerals[parseInt(digit)] || digit).join("");
  }
  return num;
};

const Approach = () => {
  const { t, language } = useLanguage();
  
  const steps = [
    { number: convertNumber("01", language), title: t.approach.steps.prospecting.title, description: t.approach.steps.prospecting.desc },
    { number: convertNumber("02", language), title: t.approach.steps.development.title, description: t.approach.steps.development.desc },
    { number: convertNumber("03", language), title: t.approach.steps.followup.title, description: t.approach.steps.followup.desc },
    { number: convertNumber("04", language), title: t.approach.steps.harvest.title, description: t.approach.steps.harvest.desc },
    { number: convertNumber("05", language), title: t.approach.steps.payment.title, description: t.approach.steps.payment.desc },
  ];

  const services = [
    { icon: "🌱", title: t.approach.services.inputs.title, description: t.approach.services.inputs.desc },
    { icon: "📚", title: t.approach.services.technical.title, description: t.approach.services.technical.desc },
    { icon: "✅", title: t.approach.services.marketing.title, description: t.approach.services.marketing.desc },
  ];

  return (
    <section id="approche" className="py-20 lg:py-28 bg-secondary/40">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14 lg:mb-16">
          <span className="belife-eyebrow">{t.approach.subtitle}</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">{t.approach.title}</h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">{t.approach.subtitle}</p>
        </div>

        <div className="mb-16 rounded-2xl overflow-hidden shadow-medium">
          <img
            src={nurseryImage}
            alt="Site de pépinière AgriCapital - Plants de palmiers Tenera"
            className="w-full h-[260px] md:h-[400px] object-cover"
            loading="lazy"
          />
        </div>

        <div className="mb-20">
          <div className="space-y-5">
            {steps.map((step, index) => (
              <div key={index} className="belife-card">
                <div className="p-6 md:p-8">
                  <div className="flex flex-col md:flex-row items-start gap-5 md:gap-7">
                    <div className="text-5xl md:text-6xl font-bold text-accent/25 leading-none shrink-0">{step.number}</div>
                    <div className="flex-1">
                      <h4 className="text-xl md:text-2xl font-bold text-foreground mb-3">{step.title}</h4>
                      <p className="text-muted-foreground text-base md:text-lg leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-center mb-12">
            <span className="belife-eyebrow">Services</span>
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">{t.approach.services.title}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div key={index} className="belife-card">
                <div className="p-7">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h4 className="text-lg font-bold text-foreground mb-2">{service.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Approach;
