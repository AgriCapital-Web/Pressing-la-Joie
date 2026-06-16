import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Handshake, User, Building2, Upload, Loader2, CheckCircle } from "lucide-react";

const PartnershipRequestForm = () => {
  const { language, t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    request_type: "",
    partner_type: "",
    category: "",
    first_name: "",
    last_name: "",
    company_name: "",
    email: "",
    phone: "",
    whatsapp: "",
    country: "Côte d'Ivoire",
    city: "",
    land_area_hectares: "",
    investment_amount: "",
    preferred_offer: "",
    message: "",
  });

  const requestTypes = [
    { value: "landowner", label: { fr: "Propriétaire Terrien", en: "Landowner", ar: "مالك الأرض", es: "Propietario de tierras", de: "Landbesitzer", zh: "土地所有者" } },
    { value: "producer", label: { fr: "Producteur Agricole", en: "Agricultural Producer", ar: "منتج زراعي", es: "Productor Agrícola", de: "Landwirtschaftlicher Produzent", zh: "农业生产者" } },
    { value: "investor", label: { fr: "Investisseur", en: "Investor", ar: "مستثمر", es: "Inversor", de: "Investor", zh: "投资者" } },
    { value: "institution", label: { fr: "Institution / ONG", en: "Institution / NGO", ar: "مؤسسة / منظمة غير حكومية", es: "Institución / ONG", de: "Institution / NGO", zh: "机构/非政府组织" } },
    { value: "industrial", label: { fr: "Partenaire Industriel", en: "Industrial Partner", ar: "شريك صناعي", es: "Socio Industrial", de: "Industriepartner", zh: "工业合作伙伴" } },
    { value: "technical", label: { fr: "Partenaire Technique", en: "Technical Partner", ar: "شريك تقني", es: "Socio Técnico", de: "Technischer Partner", zh: "技术合作伙伴" } },
  ];

  const partnerTypes = [
    { value: "individual", label: { fr: "Particulier", en: "Individual", ar: "فرد", es: "Particular", de: "Privatperson", zh: "个人" } },
    { value: "company", label: { fr: "Entreprise", en: "Company", ar: "شركة", es: "Empresa", de: "Unternehmen", zh: "公司" } },
    { value: "ngo", label: { fr: "ONG / Association", en: "NGO / Association", ar: "منظمة غير حكومية / جمعية", es: "ONG / Asociación", de: "NGO / Verein", zh: "非政府组织/协会" } },
    { value: "institution", label: { fr: "Institution Publique", en: "Public Institution", ar: "مؤسسة عامة", es: "Institución Pública", de: "Öffentliche Institution", zh: "公共机构" } },
  ];

  const categories = [
    { value: "agriculture", label: { fr: "Agriculture", en: "Agriculture", ar: "زراعة", es: "Agricultura", de: "Landwirtschaft", zh: "农业" } },
    { value: "finance", label: { fr: "Finance / Banque", en: "Finance / Banking", ar: "المالية / البنوك", es: "Finanzas / Banca", de: "Finanzen / Banken", zh: "金融/银行" } },
    { value: "technology", label: { fr: "Technologie", en: "Technology", ar: "تكنولوجيا", es: "Tecnología", de: "Technologie", zh: "技术" } },
    { value: "industry", label: { fr: "Industrie", en: "Industry", ar: "صناعة", es: "Industria", de: "Industrie", zh: "工业" } },
    { value: "commerce", label: { fr: "Commerce", en: "Commerce", ar: "تجارة", es: "Comercio", de: "Handel", zh: "商业" } },
    { value: "services", label: { fr: "Services", en: "Services", ar: "خدمات", es: "Servicios", de: "Dienstleistungen", zh: "服务" } },
    { value: "other", label: { fr: "Autre", en: "Other", ar: "آخر", es: "Otro", de: "Sonstiges", zh: "其他" } },
  ];

  const offers = [
    { value: "palmelite", label: "PalmElite" },
    { value: "palminvest", label: "PalmInvest" },
    { value: "terrapalm", label: "TerraPalm" },
    { value: "investment", label: { fr: "Package Investissement", en: "Investment Package", ar: "حزمة الاستثمار", es: "Paquete de Inversión", de: "Investitionspaket", zh: "投资套餐" } },
  ];

  const translations = {
    fr: {
      title: "Demande de Partenariat",
      subtitle: "Rejoignez l'aventure AgriCapital et participez à la transformation de l'agriculture ivoirienne",
      requestType: "Type de partenariat souhaité",
      partnerType: "Vous êtes",
      category: "Secteur d'activité",
      firstName: "Prénom",
      lastName: "Nom",
      companyName: "Nom de l'entreprise",
      email: "Email",
      phone: "Téléphone",
      whatsapp: "WhatsApp",
      country: "Pays",
      city: "Ville",
      landArea: "Superficie disponible (hectares)",
      investmentAmount: "Montant d'investissement envisagé (FCFA)",
      preferredOffer: "Offre préférée",
      message: "Message / Motivations",
      photo: "Photo de profil",
      companyLogo: "Logo de l'entreprise",
      submit: "Soumettre ma demande",
      submitting: "Envoi en cours...",
      success: "Votre demande a été envoyée avec succès ! Notre équipe vous contactera très bientôt.",
      error: "Une erreur s'est produite. Veuillez réessayer.",
      required: "Champs obligatoires",
      selectPlaceholder: "Sélectionnez une option",
      uploadPhoto: "Cliquer pour ajouter",
      changePhoto: "Changer",
    },
    en: {
      title: "Partnership Request",
      subtitle: "Join the AgriCapital adventure and participate in transforming Ivorian agriculture",
      requestType: "Desired partnership type",
      partnerType: "You are",
      category: "Business sector",
      firstName: "First name",
      lastName: "Last name",
      companyName: "Company name",
      email: "Email",
      phone: "Phone",
      whatsapp: "WhatsApp",
      country: "Country",
      city: "City",
      landArea: "Available area (hectares)",
      investmentAmount: "Planned investment amount (FCFA)",
      preferredOffer: "Preferred offer",
      message: "Message / Motivations",
      photo: "Profile photo",
      companyLogo: "Company logo",
      submit: "Submit my request",
      submitting: "Sending...",
      success: "Your request has been sent successfully! Our team will contact you very soon.",
      error: "An error occurred. Please try again.",
      required: "Required fields",
      selectPlaceholder: "Select an option",
      uploadPhoto: "Click to add",
      changePhoto: "Change",
    },
    ar: {
      title: "طلب شراكة",
      subtitle: "انضم إلى مغامرة أغريكابيتال وشارك في تحويل الزراعة الإيفوارية",
      requestType: "نوع الشراكة المطلوبة",
      partnerType: "أنت",
      category: "قطاع النشاط",
      firstName: "الاسم الأول",
      lastName: "اللقب",
      companyName: "اسم الشركة",
      email: "البريد الإلكتروني",
      phone: "الهاتف",
      whatsapp: "واتساب",
      country: "البلد",
      city: "المدينة",
      landArea: "المساحة المتاحة (هكتار)",
      investmentAmount: "مبلغ الاستثمار المخطط (FCFA)",
      preferredOffer: "العرض المفضل",
      message: "رسالة / دوافع",
      photo: "صورة الملف الشخصي",
      companyLogo: "شعار الشركة",
      submit: "إرسال طلبي",
      submitting: "جاري الإرسال...",
      success: "تم إرسال طلبك بنجاح! سيتواصل معك فريقنا قريباً جداً.",
      error: "حدث خطأ. يرجى المحاولة مرة أخرى.",
      required: "الحقول المطلوبة",
      selectPlaceholder: "اختر خياراً",
      uploadPhoto: "انقر للإضافة",
      changePhoto: "تغيير",
    },
    es: {
      title: "Solicitud de Asociación",
      subtitle: "Únase a la aventura AgriCapital y participe en la transformación de la agricultura marfileña",
      requestType: "Tipo de asociación deseada",
      partnerType: "Usted es",
      category: "Sector de actividad",
      firstName: "Nombre",
      lastName: "Apellido",
      companyName: "Nombre de la empresa",
      email: "Correo electrónico",
      phone: "Teléfono",
      whatsapp: "WhatsApp",
      country: "País",
      city: "Ciudad",
      landArea: "Superficie disponible (hectáreas)",
      investmentAmount: "Monto de inversión previsto (FCFA)",
      preferredOffer: "Oferta preferida",
      message: "Mensaje / Motivaciones",
      photo: "Foto de perfil",
      companyLogo: "Logo de la empresa",
      submit: "Enviar mi solicitud",
      submitting: "Enviando...",
      success: "¡Su solicitud ha sido enviada con éxito! Nuestro equipo le contactará muy pronto.",
      error: "Se produjo un error. Por favor, inténtelo de nuevo.",
      required: "Campos obligatorios",
      selectPlaceholder: "Seleccione una opción",
      uploadPhoto: "Clic para agregar",
      changePhoto: "Cambiar",
    },
    de: {
      title: "Partnerschaftsanfrage",
      subtitle: "Treten Sie dem AgriCapital-Abenteuer bei und nehmen Sie an der Transformation der ivorischen Landwirtschaft teil",
      requestType: "Gewünschte Partnerschaftsart",
      partnerType: "Sie sind",
      category: "Geschäftssektor",
      firstName: "Vorname",
      lastName: "Nachname",
      companyName: "Firmenname",
      email: "E-Mail",
      phone: "Telefon",
      whatsapp: "WhatsApp",
      country: "Land",
      city: "Stadt",
      landArea: "Verfügbare Fläche (Hektar)",
      investmentAmount: "Geplanter Investitionsbetrag (FCFA)",
      preferredOffer: "Bevorzugtes Angebot",
      message: "Nachricht / Motivationen",
      photo: "Profilfoto",
      companyLogo: "Firmenlogo",
      submit: "Anfrage absenden",
      submitting: "Wird gesendet...",
      success: "Ihre Anfrage wurde erfolgreich gesendet! Unser Team wird Sie sehr bald kontaktieren.",
      error: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
      required: "Pflichtfelder",
      selectPlaceholder: "Option auswählen",
      uploadPhoto: "Klicken zum Hinzufügen",
      changePhoto: "Ändern",
    },
    zh: {
      title: "合作伙伴申请",
      subtitle: "加入AgriCapital冒险，参与科特迪瓦农业转型",
      requestType: "期望的合作类型",
      partnerType: "您是",
      category: "业务领域",
      firstName: "名字",
      lastName: "姓氏",
      companyName: "公司名称",
      email: "电子邮件",
      phone: "电话",
      whatsapp: "WhatsApp",
      country: "国家",
      city: "城市",
      landArea: "可用面积（公顷）",
      investmentAmount: "计划投资金额（FCFA）",
      preferredOffer: "首选方案",
      message: "留言/动机",
      photo: "个人照片",
      companyLogo: "公司标志",
      submit: "提交申请",
      submitting: "发送中...",
      success: "您的申请已成功发送！我们的团队将很快与您联系。",
      error: "发生错误，请重试。",
      required: "必填字段",
      selectPlaceholder: "选择一个选项",
      uploadPhoto: "点击添加",
      changePhoto: "更改",
    },
  };

  const tr = translations[language as keyof typeof translations] || translations.fr;

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image trop grande. Maximum 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.request_type || !formData.partner_type || !formData.email) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("partnership_requests").insert({
        request_type: formData.request_type,
        partner_type: formData.partner_type,
        category: formData.category || null,
        first_name: formData.first_name || null,
        last_name: formData.last_name || null,
        company_name: formData.company_name || null,
        photo_url: photoPreview || null,
        company_logo_url: formData.partner_type === "company" ? photoPreview : null,
        email: formData.email,
        phone: formData.phone || null,
        whatsapp: formData.whatsapp || null,
        country: formData.country,
        city: formData.city || null,
        land_area_hectares: formData.land_area_hectares ? parseFloat(formData.land_area_hectares) : null,
        investment_amount: formData.investment_amount ? parseFloat(formData.investment_amount) : null,
        preferred_offer: formData.preferred_offer || null,
        message: formData.message || null,
        language: language,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success(tr.success);
    } catch (error) {
      console.error("Error submitting partnership request:", error);
      toast.error(tr.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="max-w-2xl mx-auto border-2 border-agri-green/20">
        <CardContent className="py-12 text-center">
          <CheckCircle className="w-16 h-16 text-agri-green mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-foreground mb-2">{tr.success.split("!")[0]}!</h3>
          <p className="text-muted-foreground">{tr.success.split("!")[1]}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto border-2 border-agri-green/20 shadow-lg">
      <CardHeader className="text-center bg-gradient-to-r from-agri-green/10 to-agri-orange/10 rounded-t-lg">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-agri-green/20 rounded-full">
            <Handshake className="w-8 h-8 text-agri-green" />
          </div>
        </div>
        <CardTitle className="text-2xl md:text-3xl text-foreground">{tr.title}</CardTitle>
        <p className="text-muted-foreground mt-2">{tr.subtitle}</p>
      </CardHeader>
      
      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Type de partenariat */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                {tr.requestType} <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.request_type} onValueChange={(v) => setFormData({ ...formData, request_type: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={tr.selectPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {requestTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label[language as keyof typeof type.label] || type.label.fr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                {tr.partnerType} <span className="text-destructive">*</span>
              </Label>
              <Select value={formData.partner_type} onValueChange={(v) => setFormData({ ...formData, partner_type: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={tr.selectPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {partnerTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label[language as keyof typeof type.label] || type.label.fr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Catégorie */}
          <div className="space-y-2">
            <Label>{tr.category}</Label>
            <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
              <SelectTrigger>
                <SelectValue placeholder={tr.selectPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label[language as keyof typeof cat.label] || cat.label.fr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Photo/Logo */}
          <div className="space-y-2">
            <Label>{formData.partner_type === "company" ? tr.companyLogo : tr.photo}</Label>
            <div className="flex items-center gap-4">
              <div 
                className="w-24 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:border-agri-green transition-colors overflow-hidden"
                onClick={() => document.getElementById("photo-upload")?.click()}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    {formData.partner_type === "company" ? (
                      <Building2 className="w-8 h-8 mx-auto text-muted-foreground" />
                    ) : (
                      <User className="w-8 h-8 mx-auto text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground">{tr.uploadPhoto}</span>
                  </div>
                )}
              </div>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
              {photoPreview && (
                <Button type="button" variant="outline" size="sm" onClick={() => setPhotoPreview(null)}>
                  {tr.changePhoto}
                </Button>
              )}
            </div>
          </div>

          {/* Nom et Prénom */}
          {formData.partner_type !== "company" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{tr.firstName}</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder={tr.firstName}
                />
              </div>
              <div className="space-y-2">
                <Label>{tr.lastName}</Label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder={tr.lastName}
                />
              </div>
            </div>
          )}

          {/* Nom entreprise */}
          {(formData.partner_type === "company" || formData.partner_type === "ngo" || formData.partner_type === "institution") && (
            <div className="space-y-2">
              <Label>{tr.companyName}</Label>
              <Input
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder={tr.companyName}
              />
            </div>
          )}

          {/* Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1">
                {tr.email} <span className="text-destructive">*</span>
              </Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={tr.email}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>{tr.phone}</Label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+225 XX XX XX XX XX"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{tr.whatsapp}</Label>
              <Input
                type="tel"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                placeholder="+225 XX XX XX XX XX"
              />
            </div>
            <div className="space-y-2">
              <Label>{tr.city}</Label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder={tr.city}
              />
            </div>
          </div>

          {/* Détails projet */}
          {(formData.request_type === "landowner" || formData.request_type === "producer") && (
            <div className="space-y-2">
              <Label>{tr.landArea}</Label>
              <Input
                type="number"
                value={formData.land_area_hectares}
                onChange={(e) => setFormData({ ...formData, land_area_hectares: e.target.value })}
                placeholder="Ex: 10"
                min="0"
                step="0.5"
              />
            </div>
          )}

          {formData.request_type === "investor" && (
            <div className="space-y-2">
              <Label>{tr.investmentAmount}</Label>
              <Input
                type="number"
                value={formData.investment_amount}
                onChange={(e) => setFormData({ ...formData, investment_amount: e.target.value })}
                placeholder="Ex: 1250000"
                min="0"
              />
            </div>
          )}

          {/* Offre préférée */}
          <div className="space-y-2">
            <Label>{tr.preferredOffer}</Label>
            <Select value={formData.preferred_offer} onValueChange={(v) => setFormData({ ...formData, preferred_offer: v })}>
              <SelectTrigger>
                <SelectValue placeholder={tr.selectPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {offers.map((offer) => (
                  <SelectItem key={offer.value} value={offer.value}>
                    {typeof offer.label === "string" ? offer.label : (offer.label[language as keyof typeof offer.label] || offer.label.fr)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label>{tr.message}</Label>
            <Textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder={tr.message}
              rows={4}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            <span className="text-destructive">*</span> {tr.required}
          </p>

          <Button
            type="submit"
            className="w-full bg-agri-green hover:bg-agri-green-dark text-white py-6 text-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {tr.submitting}
              </>
            ) : (
              <>
                <Handshake className="w-5 h-5 mr-2" />
                {tr.submit}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PartnershipRequestForm;
