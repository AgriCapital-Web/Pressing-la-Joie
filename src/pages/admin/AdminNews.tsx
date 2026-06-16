import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Eye, EyeOff, Upload, Image, Video, Calendar, Loader2, Sparkles, Wand2, Hash, FileText, Globe, Languages, ImagePlus, Clapperboard, ImageIcon, Film, Images, FileImage, Type } from "lucide-react";
import WYSIWYGEditor from "@/components/admin/WYSIWYGEditor";

// Enhanced markdown to HTML converter
const markdownToHtml = (md: string): string => {
  let html = md
    .replace(/^\|(.+)\|\s*\n\|[-:\s|]+\|\s*\n((?:\|.+\|\s*\n?)*)/gm, (_, header, body) => {
      const headers = header.split('|').map((h: string) => h.trim()).filter(Boolean);
      const rows = body.trim().split('\n').map((row: string) =>
        row.split('|').map((c: string) => c.trim()).filter(Boolean)
      );
      return `<table class="w-full border-collapse my-6 text-sm"><thead><tr>${headers.map((h: string) => `<th class="border border-border bg-primary/10 px-4 py-3 text-left font-bold text-primary">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((row: string[], ri: number) => `<tr class="${ri % 2 === 0 ? 'bg-background' : 'bg-muted/30'}">${row.map((c: string) => `<td class="border border-border/50 px-4 py-2.5">${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
    })
    .replace(/^#### (.+)$/gm, '<h4 class="text-base font-semibold mt-6 mb-2">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-bold mt-8 mb-3 text-primary/90">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-10 mb-4 text-primary">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-10 mb-4">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-6 mb-1">$2</li>')
    .replace(/^- (.+)$/gm, '<li class="ml-6 mb-1 list-disc">$1</li>')
    .replace(/^---$/gm, '<hr class="my-6 border-border">')
    .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 italic bg-muted/50 rounded-r">$1</blockquote>')
    .replace(/\n{2,}/g, '</p><p class="mb-4 leading-relaxed">')
    .replace(/^(?!<[hultbdo]|<li|<hr|<block|<table)(.+)$/gm, '<p class="mb-4 leading-relaxed">$1</p>')
    .replace(/<p class="mb-4 leading-relaxed"><\/p>/g, '');
  return html;
};

interface NewsArticle {
  id: string;
  slug: string;
  title_fr: string;
  title_en: string | null;
  content_fr: string;
  content_en: string | null;
  excerpt_fr: string | null;
  excerpt_en: string | null;
  featured_image: string | null;
  images: string[];
  videos: string[];
  category: string;
  is_published: boolean;
  is_featured: boolean;
  published_at: string | null;
  author: string;
  views_count: number;
  created_at: string;
}

type MediaOption = "with-image" | "with-video" | "with-both" | "with-gallery" | "text-only";

const MEDIA_OPTIONS: { id: MediaOption; icon: any; label: string; desc: string }[] = [
  { id: "with-image", icon: ImageIcon, label: "Avec image IA", desc: "Une image ultra-réaliste générée par l'IA" },
  { id: "with-video", icon: Film, label: "Avec vidéo IA", desc: "Une vidéo courte professionnelle" },
  { id: "with-both", icon: FileImage, label: "Image + Vidéo", desc: "Combinaison image et vidéo IA" },
  { id: "with-gallery", icon: Images, label: "Galerie d'images", desc: "3-4 images thématiques cohérentes" },
  { id: "text-only", icon: Type, label: "Sans média", desc: "Génération textuelle uniquement" },
];

const AdminNews = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVideos, setUploadingVideos] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState("");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatingVideo, setGeneratingVideo] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState("");

  // AI Generation states
  const [showGeneratePopup, setShowGeneratePopup] = useState(false);
  const [selectedMediaOption, setSelectedMediaOption] = useState<MediaOption>("with-image");
  const [generatingAI, setGeneratingAI] = useState(false);
  const [generationStep, setGenerationStep] = useState("");

  const [formData, setFormData] = useState({
    slug: "", title_fr: "", title_en: "", title_ar: "", title_es: "", title_de: "", title_zh: "",
    content_fr: "", content_en: "", content_ar: "", content_es: "", content_de: "", content_zh: "",
    excerpt_fr: "", excerpt_en: "", excerpt_ar: "", excerpt_es: "", excerpt_de: "", excerpt_zh: "",
    featured_image: "", images: [] as string[], videos: [] as string[],
    category: "general", is_published: false, is_featured: false, author: "AgriCapital"
  });

  const { data: news, isLoading } = useQuery({
    queryKey: ["admin-news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as NewsArticle[];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const slug = data.slug || data.title_fr.toLowerCase().replace(/[^a-z0-9àâäéèêëïîôùûüÿçœæ]+/g, '-').replace(/^-|-$/g, '');
      const payload = {
        ...data,
        slug,
        images: JSON.stringify(data.images),
        videos: JSON.stringify(data.videos),
        published_at: data.is_published ? new Date().toISOString() : null
      };
      if (editingArticle) {
        const { error } = await supabase.from("news").update(payload).eq("id", editingArticle.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("news").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      queryClient.invalidateQueries({ queryKey: ["news"] });
      queryClient.invalidateQueries({ queryKey: ["news-section"] });
      toast.success(editingArticle ? "Article mis à jour" : "Article créé avec succès");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
      console.error("Save error:", error);
      toast.error(`Erreur: ${error?.message || "Impossible d'enregistrer"}`);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("news").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      queryClient.invalidateQueries({ queryKey: ["news"] });
      queryClient.invalidateQueries({ queryKey: ["news-section"] });
      toast.success("Article supprimé avec succès");
    },
    onError: (error: any) => {
      console.error("Delete error:", error);
      toast.error(`Erreur suppression: ${error?.message || "Impossible de supprimer cet article"}`);
    }
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase
        .from("news")
        .update({ is_published, published_at: is_published ? new Date().toISOString() : null })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news"] });
      queryClient.invalidateQueries({ queryKey: ["news"] });
      queryClient.invalidateQueries({ queryKey: ["news-section"] });
      toast.success("Statut mis à jour");
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error?.message || "Impossible de changer le statut"}`);
    }
  });

  // ====================
  // AI ARTICLE GENERATOR
  // ====================
  const generateArticleWithAI = async () => {
    const rawInput = formData.content_fr.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!rawInput) {
      toast.error("Écrivez une idée ou un texte brut dans le champ contenu");
      return;
    }

    setGeneratingAI(true);
    setShowGeneratePopup(false);

    try {
      // Step 1: Generate article
      setGenerationStep("Rédaction de l'article par l'IA...");
      const { data: articleData, error: articleError } = await supabase.functions.invoke('generate-article', {
        body: { rawInput, mediaOption: selectedMediaOption }
      });

      if (articleError) throw articleError;
      if (!articleData || !articleData.title) throw new Error("Réponse IA invalide");

      const htmlContent = markdownToHtml(articleData.content || "");
      const hashtagLine = articleData.hashtags?.length
        ? `\n\n<hr class="my-6 border-border">\n<p class="mb-4 leading-relaxed">${articleData.hashtags.map((h: string) => `<strong>#${h.replace(/^#/, '')}</strong>`).join(' ')}</p>`
        : '';

      setFormData(prev => ({
        ...prev,
        title_fr: articleData.title || prev.title_fr,
        content_fr: htmlContent + hashtagLine,
        excerpt_fr: articleData.excerpt || prev.excerpt_fr,
        category: articleData.category || prev.category,
        slug: articleData.slug || prev.slug,
        is_published: true,
        is_featured: true,
      }));

      toast.success("Article généré avec succès !");

      // Step 2: Generate images if needed
      const imagePrompts: string[] = articleData.imagePrompts || [];
      if (imagePrompts.length > 0 && selectedMediaOption !== "text-only") {
        setGenerationStep("Génération des images IA...");
        for (let i = 0; i < imagePrompts.length; i++) {
          setGenerationStep(`Image ${i + 1}/${imagePrompts.length}...`);
          try {
            const { data: imgData, error: imgError } = await supabase.functions.invoke('generate-article-image', {
              body: { prompt: imagePrompts[i], quality: "high" }
            });
            if (!imgError && imgData?.url) {
              setFormData(prev => ({
                ...prev,
                images: [...prev.images, imgData.url],
                featured_image: prev.featured_image || imgData.url,
              }));
            }
          } catch (imgErr) {
            console.error(`Image ${i + 1} generation failed:`, imgErr);
          }
        }
        toast.success(`${imagePrompts.length} image(s) générée(s) !`);
      }

      // Step 3: Generate video cover if needed
      if (articleData.videoPrompt && (selectedMediaOption === "with-video" || selectedMediaOption === "with-both")) {
        setGenerationStep("Génération de la couverture vidéo...");
        try {
          const { data: vidData, error: vidError } = await supabase.functions.invoke('generate-article-image', {
            body: { prompt: `Cinematic still frame: ${articleData.videoPrompt}. Professional documentary, Ivory Coast.`, quality: "high" }
          });
          if (!vidError && vidData?.url) {
            setFormData(prev => ({ ...prev, images: [...prev.images, vidData.url] }));
          }
        } catch (vidErr) {
          console.error("Video cover generation failed:", vidErr);
        }
      }

      // Step 4: Auto-translate
      setGenerationStep("Traduction automatique en 5 langues...");
      setTranslating(true);
      const langs = [
        { code: 'en', name: 'Anglais' },
        { code: 'ar', name: 'Arabe' },
        { code: 'es', name: 'Espagnol' },
        { code: 'de', name: 'Allemand' },
        { code: 'zh', name: 'Chinois' },
      ];
      const plainForTranslation = (articleData.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

      for (const lang of langs) {
        setGenerationStep(`Traduction ${lang.name}...`);
        setTranslationProgress(`${lang.name}...`);
        try {
          const { data: trData, error: trError } = await supabase.functions.invoke('translate-article', {
            body: {
              title: articleData.title,
              content: plainForTranslation.slice(0, 4000),
              excerpt: articleData.excerpt || '',
              targetLanguage: lang.code,
            }
          });
          if (!trError && trData) {
            setFormData(prev => ({
              ...prev,
              [`title_${lang.code}`]: trData.title || '',
              [`content_${lang.code}`]: trData.content ? markdownToHtml(trData.content) : '',
              [`excerpt_${lang.code}`]: trData.excerpt || '',
            }));
          }
        } catch (trErr) {
          console.error(`Translation ${lang.code} failed:`, trErr);
        }
      }
      setTranslating(false);
      setTranslationProgress("");
      toast.success("Article complet : rédigé, illustré et traduit en 5 langues !");
    } catch (error: any) {
      console.error('AI generation error:', error);
      toast.error(error?.message || "Erreur lors de la génération IA");
    } finally {
      setGeneratingAI(false);
      setGenerationStep("");
    }
  };

  // Manual translate
  const translateToAllLanguages = async () => {
    if (!formData.title_fr || !formData.content_fr) {
      toast.error("L'article en français est requis");
      return;
    }
    setTranslating(true);
    const langs = [
      { code: 'en', name: 'Anglais' }, { code: 'ar', name: 'Arabe' },
      { code: 'es', name: 'Espagnol' }, { code: 'de', name: 'Allemand' }, { code: 'zh', name: 'Chinois' },
    ];
    const plainContent = formData.content_fr.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    for (const lang of langs) {
      setTranslationProgress(`${lang.name}...`);
      try {
        const { data, error } = await supabase.functions.invoke('translate-article', {
          body: { title: formData.title_fr, content: plainContent.slice(0, 4000), excerpt: formData.excerpt_fr || "", targetLanguage: lang.code }
        });
        if (!error && data) {
          setFormData(prev => ({
            ...prev,
            [`title_${lang.code}`]: data.title || '',
            [`content_${lang.code}`]: data.content ? markdownToHtml(data.content) : '',
            [`excerpt_${lang.code}`]: data.excerpt || '',
          }));
        }
      } catch (err) {
        console.error(`Translation ${lang.code}:`, err);
      }
    }
    setTranslating(false);
    setTranslationProgress("");
    toast.success("Traduction terminée !");
  };

  // AI Image Generation
  const generateAIImage = async () => {
    if (!imagePrompt.trim()) { toast.error("Décrivez l'image"); return; }
    setGeneratingImage(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-article-image', {
        body: { prompt: imagePrompt, quality: "high" }
      });
      if (error) throw error;
      if (data?.url) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, data.url],
          featured_image: prev.featured_image || data.url,
        }));
        setImagePrompt("");
        toast.success("Image IA générée !");
      }
    } catch (error: any) {
      toast.error(error?.message || "Erreur génération image");
    } finally {
      setGeneratingImage(false);
    }
  };

  const resetForm = () => {
    setFormData({
      slug: "", title_fr: "", title_en: "", title_ar: "", title_es: "", title_de: "", title_zh: "",
      content_fr: "", content_en: "", content_ar: "", content_es: "", content_de: "", content_zh: "",
      excerpt_fr: "", excerpt_en: "", excerpt_ar: "", excerpt_es: "", excerpt_de: "", excerpt_zh: "",
      featured_image: "", images: [], videos: [],
      category: "general", is_published: false, is_featured: false, author: "AgriCapital"
    });
    setEditingArticle(null);
  };

  const handleEdit = (article: NewsArticle) => {
    setEditingArticle(article);
    const a = article as any;
    setFormData({
      slug: a.slug, title_fr: a.title_fr, title_en: a.title_en || "", title_ar: a.title_ar || "",
      title_es: a.title_es || "", title_de: a.title_de || "", title_zh: a.title_zh || "",
      content_fr: a.content_fr, content_en: a.content_en || "", content_ar: a.content_ar || "",
      content_es: a.content_es || "", content_de: a.content_de || "", content_zh: a.content_zh || "",
      excerpt_fr: a.excerpt_fr || "", excerpt_en: a.excerpt_en || "", excerpt_ar: a.excerpt_ar || "",
      excerpt_es: a.excerpt_es || "", excerpt_de: a.excerpt_de || "", excerpt_zh: a.excerpt_zh || "",
      featured_image: a.featured_image || "",
      images: Array.isArray(a.images) ? a.images : [],
      videos: Array.isArray(a.videos) ? a.videos : [],
      category: a.category, is_published: a.is_published, is_featured: a.is_featured, author: a.author
    });
    setIsDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadingImages(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 20 * 1024 * 1024) { toast.error(`${file.name} dépasse 20 Mo`); continue; }
        const fileName = `news/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from("media").upload(fileName, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from("media").getPublicUrl(fileName);
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, urlData.publicUrl],
          featured_image: prev.featured_image || urlData.publicUrl
        }));
      }
      toast.success("Images téléchargées");
    } catch (error) {
      toast.error("Erreur upload");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploadingVideos(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 500 * 1024 * 1024) { toast.error(`${file.name} dépasse 500 Mo`); continue; }
        const fileName = `news/videos/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage.from("media").upload(fileName, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from("media").getPublicUrl(fileName);
        setFormData(prev => ({ ...prev, videos: [...prev.videos, urlData.publicUrl] }));
      }
      toast.success("Vidéos téléchargées");
    } catch (error) {
      toast.error("Erreur upload vidéo");
    } finally {
      setUploadingVideos(false);
    }
  };

  return (
    <AdminLayout title="Gestion des Actualités">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">Actualités & Blogs</h2>
            <p className="text-sm text-muted-foreground">Éditeur IA avancé • Génération • Illustration • Traduction automatique</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="bg-agri-green hover:bg-agri-green/90 w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" />Nouvel article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {editingArticle ? "Modifier l'article" : "Éditeur d'article IA"}
                </DialogTitle>
                <DialogDescription>
                  Saisissez une idée ou un texte brut, l'IA génère un article complet, illustré et traduit.
                </DialogDescription>
              </DialogHeader>

              {/* AI Generation Progress Overlay */}
              {generatingAI && (
                <div className="bg-gradient-to-r from-agri-green/10 to-emerald-500/10 border border-agri-green/30 rounded-xl p-6 text-center">
                  <Loader2 className="w-10 h-10 animate-spin text-agri-green mx-auto mb-3" />
                  <p className="font-semibold text-agri-green">{generationStep}</p>
                  <p className="text-xs text-muted-foreground mt-1">Ne fermez pas cette fenêtre</p>
                </div>
              )}

              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="content" className="text-xs sm:text-sm">
                    <Sparkles className="w-3 h-3 mr-1 hidden sm:inline" />Contenu
                  </TabsTrigger>
                  <TabsTrigger value="translations" className="text-xs sm:text-sm">
                    <Languages className="w-3 h-3 mr-1 hidden sm:inline" />Traductions
                  </TabsTrigger>
                  <TabsTrigger value="media" className="text-xs sm:text-sm">
                    <Image className="w-3 h-3 mr-1 hidden sm:inline" />Médias
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="text-xs sm:text-sm">Options</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="space-y-4">
                  {/* AI Generation Section */}
                  <div className="bg-gradient-to-r from-agri-green/10 to-emerald-500/10 rounded-xl p-4 border border-agri-green/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Wand2 className="w-5 h-5 text-agri-green" />
                      <span className="font-semibold text-sm">Moteur éditorial IA</span>
                      <Badge variant="secondary" className="text-[10px]">Gemini 3 Flash</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      Écrivez un simple mot, une phrase ou un paragraphe. L'IA rédige, structure, illustre et traduit automatiquement.
                    </p>
                    <Button
                      type="button"
                      onClick={() => setShowGeneratePopup(true)}
                      disabled={generatingAI || translating || !formData.content_fr.replace(/<[^>]*>/g, '').trim()}
                      className="bg-gradient-to-r from-agri-green to-emerald-600 hover:from-agri-green/90 hover:to-emerald-600/90 w-full sm:w-auto"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Générer l'article complet
                    </Button>
                  </div>

                  {/* Generation Popup */}
                  <Dialog open={showGeneratePopup} onOpenChange={setShowGeneratePopup}>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Wand2 className="w-5 h-5 text-agri-green" />
                          Options de génération
                        </DialogTitle>
                        <DialogDescription>
                          Choisissez le type de médias à générer avec l'article.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-2">
                        {MEDIA_OPTIONS.map((opt) => {
                          const Icon = opt.icon;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setSelectedMediaOption(opt.id)}
                              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left ${
                                selectedMediaOption === opt.id
                                  ? 'border-agri-green bg-agri-green/10 ring-1 ring-agri-green/30'
                                  : 'border-border hover:border-agri-green/50 hover:bg-muted/50'
                              }`}
                            >
                              <Icon className={`w-5 h-5 shrink-0 ${selectedMediaOption === opt.id ? 'text-agri-green' : 'text-muted-foreground'}`} />
                              <div>
                                <p className="font-medium text-sm">{opt.label}</p>
                                <p className="text-xs text-muted-foreground">{opt.desc}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <Button
                        onClick={generateArticleWithAI}
                        className="w-full bg-gradient-to-r from-agri-green to-emerald-600 hover:from-agri-green/90 hover:to-emerald-600/90 mt-2"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Lancer la génération
                      </Button>
                    </DialogContent>
                  </Dialog>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      Titre (Français) *
                      {formData.title_fr && <Badge variant="secondary" className="text-xs">✓</Badge>}
                    </Label>
                    <Input
                      value={formData.title_fr}
                      onChange={(e) => setFormData({ ...formData, title_fr: e.target.value })}
                      placeholder="Sera généré automatiquement par l'IA"
                      className="text-base font-bold uppercase"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Hash className="w-4 h-4" />Extrait / Accroche
                    </Label>
                    <Textarea
                      value={formData.excerpt_fr}
                      onChange={(e) => setFormData({ ...formData, excerpt_fr: e.target.value })}
                      placeholder="Résumé accrocheur (sera généré par l'IA)"
                      rows={2}
                      className="italic"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Contenu / Idée (Français) *</Label>
                    <WYSIWYGEditor
                      content={formData.content_fr}
                      onChange={(content) => setFormData(prev => ({ ...prev, content_fr: content }))}
                      placeholder="Écrivez un mot, une phrase ou un paragraphe. L'IA fait le reste..."
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 Exemples : "Lancement pépinière Daloa", "Forum agricole 2026", "Nouvelle convention signée"
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="translations" className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">Traductions multilingues</h3>
                      <p className="text-xs text-muted-foreground">Auto-générées ou saisies manuellement</p>
                    </div>
                    <Button type="button" variant="outline" size="sm"
                      onClick={translateToAllLanguages}
                      disabled={translating || !formData.title_fr || !formData.content_fr}>
                      {translating ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />{translationProgress}</> : <><Globe className="w-3 h-3 mr-1" />Traduire</>}
                    </Button>
                  </div>
                  {[
                    { code: 'en', label: '🇬🇧 English' },
                    { code: 'ar', label: '🇸🇦 العربية' },
                    { code: 'es', label: '🇪🇸 Español' },
                    { code: 'de', label: '🇩🇪 Deutsch' },
                    { code: 'zh', label: '🇨🇳 中文' },
                  ].map(lang => (
                    <details key={lang.code} className="border rounded-lg">
                      <summary className="p-3 cursor-pointer hover:bg-muted/50 flex items-center justify-between">
                        <span className="font-medium text-sm">{lang.label}</span>
                        {formData[`title_${lang.code}` as keyof typeof formData]
                          ? <Badge variant="secondary" className="text-[10px]">✓ Traduit</Badge>
                          : <Badge variant="outline" className="text-[10px]">Vide</Badge>}
                      </summary>
                      <div className="p-3 space-y-3 border-t">
                        <div className="space-y-1">
                          <Label className="text-xs">Titre</Label>
                          <Input value={formData[`title_${lang.code}` as keyof typeof formData] as string}
                            onChange={(e) => setFormData(prev => ({ ...prev, [`title_${lang.code}`]: e.target.value }))}
                            className="text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Extrait</Label>
                          <Textarea value={formData[`excerpt_${lang.code}` as keyof typeof formData] as string}
                            onChange={(e) => setFormData(prev => ({ ...prev, [`excerpt_${lang.code}`]: e.target.value }))}
                            rows={2} className="text-sm" />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Contenu</Label>
                          <Textarea value={formData[`content_${lang.code}` as keyof typeof formData] as string}
                            onChange={(e) => setFormData(prev => ({ ...prev, [`content_${lang.code}`]: e.target.value }))}
                            rows={6} className="text-sm" />
                        </div>
                      </div>
                    </details>
                  ))}
                </TabsContent>

                <TabsContent value="media" className="space-y-6">
                  {/* AI Image */}
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl p-4 border border-purple-300/30">
                    <div className="flex items-center gap-2 mb-3">
                      <ImagePlus className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-sm">Génération d'image IA</span>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Input value={imagePrompt} onChange={(e) => setImagePrompt(e.target.value)}
                        placeholder="Ex: Pépinière de palmiers à Daloa" className="flex-1 text-sm" />
                      <Button type="button" onClick={generateAIImage}
                        disabled={generatingImage || !imagePrompt.trim()}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shrink-0">
                        {generatingImage ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ImagePlus className="w-4 h-4 mr-2" />}
                        Générer
                      </Button>
                    </div>
                  </div>

                  {/* Upload Images */}
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2"><Image className="w-4 h-4" />Images ({formData.images.length})</Label>
                    <div className="flex items-center gap-4">
                      <Button type="button" variant="outline"
                        onClick={() => document.getElementById("image-upload")?.click()}
                        disabled={uploadingImages}>
                        {uploadingImages ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                        Importer
                      </Button>
                      <input id="image-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                      <span className="text-xs text-muted-foreground">Max 20 Mo</span>
                    </div>
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {formData.images.map((url, index) => (
                          <div key={index} className="relative group aspect-square">
                            <img src={url} alt={`Image ${index + 1}`}
                              className={`w-full h-full object-cover rounded-lg ${formData.featured_image === url ? 'ring-2 ring-primary ring-offset-2' : ''}`} />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-1">
                              <Button size="sm" variant="secondary" className="h-7 w-7 p-0"
                                onClick={() => setFormData({ ...formData, featured_image: url })}>⭐</Button>
                              <Button size="sm" variant="destructive" className="h-7 w-7 p-0"
                                onClick={() => setFormData({
                                  ...formData,
                                  images: formData.images.filter((_, i) => i !== index),
                                  featured_image: formData.featured_image === url ? "" : formData.featured_image
                                })}>✕</Button>
                            </div>
                            {formData.featured_image === url && <Badge className="absolute top-1 left-1 text-[10px]">Principal</Badge>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Upload Videos */}
                  <div className="space-y-4">
                    <Label className="flex items-center gap-2"><Video className="w-4 h-4" />Vidéos ({formData.videos.length})</Label>
                    <div className="flex items-center gap-4">
                      <Button type="button" variant="outline"
                        onClick={() => document.getElementById("video-upload")?.click()}
                        disabled={uploadingVideos}>
                        {uploadingVideos ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                        Importer
                      </Button>
                      <input id="video-upload" type="file" accept="video/*" multiple className="hidden" onChange={handleVideoUpload} />
                      <span className="text-xs text-muted-foreground">Max 500 Mo</span>
                    </div>
                    {formData.videos.length > 0 && (
                      <div className="space-y-2">
                        {formData.videos.map((url, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4 text-muted-foreground" />
                              <span className="truncate text-sm max-w-[200px]">{url.split('/').pop()}</span>
                            </div>
                            <Button size="sm" variant="destructive"
                              onClick={() => setFormData({ ...formData, videos: formData.videos.filter((_, i) => i !== index) })}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Catégorie</Label>
                      <select value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-2 border rounded-md bg-background">
                        <option value="general">Général</option>
                        <option value="actualites">Actualités</option>
                        <option value="evenements">Événements</option>
                        <option value="partenariats">Partenariats</option>
                        <option value="agriculture">Agriculture</option>
                        <option value="formation">Formation</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>Auteur</Label>
                      <Input value={formData.author}
                        onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Slug URL</Label>
                      <Input value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="auto-généré depuis le titre" className="text-sm" />
                    </div>
                  </div>
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">Publier immédiatement</Label>
                        <p className="text-xs text-muted-foreground">Visible sur le site</p>
                      </div>
                      <Switch checked={formData.is_published}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })} />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <Label className="text-sm font-medium">Article à la une</Label>
                        <p className="text-xs text-muted-foreground">Priorité sur la page d'accueil</p>
                      </div>
                      <Switch checked={formData.is_featured}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })} />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button
                  onClick={() => saveMutation.mutate(formData)}
                  disabled={!formData.title_fr || !formData.content_fr || saveMutation.isPending}
                  className="bg-agri-green hover:bg-agri-green/90">
                  {saveMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {editingArticle ? "Mettre à jour" : "Enregistrer"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* News List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-agri-green" />
          </div>
        ) : news && news.length > 0 ? (
          <div className="grid gap-4">
            {news.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    {article.featured_image && (
                      <div className="w-full sm:w-40 h-32 sm:h-auto flex-shrink-0">
                        <img src={article.featured_image} alt={article.title_fr} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 p-4">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg line-clamp-2">{article.title_fr}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {article.excerpt_fr || article.content_fr.replace(/<[^>]*>/g, '').substring(0, 120)}...
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(article.created_at).toLocaleDateString('fr-FR')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />{article.views_count} vues
                            </span>
                            <Badge variant={article.is_published ? "default" : "secondary"} className="text-xs">
                              {article.is_published ? "Publié" : "Brouillon"}
                            </Badge>
                            {article.is_featured && <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">⭐ Une</Badge>}
                            {(article as any).title_en && <Badge variant="outline" className="text-[10px]">🌍 5 langues</Badge>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost"
                            onClick={() => togglePublishMutation.mutate({ id: article.id, is_published: !article.is_published })}>
                            {article.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleEdit(article)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive"
                            onClick={() => {
                              if (confirm("Supprimer définitivement cet article ? Cette action est irréversible.")) {
                                deleteMutation.mutate(article.id);
                              }
                            }}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Aucun article</p>
              <p className="text-sm mt-1">Créez votre premier article avec l'assistant IA</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminNews;
