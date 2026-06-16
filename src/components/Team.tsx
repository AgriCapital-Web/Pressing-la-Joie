import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent } from "@/components/ui/card";
import { User } from "lucide-react";
import founderAsset from "@/assets/inocent-koffi-official.jpeg.asset.json";
import pierreImage from "@/assets/team-pierre-kouame.jpg";
import ericImage from "@/assets/team-eric-dido.jpg";
import marcelImage from "@/assets/team-marcel-konan.jpg";
import angaImage from "@/assets/team-anga-mathieu.jpg";
import gesmaLogo from "@/assets/partner-gesma.jpg";
import legalFormLogo from "@/assets/partner-legalform.jpg";

const teamTranslations = {
  fr: {
    title: "Équipe & Partenaires",
    subtitle: "Une direction engagée et un réseau de partenaires experts",
    direction: "Direction",
    partners: "Partenaires Techniques & d'Appui",
    teamNote: "Équipe en cours de constitution — AgriCapital constitue progressivement ses équipes commerciale et technique terrain.",
  },
  en: {
    title: "Team & Partners",
    subtitle: "A committed leadership and a network of expert partners",
    direction: "Management",
    partners: "Technical & Support Partners",
    teamNote: "Team in formation — AgriCapital is progressively building its commercial and technical field teams.",
  },
  ar: {
    title: "الفريق والشركاء",
    subtitle: "قيادة ملتزمة وشبكة من الشركاء الخبراء",
    direction: "الإدارة",
    partners: "الشركاء التقنيون والداعمون",
    teamNote: "الفريق قيد التكوين — تقوم أغريكابيتال ببناء فرقها التجارية والتقنية تدريجيًا.",
  },
  es: {
    title: "Equipo y Socios",
    subtitle: "Una dirección comprometida y una red de socios expertos",
    direction: "Dirección",
    partners: "Socios Técnicos y de Apoyo",
    teamNote: "Equipo en formación — AgriCapital constituye progresivamente sus equipos comercial y técnico.",
  },
  de: {
    title: "Team & Partner",
    subtitle: "Eine engagierte Führung und ein Netzwerk von Expertenpartnern",
    direction: "Geschäftsführung",
    partners: "Technische Partner & Unterstützung",
    teamNote: "Team im Aufbau — AgriCapital baut progressiv seine Vertriebs- und Technikteams auf.",
  },
  zh: {
    title: "团队与合作伙伴",
    subtitle: "坚定的领导层和专业合作伙伴网络",
    direction: "管理层",
    partners: "技术与支持合作伙伴",
    teamNote: "团队正在组建中 — AgriCapital正在逐步建立其商业和技术团队。",
  },
};

const directionMembers = {
  fr: [
    { name: "Inocent KOFFI", role: "Gérant", bio: "Informaticien, commercial et stratège, Inocent KOFFI assure la vision globale d'AgriCapital, la conception du modèle économique et la coordination de l'ensemble du déploiement.", image: founderAsset.url, email: "direction@agricapital.ci" },
    { name: "Éric Stéphane DIDO", role: "Chargé du Développement Commercial", bio: "Contribution à la préparation du dispositif commercial, au déploiement des activités et au développement du portefeuille de clients.", image: ericImage },
    { name: "Koffi Pierre KOUAMÉ", role: "Conseiller Stratégique", bio: "Plus de 10 ans d'expérience en gouvernance organisationnelle. Accompagne AgriCapital sur les questions institutionnelles, la gouvernance et la sécurisation foncière.", image: pierreImage },
  ],
  en: [
    { name: "Inocent KOFFI", role: "Manager", bio: "IT specialist, commercial strategist and entrepreneur, Inocent KOFFI oversees AgriCapital's global vision, business model design and overall deployment coordination.", image: founderAsset.url, email: "direction@agricapital.ci" },
    { name: "Éric Stéphane DIDO", role: "Business Development Manager", bio: "Contributes to commercial strategy preparation, business deployment and client portfolio development.", image: ericImage },
    { name: "Koffi Pierre KOUAMÉ", role: "Strategic Advisor", bio: "Over 10 years of experience in organizational governance. Supports AgriCapital on institutional matters, governance and land security.", image: pierreImage },
  ],
  ar: [
    { name: "Inocent KOFFI", role: "المدير", bio: "يشرف Inocent KOFFI على الرؤية الشاملة لأغريكابيتال وتصميم النموذج الاقتصادي وتنسيق التنفيذ.", image: founderAsset.url, email: "direction@agricapital.ci" },
    { name: "إريك ستيفان ديدو", role: "مسؤول التطوير التجاري", bio: "المساهمة في إعداد الجهاز التجاري وتطوير محفظة العملاء.", image: ericImage },
    { name: "كوفي بيير كوامي", role: "مستشار استراتيجي", bio: "أكثر من 10 سنوات من الخبرة في الحوكمة المؤسسية.", image: pierreImage },
  ],
  es: [
    { name: "Inocent KOFFI", role: "Gerente", bio: "Informático, comercial y estratega, Inocent KOFFI lidera la visión global de AgriCapital y la coordinación del despliegue.", image: founderAsset.url, email: "direction@agricapital.ci" },
    { name: "Éric Stéphane DIDO", role: "Encargado de Desarrollo Comercial", bio: "Contribución a la estrategia comercial y desarrollo de cartera de clientes.", image: ericImage },
    { name: "Koffi Pierre KOUAMÉ", role: "Asesor Estratégico", bio: "Más de 10 años de experiencia en gobernanza organizacional.", image: pierreImage },
  ],
  de: [
    { name: "Inocent KOFFI", role: "Geschäftsführer", bio: "Als IT-Fachmann, Kaufmann und Stratege leitet Inocent KOFFI die Gesamtvision von AgriCapital und die Umsetzung des Modells.", image: founderAsset.url, email: "direction@agricapital.ci" },
    { name: "Éric Stéphane DIDO", role: "Leiter Geschäftsentwicklung", bio: "Beitrag zur Geschäftsstrategie und Kundenportfolio-Entwicklung.", image: ericImage },
    { name: "Koffi Pierre KOUAMÉ", role: "Strategischer Berater", bio: "Über 10 Jahre Erfahrung in organisatorischer Governance.", image: pierreImage },
  ],
  zh: [
    { name: "Inocent KOFFI", role: "经理", bio: "Inocent KOFFI 负责 AgriCapital 的整体愿景、商业模式设计和部署协调。", image: founderAsset.url, email: "direction@agricapital.ci" },
    { name: "Éric Stéphane DIDO", role: "商业发展负责人", bio: "参与商业战略准备和客户组合开发。", image: ericImage },
    { name: "Koffi Pierre KOUAMÉ", role: "战略顾问", bio: "超过10年的组织治理经验。", image: pierreImage },
  ],
};

const partnerMembers = {
  fr: [
    { name: "Dr Marcel KONAN — MiProjet", role: "Structuration & Stratégie de Projet", bio: "Expert en évaluation et structuration de projets. Appui à l'optimisation du modèle économique et à la cohérence organisationnelle.", image: marcelImage },
    { name: "Kouamé Mathieu ANGA", role: "Agronomie & Suivi des Plantations", bio: "Ingénieur agronome. Appui technique sur les itinéraires culturaux et le développement des plantations palmier à huile.", image: angaImage },
    { name: "Cabinet Legal Form", role: "Expertise Juridique", bio: "Appui à la structuration juridique du projet, sécurisation contractuelle des relations clients et propriétaires fonciers.", image: legalFormLogo, isLogo: true },
    { name: "Cabinet GESMA SARL", role: "Expertise Comptable & Fiscale", bio: "Appui à la structuration comptable et fiscale, mise en place des dispositifs de gestion et suivi des obligations.", image: gesmaLogo, isLogo: true },
  ],
  en: [
    { name: "Dr Marcel KONAN — MiProjet", role: "Project Structuring & Strategy", bio: "Expert in project evaluation and structuring. Support for business model optimization and organizational coherence.", image: marcelImage },
    { name: "Kouamé Mathieu ANGA", role: "Agronomy & Plantation Monitoring", bio: "Agronomist engineer. Technical support on crop cycles and oil palm plantation development.", image: angaImage },
    { name: "Cabinet Legal Form", role: "Legal Expertise", bio: "Legal structuring support, contractual security for client and landowner relationships.", image: legalFormLogo, isLogo: true },
    { name: "Cabinet GESMA SARL", role: "Accounting & Tax Expertise", bio: "Accounting and tax structuring, management systems and regulatory compliance.", image: gesmaLogo, isLogo: true },
  ],
  ar: [
    { name: "د. مارسيل كونان — MiProjet", role: "هيكلة واستراتيجية المشاريع", bio: "خبير في تقييم وهيكلة المشاريع.", image: marcelImage },
    { name: "كوامي ماتيو أنغا", role: "الهندسة الزراعية ومتابعة المزارع", bio: "مهندس زراعي. دعم تقني في تطوير مزارع نخيل الزيت.", image: angaImage },
    { name: "Cabinet Legal Form", role: "الخبرة القانونية", bio: "دعم الهيكلة القانونية وتأمين العلاقات التعاقدية.", image: legalFormLogo, isLogo: true },
    { name: "Cabinet GESMA SARL", role: "الخبرة المحاسبية والضريبية", bio: "هيكلة محاسبية وضريبية وامتثال إداري.", image: gesmaLogo, isLogo: true },
  ],
  es: [
    { name: "Dr Marcel KONAN — MiProjet", role: "Estructuración y Estrategia", bio: "Experto en evaluación y estructuración de proyectos.", image: marcelImage },
    { name: "Kouamé Mathieu ANGA", role: "Agronomía y Seguimiento", bio: "Ingeniero agrónomo. Apoyo técnico en plantaciones de palma.", image: angaImage },
    { name: "Cabinet Legal Form", role: "Experiencia Jurídica", bio: "Apoyo en la estructuración jurídica y seguridad contractual.", image: legalFormLogo, isLogo: true },
    { name: "Cabinet GESMA SARL", role: "Contabilidad y Fiscalidad", bio: "Estructuración contable y fiscal.", image: gesmaLogo, isLogo: true },
  ],
  de: [
    { name: "Dr Marcel KONAN — MiProjet", role: "Projektstrukturierung & Strategie", bio: "Experte für Projektbewertung und Strukturierung.", image: marcelImage },
    { name: "Kouamé Mathieu ANGA", role: "Agronomie & Plantagenüberwachung", bio: "Agraringenieur. Technische Unterstützung bei Ölpalmenplantagen.", image: angaImage },
    { name: "Cabinet Legal Form", role: "Rechtliche Expertise", bio: "Rechtliche Strukturierung und vertragliche Sicherheit.", image: legalFormLogo, isLogo: true },
    { name: "Cabinet GESMA SARL", role: "Buchhaltung & Steuerexpertise", bio: "Buchhaltung und steuerliche Strukturierung.", image: gesmaLogo, isLogo: true },
  ],
  zh: [
    { name: "Marcel KONAN博士 — MiProjet", role: "项目结构与战略", bio: "项目评估和结构化专家。", image: marcelImage },
    { name: "Kouamé Mathieu ANGA", role: "农学与种植园监测", bio: "农业工程师。油棕种植园技术支持。", image: angaImage },
    { name: "Cabinet Legal Form", role: "法律专业知识", bio: "法律结构支持和合同安全。", image: legalFormLogo, isLogo: true },
    { name: "Cabinet GESMA SARL", role: "会计与税务专业知识", bio: "会计和税务结构化。", image: gesmaLogo, isLogo: true },
  ],
};

type MemberType = { name: string; role: string; bio: string; image: string | null; email?: string; isLogo?: boolean };

const MemberCard = ({ member }: { member: MemberType }) => (
  <Card className="bg-card border-border hover:shadow-medium transition-smooth overflow-hidden">
    <CardContent className="p-6 flex flex-col items-center text-center">
      <div className="w-28 h-28 rounded-full overflow-hidden mb-4 border-4 border-primary/20 flex items-center justify-center bg-secondary/50">
        {member.image ? (
          <img
            src={member.image}
            alt={member.name}
            width={224}
            height={224}
            className={member.isLogo ? 'w-full h-full object-cover' : 'w-full h-full object-cover object-top'}
            loading="lazy"
            decoding="async"
            sizes="112px"
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/placeholder.svg"; }}
          />
        ) : (
          <User className="w-12 h-12 text-muted-foreground" />
        )}
      </div>
      <h4 className="text-lg font-bold text-foreground mb-1">{member.name}</h4>
      <p className="text-sm text-primary font-semibold mb-2">{member.role}</p>
      <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
      {member.email && (
        <a href={`mailto:${member.email}`} className="text-xs text-primary mt-2 hover:underline">
          ✉ {member.email}
        </a>
      )}
    </CardContent>
  </Card>
);

const Team = () => {
  const { language } = useLanguage();
  const t = teamTranslations[language] || teamTranslations.fr;
  const direction = directionMembers[language] || directionMembers.fr;
  const partners = partnerMembers[language] || partnerMembers.fr;

  return (
    <section id="equipe" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t.title}</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">{t.subtitle}</p>
        </div>

        {/* Direction */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">{t.direction}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {direction.map((member: MemberType, i: number) => (
              <MemberCard key={i} member={member} />
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-6 italic">{t.teamNote}</p>
        </div>

        {/* Partners */}
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-8 text-center">{t.partners}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {partners.map((member: MemberType, i: number) => (
              <MemberCard key={i} member={member} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Team;
