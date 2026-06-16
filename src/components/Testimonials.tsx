import { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, User, Mail, Upload, X, Briefcase, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusOptions = [
  { value: "planteur", label: { fr: "Planteur", en: "Farmer", ar: "مزارع", es: "Agricultor", de: "Bauer", zh: "种植者" } },
  { value: "partenaire", label: { fr: "Partenaire", en: "Partner", ar: "شريك", es: "Socio", de: "Partner", zh: "合作伙伴" } },
  { value: "investisseur", label: { fr: "Investisseur", en: "Investor", ar: "مستثمر", es: "Inversor", de: "Investor", zh: "投资者" } },
  { value: "institution", label: { fr: "Institution / ONG", en: "Institution / NGO", ar: "مؤسسة / منظمة", es: "Institución / ONG", de: "Institution / NGO", zh: "机构/非政府组织" } },
  { value: "proprietaire", label: { fr: "Propriétaire terrien", en: "Landowner", ar: "مالك أرض", es: "Propietario de tierras", de: "Landbesitzer", zh: "土地所有者" } },
  { value: "other", label: { fr: "Autre", en: "Other", ar: "آخر", es: "Otro", de: "Andere", zh: "其他" } },
];

const Testimonials = () => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    testimonial: "",
    status: "",
    isAgriCapitalSubscriber: false,
  });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La photo doit faire moins de 5MB");
        return;
      }
      
      if (!file.type.startsWith("image/")) {
        toast.error("Le fichier doit être une image");
        return;
      }

      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.testimonial || !formData.status) {
      toast.error(t.testimonials.form.requiredFields);
      return;
    }

    setIsSubmitting(true);
    
    try {
      let photoUrl = null;

      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('testimonial-photos')
          .upload(fileName, photoFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error("Erreur lors de l'upload de la photo");
          setIsSubmitting(false);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('testimonial-photos')
          .getPublicUrl(fileName);
        
        photoUrl = publicUrl;
      }

      const { error: insertError } = await supabase
        .from('testimonials')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email || null,
          testimonial: formData.testimonial,
          photo_url: photoUrl,
          approved: false,
          status: formData.status,
          is_agricapital_subscriber: formData.isAgriCapitalSubscriber
        } as any);

      if (insertError) {
        console.error('Insert error:', insertError);
        toast.error("Erreur lors de l'envoi du témoignage");
        setIsSubmitting(false);
        return;
      }

      toast.success(t.testimonials.form.success);
      setFormData({ firstName: "", lastName: "", email: "", testimonial: "", status: "", isAgriCapitalSubscriber: false });
      setPhotoFile(null);
      setPhotoPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusLabel = (value: string) => {
    const option = statusOptions.find(opt => opt.value === value);
    return option ? option.label[language as keyof typeof option.label] || option.label.fr : value;
  };

  const seeMoreText: Record<string, string> = {
    fr: "Voir plus de témoignages",
    en: "See more testimonials",
    ar: "عرض المزيد من الشهادات",
    es: "Ver más testimonios",
    de: "Mehr Zeugnisse anzeigen",
    zh: "查看更多推荐",
  };

  return (
    <section id="testimonials-form" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.testimonials.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            {t.testimonials.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button 
                size="lg" 
                className="bg-agri-green hover:bg-agri-green-light text-white transition-smooth gap-2"
              >
                <MessageSquare className="w-5 h-5" />
                {t.testimonials.form.title}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl">
                  <MessageSquare className="w-6 h-6 text-agri-green" />
                  {t.testimonials.form.title}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                {/* Photo upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    {t.testimonials.form.photo} ({t.testimonials.form.optional})
                  </label>
                  
                  {!photoPreview ? (
                    <div className="relative">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                        id="photo-upload"
                      />
                      <label
                        htmlFor="photo-upload"
                        className="flex items-center justify-center w-full h-28 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-agri-green transition-smooth bg-background"
                      >
                        <div className="text-center">
                          <Upload className="w-6 h-6 mx-auto mb-1 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {t.testimonials.form.clickToAdd}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t.testimonials.form.maxSize}
                          </p>
                        </div>
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={photoPreview}
                        alt="Prévisualisation"
                        className="w-full h-40 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="absolute top-2 right-2 p-2 bg-destructive text-white rounded-full hover:bg-destructive/90 transition-smooth"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {t.testimonials.form.firstName} *
                    </label>
                    <Input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder={t.testimonials.form.firstNamePlaceholder}
                      className="bg-background border-border"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {t.testimonials.form.lastName} *
                    </label>
                    <Input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder={t.testimonials.form.lastNamePlaceholder}
                      className="bg-background border-border"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {t.testimonials.form.email} ({t.testimonials.form.optional})
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t.testimonials.form.emailPlaceholder}
                    className="bg-background border-border"
                  />
                </div>

                {/* Status field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {t.testimonials.form.status || "Statut"} *
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value, isAgriCapitalSubscriber: false })}
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder={t.testimonials.form.statusPlaceholder || "Sélectionnez votre statut"} />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label[language as keyof typeof option.label] || option.label.fr}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* AgriCapital subscriber field - show for planteur or proprietaire */}
                {(formData.status === "planteur" || formData.status === "proprietaire") && (
                  <div className="space-y-2 p-4 bg-secondary/50 rounded-lg">
                    <label className="text-sm font-medium text-foreground flex items-center gap-2">
                      {t.testimonials.form.subscriberQuestion || "Êtes-vous abonné(e) AgriCapital ?"}
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="subscriber"
                          checked={formData.isAgriCapitalSubscriber === true}
                          onChange={() => setFormData({ ...formData, isAgriCapitalSubscriber: true })}
                          className="w-4 h-4 text-agri-green"
                        />
                        <span className="text-sm">{t.common?.yes || "Oui"}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="subscriber"
                          checked={formData.isAgriCapitalSubscriber === false}
                          onChange={() => setFormData({ ...formData, isAgriCapitalSubscriber: false })}
                          className="w-4 h-4 text-agri-green"
                        />
                        <span className="text-sm">{t.common?.no || "Non"}</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    {t.testimonials.form.testimonial} *
                  </label>
                  <Textarea
                    value={formData.testimonial}
                    onChange={(e) => setFormData({ ...formData, testimonial: e.target.value })}
                    placeholder={t.testimonials.form.testimonialPlaceholder}
                    className="bg-background border-border min-h-[120px]"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-agri-green hover:bg-agri-green-light text-white transition-smooth"
                >
                  {isSubmitting ? t.testimonials.form.submitting : t.testimonials.form.submit}
                </Button>

                <p className="text-sm text-muted-foreground text-center">
                  {t.testimonials.form.note}
                </p>
              </form>
            </DialogContent>
            </Dialog>

            <Button asChild variant="ghost" className="text-primary hover:text-primary/80">
              <Link to="/temoignages">
                {seeMoreText[language] || seeMoreText.fr}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
