import { Target, Users, TrendingUp, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";

const Ambitions = () => {
  const { t } = useLanguage();
  
  const objectives = [
    {
      icon: <Target className="w-8 h-8" />,
      title: t.ambitions.objectives.hectares.title,
      description: t.ambitions.objectives.hectares.desc,
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: t.ambitions.objectives.farmers.title,
      description: t.ambitions.objectives.farmers.desc,
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: t.ambitions.objectives.guarantee.title,
      description: t.ambitions.objectives.guarantee.desc,
    },
  ];

  const pillars = [
    {
      emoji: "🚀",
      title: t.ambitions.pillars.accessibility.title,
      description: t.ambitions.pillars.accessibility.desc,
    },
    {
      emoji: "🤝",
      title: t.ambitions.pillars.expertise.title,
      description: t.ambitions.pillars.expertise.desc,
    },
    {
      emoji: "♻️",
      title: t.ambitions.pillars.sustainability.title,
      description: t.ambitions.pillars.sustainability.desc,
    },
  ];

  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.ambitions.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {objectives.map((obj, index) => (
            <Card key={index} className="bg-card border-border hover:shadow-medium transition-smooth">
              <CardContent className="p-6 text-center">
                <div className="text-accent mb-4 flex justify-center">{obj.icon}</div>
                <h3 className="text-xl font-bold text-foreground mb-2">{obj.title}</h3>
                <p className="text-muted-foreground">{obj.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            {t.ambitions.why}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar, index) => (
            <Card key={index} className="bg-card border-border hover:shadow-medium transition-smooth">
              <CardContent className="p-8">
                <div className="text-5xl mb-4">{pillar.emoji}</div>
                <h4 className="text-xl font-bold text-foreground mb-3">{pillar.title}</h4>
                <p className="text-muted-foreground leading-relaxed">{pillar.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Ambitions;
