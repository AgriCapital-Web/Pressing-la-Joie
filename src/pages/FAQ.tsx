import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Phone, Mail, MessageCircle, ChevronRight, Leaf, Users, TrendingUp, Shield, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DynamicNavigation from "@/components/DynamicNavigation";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqTranslations: Record<string, FAQItem[]> = {
  fr: [
    { category: "general", question: "Qu'est-ce qu'AgriCapital ?", answer: "AGRICAPITAL SARL est une entreprise ivoirienne spécialisée dans la création et la gestion clé en main de plantations de palmier à huile. Nous accompagnons des particuliers, des professionnels et des propriétaires fonciers à bâtir un patrimoine agricole durable et rentable." },
    { category: "general", question: "Quel est le modèle économique d'AgriCapital ?", answer: "AgriCapital propose un modèle d'investissement professionnel : nous identifions les terres, sécurisons juridiquement les projets, installons les plantations avec des plants certifiés Tenera, assurons l'entretien sur 36 mois et organisons la commercialisation. Le client conserve la pleine propriété de sa plantation." },
    { category: "general", question: "Où se trouve AgriCapital ?", answer: "Notre siège est situé à Daloa, dans la région du Haut-Sassandra en Côte d'Ivoire. Notre zone opérationnelle couvre actuellement Daloa, Zoukougbeu et Issia." },
    { category: "general", question: "AgriCapital est-elle une entreprise légale ?", answer: "Oui, AGRICAPITAL SARL est formellement constituée et opérationnelle, immatriculée au RCCM sous le numéro CI-DAL-01-2025-B12-13435." },
    { category: "general", question: "À qui s'adresse AgriCapital ?", answer: "Nos formules s'adressent à deux profils : (1) les particuliers et professionnels souhaitant constituer un patrimoine agricole sans contraintes opérationnelles, et (2) les propriétaires fonciers désireux de valoriser leurs terres avec un partenaire technique de confiance." },
    { category: "accompagnement", question: "En quoi consiste l'accompagnement d'AgriCapital ?", answer: "Notre accompagnement clé en main comprend : la fourniture de plants certifiés Tenera, l'installation complète de la plantation, l'entretien technique pendant 36 mois (jusqu'à l'entrée en production), le suivi agronomique permanent et l'organisation de la commercialisation des régimes." },
    { category: "accompagnement", question: "Quelle est la durée de développement d'une plantation ?", answer: "Une plantation de palmier à huile entre en production environ 36 mois après la mise en terre. Pendant cette période, AgriCapital assure l'entretien complet : désherbage, fertilisation, traitements phytosanitaires et suivi agronomique." },
    { category: "accompagnement", question: "D'où proviennent les plants de palmier ?", answer: "Nos plants proviennent de semences certifiées d'origine Iro Lamé, fournies par notre partenaire Les Palmistes. Il s'agit de la variété Tenera, tolérante à la fusariose, garantissant des plants de haute qualité et productifs." },
    { category: "accompagnement", question: "Quelles sont les étapes opérationnelles ?", answer: "Le déploiement se fait en 5 étapes : (1) Identification, validation et sécurisation foncière, (2) Préparation du terrain et trouaison, (3) Mise en place de la plantation avec plants certifiés, (4) Entretien et suivi technique sur 36 mois, (5) Mise en production et commercialisation." },
    { category: "garanties", question: "Quelles garanties offre AgriCapital ?", answer: "AgriCapital offre des contrats sécurisés et certifiés : garantie de qualité des plants, garantie d'entretien technique, garantie de suivi agronomique, et organisation de la commercialisation. La sécurisation juridique est assurée par notre partenaire Cabinet Legal Form." },
    { category: "garanties", question: "Comment AgriCapital sécurise-t-elle les projets ?", answer: "La sécurisation repose sur : un cadre contractuel rigoureux validé par notre partenaire juridique, un suivi technique par des ingénieurs agronomes qualifiés, une traçabilité complète des opérations, et un engagement contractuel à long terme." },
    { category: "offres", question: "Quelles sont les formules proposées ?", answer: "AgriCapital propose plusieurs formules professionnelles adaptées : PalmInvest et PalmInvest+ pour les particuliers et professionnels souhaitant créer leur plantation, ainsi que TerraPalm pour les propriétaires fonciers souhaitant valoriser leurs terres avec accompagnement technique complet." },
    { category: "offres", question: "Quelle est la capacité opérationnelle actuelle ?", answer: "Notre capacité opérationnelle comprend : plus de 100 hectares de pépinière en pleine croissance (avril 2026), plus de 500 hectares de terres identifiées, des partenariats logistiques et industriels structurés, et une équipe technique dédiée sur le terrain." },
    { category: "offres", question: "Le projet contribue-t-il à la durabilité environnementale ?", answer: "Oui, AgriCapital promeut des pratiques agricoles respectueuses de l'environnement : variétés adaptées au climat local, fertilisation raisonnée, gestion intégrée des cultures et préservation de la biodiversité environnante." },
    { category: "investissement", question: "Comment puis-je devenir client AgriCapital ?", answer: "Pour devenir client, contactez notre équipe commerciale. Nous étudierons votre projet, vous présenterons les formules adaptées et accompagnerons toutes les démarches de sécurisation et de mise en place de votre plantation." },
    { category: "investissement", question: "Y a-t-il un espace dédié aux clients ?", answer: "Oui, AgriCapital met à disposition un Espace Clients accessible via pay.agricapital.ci, permettant le suivi de vos plantations, l'accès aux documents et la communication directe avec nos équipes techniques." },
    { category: "entreprise", question: "Quelle est l'expérience de l'équipe AgriCapital ?", answer: "L'équipe AgriCapital cumule plus d'une décennie d'expérience terrain dans les communautés rurales ivoiriennes, ayant parcouru plus de 360 localités dans 8 régions. Elle regroupe des experts en agronomie, en gestion de projets, en droit et en comptabilité." },
    { category: "entreprise", question: "Quelle est la vision d'AgriCapital ?", answer: "Notre vision est de créer de la valeur agricole durable en accompagnant nos clients dans la constitution d'un patrimoine pérenne, tout en contribuant au développement structuré de la filière palmier à huile en Côte d'Ivoire." },
    { category: "entreprise", question: "Comment contacter AgriCapital ?", answer: "Vous pouvez nous joindre par téléphone/WhatsApp au +225 05 64 55 17 17, par email à contact@agricapital.ci, ou visiter notre site web www.agricapital.ci. Notre siège est situé à Daloa, Côte d'Ivoire." },
  ],
  en: [
    { category: "general", question: "What is AgriCapital?", answer: "AGRICAPITAL SARL is an Ivorian company specializing in the turnkey creation and management of oil palm plantations. We support individuals, professionals and landowners in building a sustainable and profitable agricultural heritage." },
    { category: "general", question: "What is AgriCapital's business model?", answer: "AgriCapital offers a professional investment model: we identify lands, legally secure projects, install plantations with certified Tenera seedlings, ensure 36 months of maintenance and organize commercialization. Clients retain full ownership of their plantation." },
    { category: "general", question: "Where is AgriCapital located?", answer: "Our headquarters is in Daloa, in the Haut-Sassandra region of Côte d'Ivoire. Our operational zone currently covers Daloa, Zoukougbeu and Issia." },
    { category: "general", question: "Is AgriCapital a legally registered company?", answer: "Yes, AGRICAPITAL SARL is formally constituted and operational, registered under RCCM number CI-DAL-01-2025-B12-13435." },
    { category: "general", question: "Who is AgriCapital for?", answer: "Our offers target two profiles: (1) individuals and professionals wishing to build agricultural heritage without operational constraints, and (2) landowners looking to develop their land with a trusted technical partner." },
    { category: "accompagnement", question: "What does AgriCapital's support include?", answer: "Our turnkey support includes: certified Tenera seedlings, complete plantation installation, 36 months of technical maintenance (until production), continuous agronomic monitoring and organization of bunch commercialization." },
    { category: "accompagnement", question: "How long does plantation development take?", answer: "An oil palm plantation enters production approximately 36 months after planting. During this period, AgriCapital provides complete maintenance: weeding, fertilization, phytosanitary treatments and agronomic monitoring." },
    { category: "accompagnement", question: "Where do palm seedlings come from?", answer: "Our seedlings come from certified Iro Lamé origin seeds, supplied by our partner Les Palmistes. These are Tenera variety, fusarium-tolerant, ensuring high-quality productive plants." },
    { category: "accompagnement", question: "What are the operational steps?", answer: "Deployment takes place in 5 steps: (1) Identification, validation and land security, (2) Land preparation, (3) Plantation installation with certified seedlings, (4) Maintenance and technical monitoring over 36 months, (5) Production and commercialization." },
    { category: "garanties", question: "What guarantees does AgriCapital offer?", answer: "AgriCapital offers secured and certified contracts: seedling quality guarantee, technical maintenance guarantee, agronomic monitoring guarantee, and commercialization organization. Legal security is ensured by our partner Cabinet Legal Form." },
    { category: "garanties", question: "How does AgriCapital secure projects?", answer: "Security relies on: a rigorous contractual framework validated by our legal partner, technical monitoring by qualified agronomist engineers, complete operational traceability, and long-term contractual commitment." },
    { category: "offres", question: "What formulas are offered?", answer: "AgriCapital offers several adapted professional formulas: PalmInvest and PalmInvest+ for individuals and professionals wishing to create their plantation, as well as TerraPalm for landowners wanting to develop their land with complete technical support." },
    { category: "offres", question: "What is the current operational capacity?", answer: "Our operational capacity includes: over 100 hectares of nursery in full growth (April 2026), over 500 hectares of identified land, structured logistic and industrial partnerships, and a dedicated technical field team." },
    { category: "offres", question: "Does the project contribute to environmental sustainability?", answer: "Yes, AgriCapital promotes environmentally friendly agricultural practices: locally adapted varieties, reasoned fertilization, integrated crop management and preservation of surrounding biodiversity." },
    { category: "investissement", question: "How can I become an AgriCapital client?", answer: "To become a client, contact our commercial team. We will study your project, present adapted formulas and support all the steps of securing and setting up your plantation." },
    { category: "investissement", question: "Is there a dedicated client portal?", answer: "Yes, AgriCapital provides a Client Portal accessible via pay.agricapital.ci, allowing plantation tracking, document access and direct communication with our technical teams." },
    { category: "entreprise", question: "What is the AgriCapital team's experience?", answer: "The AgriCapital team has over a decade of field experience in Ivorian rural communities, having visited more than 360 localities across 8 regions. It includes experts in agronomy, project management, law and accounting." },
    { category: "entreprise", question: "What is AgriCapital's vision?", answer: "Our vision is to create sustainable agricultural value by supporting our clients in building enduring heritage, while contributing to the structured development of the oil palm industry in Côte d'Ivoire." },
    { category: "entreprise", question: "How to contact AgriCapital?", answer: "You can reach us by phone/WhatsApp at +225 05 64 55 17 17, by email at contact@agricapital.ci, or visit our website www.agricapital.ci. Our headquarters is in Daloa, Côte d'Ivoire." },
  ],
};

// Fallback to French for other languages (auto-translation handled by site-wide translator)
faqTranslations.ar = faqTranslations.fr;
faqTranslations.es = faqTranslations.fr;
faqTranslations.de = faqTranslations.fr;
faqTranslations.zh = faqTranslations.fr;

const FAQ = () => {
  const { language, t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("general");
  const navigate = useNavigate();

  const ft = t.faq || {
    title: "Foire Aux Questions",
    subtitle: "Trouvez rapidement les réponses à vos questions.",
    categories: { general: "Général", offers: "Nos Offres", investment: "Devenir Client", support: "Accompagnement", guarantees: "Garanties", company: "L'Entreprise" },
    noQuestions: "Aucune question dans cette catégorie.",
    ctaTitle: "Vous n'avez pas trouvé votre réponse ?",
    ctaSubtitle: "Notre équipe est disponible pour répondre à toutes vos questions.",
    contactUs: "Nous contacter",
  };

  const categories = [
    { id: "general", label: ft.categories.general, icon: HelpCircle },
    { id: "offres", label: ft.categories.offers, icon: Leaf },
    { id: "investissement", label: ft.categories.investment, icon: TrendingUp },
    { id: "accompagnement", label: ft.categories.support, icon: Users },
    { id: "garanties", label: ft.categories.guarantees, icon: Shield },
    { id: "entreprise", label: ft.categories.company, icon: Building2 },
  ];

  const faqItems = faqTranslations[language] || faqTranslations.fr;
  const filteredFAQ = faqItems.filter(item => item.category === activeCategory);

  const scrollToContact = () => {
    navigate('/#contact');
  };

  return (
    <>
      <SEOHead />
      <DynamicNavigation />
      
      <main className="pt-20 min-h-screen bg-background">
        <section className="py-12 sm:py-16 bg-agri-green text-white">
          <div className="container mx-auto px-4 text-center">
            <HelpCircle className="w-16 h-16 mx-auto mb-4 opacity-90" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">{ft.title}</h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto">{ft.subtitle}</p>
          </div>
        </section>

        <section className="py-8 border-b bg-card/50">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <Button key={cat.id} variant={activeCategory === cat.id ? "default" : "outline"}
                    className={`flex items-center gap-2 ${activeCategory === cat.id ? "bg-agri-green hover:bg-agri-green-dark text-white" : ""}`}
                    onClick={() => setActiveCategory(cat.id)}>
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{cat.label}</span>
                    <span className="sm:hidden">{cat.label.split(" ")[0]}</span>
                  </Button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <Accordion type="single" collapsible className="space-y-4">
              {filteredFAQ.map((item, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="bg-card border rounded-lg px-4 sm:px-6 shadow-sm">
                  <AccordionTrigger className="text-left hover:no-underline py-4 sm:py-5">
                    <span className="text-sm sm:text-base font-medium pr-4">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm sm:text-base pb-4 sm:pb-5 leading-relaxed">
                    {item.answer.includes('Inocent KOFFI') ? (
                      item.answer.split('Inocent KOFFI').map((part, i, arr) => (
                        <span key={i}>
                          {part}
                          {i < arr.length - 1 && <strong className="text-foreground font-bold">Inocent KOFFI</strong>}
                        </span>
                      ))
                    ) : item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            {filteredFAQ.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{ft.noQuestions}</p>
              </div>
            )}
          </div>
        </section>

        <section className="py-12 sm:py-16 bg-gradient-to-r from-agri-green/10 to-accent/10">
          <div className="container mx-auto px-4">
            <Card className="max-w-2xl mx-auto border-2 border-agri-green/20">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl sm:text-2xl">{ft.ctaTitle}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-center text-muted-foreground">{ft.ctaSubtitle}</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button onClick={scrollToContact} className="bg-agri-green hover:bg-agri-green-dark">
                    <MessageCircle className="w-4 h-4 mr-2" />{ft.contactUs}<ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button variant="outline" asChild><a href="tel:+2250564551717"><Phone className="w-4 h-4 mr-2" />05 64 55 17 17</a></Button>
                  <Button variant="outline" asChild><a href="mailto:contact@agricapital.ci"><Mail className="w-4 h-4 mr-2" />Email</a></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default FAQ;
