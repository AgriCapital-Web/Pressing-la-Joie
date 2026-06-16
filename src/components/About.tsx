import { Card, CardContent } from "@/components/ui/card";
import { Sprout, Lightbulb, Building2, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const About = () => {
  const { t } = useLanguage();
  
  const mission = [
    {
      icon: <Sprout className="w-8 h-8" />,
      title: t.about.mission.accessibility.title,
      description: t.about.mission.accessibility.desc,
    },
    {
      icon: <Building2 className="w-8 h-8" />,
      title: t.about.mission.support.title,
      description: t.about.mission.support.desc,
    },
    {
      icon: <CheckCircle2 className="w-8 h-8" />,
      title: t.about.mission.viability.title,
      description: t.about.mission.viability.desc,
    },
  ];

  const values = [
    {
      emoji: "🤝",
      title: t.about.values.support.title,
      description: t.about.values.support.desc,
    },
    {
      emoji: "💡",
      title: t.about.values.innovation.title,
      description: t.about.values.innovation.desc,
    },
    {
      emoji: "🌱",
      title: t.about.values.development.title,
      description: t.about.values.development.desc,
    },
    {
      emoji: "🔍",
      title: t.about.values.transparency.title,
      description: t.about.values.transparency.desc,
    },
  ];

  const vision = [
    { icon: "🌍", text: t.about.vision.items.economy },
    { icon: "🏡", text: t.about.vision.items.lives },
    { icon: "🍽️", text: t.about.vision.items.food },
    { icon: "📈", text: t.about.vision.items.national },
    { icon: "🌱", text: t.about.vision.items.future },
  ];

  return (
    <section id="apropos" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Notre Histoire */}
        <div className="max-w-4xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-center">
            {t.about.history.title}
          </h2>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              <span className="font-bold text-foreground">{t.about.history.subtitle}</span>
            </p>
            <p>{t.about.history.p1}</p>
            <p>
              {t.about.history.p2.split('Inocent KOFFI').map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && <strong className="text-foreground font-extrabold">Inocent KOFFI</strong>}
                </span>
              ))}
            </p>
            <div className="bg-primary/10 border-l-4 border-primary p-6 rounded-r-lg">
              <p className="font-bold text-foreground text-xl">
                {t.about.history.highlight}
              </p>
            </div>
          </div>
        </div>

        {/* Notre Mission */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
            {t.about.mission.title}
          </h2>
          <p className="text-xl text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            {t.about.mission.subtitle}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mission.map((item, index) => (
              <Card key={index} className="bg-card border-border hover:shadow-medium transition-smooth">
                <CardContent className="p-8 text-center">
                  <div className="text-primary mb-4 flex justify-center">{item.icon}</div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Notre Vision */}
        <div className="mb-20 bg-secondary/30 rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
            {t.about.vision.title}
          </h2>
          <p className="text-xl text-center text-muted-foreground mb-12">
            {t.about.vision.subtitle}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {vision.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <span className="text-3xl">{item.icon}</span>
                <p className="text-foreground text-lg">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Nos Valeurs */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
            {t.about.values.title}
          </h2>
          <p className="text-xl text-center text-muted-foreground mb-12">
            {t.about.values.subtitle}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="bg-card border-border hover:shadow-medium transition-smooth">
                <CardContent className="p-8">
                  <div className="text-5xl mb-4">{value.emoji}</div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
