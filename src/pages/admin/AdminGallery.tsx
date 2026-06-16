import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Image, Loader2, Star, Trash2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface MediaItem {
  id: string;
  name: string;
  url: string;
  alt_text_fr: string | null;
  alt_text_en: string | null;
  type: string;
  category: string | null;
  is_active: boolean;
  created_at: string;
}

const AdminGallery = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('site_media')
      .select('*')
      .in('category', ['gallery', 'gallery-featured'])
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error("Erreur lors du chargement");
      console.error(error);
    } else {
      setMedia(data || []);
    }
    setIsLoading(false);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez choisir une image");
      return;
    }
    setIsUploading(true);
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const fileName = `gallery/${Date.now()}-${safeName}`;
    try {
      const { error: uploadError } = await supabase.storage.from("media").upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from("media").getPublicUrl(fileName);

      const { error } = await supabase.from("site_media").insert({
        name: title || file.name,
        url: data.publicUrl,
        alt_text_fr: comment,
        alt_text_en: comment,
        type: "image",
        category: "gallery",
      });
      if (error) throw error;
      toast.success("Image ajoutée à la galerie");
      setTitle("");
      setComment("");
      fetchMedia();
    } catch (error) {
      toast.error("Erreur lors de l'ajout de l'image");
      console.error(error);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const toggleFeatured = async (item: MediaItem) => {
    const { error } = await supabase
      .from('site_media')
      .update({ category: item.category === 'gallery-featured' ? 'gallery' : 'gallery-featured' })
      .eq('id', item.id);
    if (error) toast.error("Erreur lors de la mise à la une");
    else { toast.success("Galerie mise à jour"); fetchMedia(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce média ?")) return;

    const { error } = await supabase
      .from('site_media')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Média supprimé");
      fetchMedia();
    }
  };

  return (
    <AdminLayout title="Galerie photo">
      <div className="space-y-6">
        <Card>
          <CardContent className="p-5 grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <div><Label>Titre bref</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex. Pépinière de Daloa" /></div>
            <div><Label>Commentaire bref</Label><Textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Une phrase professionnelle pour contextualiser l’image" className="min-h-10" /></div>
            <Button asChild disabled={isUploading} className="gap-2"><label className="cursor-pointer"><Upload className="w-4 h-4" />{isUploading ? "Upload..." : "Ajouter"}<input type="file" accept="image/*" className="hidden" onChange={handleUpload} /></label></Button>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : media.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Image className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Aucun média</p>
              <p className="text-sm text-muted-foreground">Ajoutez vos premières images terrain depuis le bouton Ajouter.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {media.map((item) => (
                <Card key={item.id} className="overflow-hidden group">
                  <div className="aspect-[4/3] relative bg-muted">
                    <img src={item.url} alt={item.alt_text_fr || item.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.svg"; }} />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button size="icon" variant="secondary" onClick={() => toggleFeatured(item)} title="Mettre à la une"><Star className="w-4 h-4" /></Button>
                      <Button size="icon" variant="destructive" onClick={() => handleDelete(item.id)} title="Supprimer"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                  <CardContent className="p-2">
                    <p className="text-xs font-medium truncate">{item.name}</p>
                    {item.alt_text_fr && <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{item.alt_text_fr}</p>}
                    {item.category === 'gallery-featured' && <Badge className="text-[10px] mt-1 bg-accent text-white">À la une</Badge>}
                  </CardContent>
                </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminGallery;