import { Sprout, Landmark, Microscope, Handshake, ArrowRight } from "lucide-react";
import { useLanguage, Language } from "@/contexts/LanguageContext";

import img1 from "@/assets/nursery-pepiniere-daloa.jpg";
import img2 from "@/assets/vavoua-land-2026.jpg";
import img3 from "@/assets/palm-mature-fruits.jpg";
import img4 from "@/assets/palm-oil-production.jpg";

interface Domain {
  image: string;
  Icon: typeof Sprout;
  title: Record<Language, string>;
  description: Record<Language, string>;
}

const domains: Domain[] = [
  {
    image: img1,
    Icon: Sprout,
    title: {
      fr: "Plantation clé en main",
      en: "Turnkey plantation",
      ar: "مزرعة جاهزة",
      es: "Plantación llave en mano",
      de: "Schlüsselfertige Plantage",
      zh: "交钥匙种植园",
    },
    description: {
      fr: "Plants certifiés, défrichage, piquetage, planting, intrants et fertilisation. Une plantation opérationnelle livrée prête à produire (36 mois).",
      en: "Certified seedlings, clearing, staking, planting, inputs and fertilisation. A fully operational plantation delivered at the end of development.",
      ar: "شتلات معتمدة، إزالة، تخطيط، زراعة وتسميد. مزرعة جاهزة للاستغلال.",
      es: "Plantas certificadas, desbroce, replanteo, siembra, insumos y fertilización. Plantación operativa al final del desarrollo.",
      de: "Zertifizierte Setzlinge, Rodung, Vermessung, Pflanzung, Betriebsmittel und Düngung. Betriebsbereite Plantage nach Entwicklungsende.",
      zh: "认证种苗、清理、放线、种植、投入与施肥。开发结束后交付可运营种植园。",
    },
  },
  {
    image: img2,
    Icon: Landmark,
    title: {
      fr: "Sécurisation foncière",
      en: "Land securing",
      ar: "تأمين الأراضي",
      es: "Aseguramiento de tierras",
      de: "Landsicherung",
      zh: "土地保障",
    },
    description: {
      fr: "Identification, vérification et sécurisation juridique du foncier agricole (opposable aux tiers), en lien avec les autorités locales et coutumières.",
      en: "Identification, due diligence and legal securing of agricultural land, working with local and customary authorities.",
      ar: "تحديد الأراضي الزراعية والتحقق منها وتأمينها قانونياً، بالتنسيق مع السلطات المحلية والعرفية.",
      es: "Identificación, verificación y aseguramiento jurídico de tierras agrícolas, con autoridades locales y consuetudinarias.",
      de: "Identifikation, Prüfung und rechtliche Sicherung landwirtschaftlicher Flächen mit lokalen und traditionellen Behörden.",
      zh: "在地方与传统机构协作下,完成农业用地的识别、尽调与法律保障。",
    },
  },
  {
    image: img3,
    Icon: Microscope,
    title: {
      fr: "Suivi technique & agronomique",
      en: "Technical & agronomic monitoring",
      ar: "متابعة فنية وزراعية",
      es: "Seguimiento técnico y agronómico",
      de: "Technische & agronomische Begleitung",
      zh: "技术与农艺监测",
    },
    description: {
      fr: "Visites régulières, conseils, reporting digital et accompagnement agronomique continu sur toute la durée du cycle de production.",
      en: "Regular site visits, expert advice, digital reporting and continuous agronomic support throughout the development.",
      ar: "زيارات منتظمة، استشارات، تقارير رقمية ودعم زراعي مستمر طوال فترة التطوير.",
      es: "Visitas regulares, consejos, reporte digital y acompañamiento agronómico continuo.",
      de: "Regelmäßige Besuche, Beratung, digitales Reporting und kontinuierliche agronomische Unterstützung.",
      zh: "定期访视、专家建议、数字化报告及持续农艺支持。",
    },
  },
  {
    image: img4,
    Icon: Handshake,
    title: {
      fr: "Garantie d'écoulement",
      en: "Off-take guarantee",
      ar: "ضمان التسويق",
      es: "Garantía de comercialización",
      de: "Abnahmegarantie",
      zh: "包销保障",
    },
    description: {
      fr: "Débouchés assurés et revenus stables grâce à des partenariats avec les acteurs industriels de la filière palmier à huile.",
      en: "Secured market and stable income through partnerships with industrial players in the oil palm value chain.",
      ar: "أسواق مضمونة ودخل مستقر بفضل شراكات مع الفاعلين الصناعيين في سلسلة قيمة نخيل الزيت.",
      es: "Salidas comerciales y ingresos estables gracias a alianzas con actores industriales de la cadena del aceite de palma.",
      de: "Gesicherte Absatzmärkte und stabile Einnahmen dank Partnerschaften mit Industriepartnern der Ölpalmen-Wertschöpfungskette.",
      zh: "通过与油棕产业链工业参与者的合作,保障销路与稳定收入。",
    },
  },
];

const labels = {
  eyebrow: { fr: "Nos domaines d'intervention", en: "Our areas of work", ar: "مجالات تدخلنا", es: "Nuestros ámbitos", de: "Unsere Tätigkeitsfelder", zh: "我们的业务领域" } as Record<Language, string>,
  title: {
    fr: "Nous accompagnons votre projet de plantation, de A à Z.",
    en: "We support your plantation project, from A to Z.",
    ar: "نرافق مشروع مزرعتكم من الألف إلى الياء.",
    es: "Acompañamos su proyecto de plantación, de la A a la Z.",
    de: "Wir begleiten Ihr Plantagenprojekt von A bis Z.",
    zh: "从头到尾,我们陪伴您的种植项目。",
  } as Record<Language, string>,
  subtitle: {
    fr: "Une approche industrielle, agronomique et humaine au service de votre projet agricole.",
    en: "An industrial, agronomic and human approach for oil palm in Côte d'Ivoire.",
    ar: "نهج صناعي وزراعي وإنساني لخدمة نخيل الزيت في كوت ديفوار.",
    es: "Un enfoque industrial, agronómico y humano al servicio de la palma aceitera en Costa de Marfil.",
    de: "Ein industrieller, agronomischer und menschlicher Ansatz für die Ölpalme in der Elfenbeinküste.",
    zh: "以工业、农艺与人本理念服务科特迪瓦油棕产业。",
  } as Record<Language, string>,
  cta: { fr: "Échanger avec un conseiller", en: "Talk to an advisor", ar: "تحدث مع مستشار", es: "Hablar con un asesor", de: "Berater kontaktieren", zh: "与顾问联系" } as Record<Language, string>,
};

const DomainesIntervention = () => {
  const { language } = useLanguage();
  const t = (rec: Record<Language, string>) => rec[language] || rec.fr;

  return (
    <section id="domaines" className="py-16 sm:py-20 lg:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mb-12 lg:mb-16">
          <span className="belife-eyebrow">{t(labels.eyebrow)}</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-accent leading-tight mb-4">
            {t(labels.title)}
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {t(labels.subtitle)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
          {domains.map((d, i) => {
            const Icon = d.Icon;
            return (
              <article
                key={i}
                className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-strong transition-all duration-300 flex flex-col"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={d.image}
                    alt={t(d.title)}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Floating icon badge — Belife signature */}
                  <div className="absolute bottom-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-card rounded-tl-3xl flex items-center justify-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center">
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>
                  </div>
                </div>
                <div className="p-6 sm:p-8 flex-1 flex flex-col">
                  <span className="w-10 h-[3px] bg-accent rounded mb-4" />
                  <h3 className="text-xl sm:text-2xl font-bold text-accent mb-3">{t(d.title)}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {t(d.description)}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-12 lg:mt-16 flex justify-center">
          <a
            href="https://wa.me/2250564551717"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-accent text-white font-semibold shadow-medium hover:shadow-strong hover:bg-accent/90 transition-all active:scale-95"
          >
            {t(labels.cta)}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default DomainesIntervention;
