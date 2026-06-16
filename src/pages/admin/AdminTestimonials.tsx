import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, X, Trash2, Loader2, Edit, Upload, Save, User } from "lucide-react";
import { toast } from "sonner";

interface Testimonial {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  testimonial: string;
  photo_url: string | null;
  approved: boolean;
  status: string | null;
  is_agricapital_subscriber: boolean | null;
  created_at: string;
}

const statusOptions = [
  { value: "planteur", label: "Planteur" },
  { value: "partenaire", label: "Partenaire" },
  { value: "investisseur", label: "Investisseur" },
  { value: "institution", label: "Institution / ONG" },
  { value: "proprietaire", label: "Propriétaire terrien" },
  { value: "other", label: "Autre" },
];

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTestimonials(data);
    }
    setIsLoading(false);
  };

  const handleApprove = async (id: string, approve: boolean) => {
    const { error } = await supabase
      .from('testimonials')
      .update({ approved: approve })
      .eq('id', id);

    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      toast.success(approve ? "Témoignage approuvé" : "Témoignage rejeté");
      fetchTestimonials();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce témoignage ?")) return;

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Erreur lors de la suppression");
    } else {
      toast.success("Témoignage supprimé");
      fetchTestimonials();
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial({ ...testimonial });
    setPhotoPreview(testimonial.photo_url);
    setPhotoFile(null);
    setIsEditing(true);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("La photo doit faire moins de 5MB");
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

  const handleSaveEdit = async () => {
    if (!editingTestimonial) return;
    
    setIsSaving(true);
    try {
      let photoUrl = editingTestimonial.photo_url;

      // Upload new photo if selected
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
          setIsSaving(false);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('testimonial-photos')
          .getPublicUrl(fileName);
        
        photoUrl = publicUrl;
      }

      const { error } = await supabase
        .from('testimonials')
        .update({
          first_name: editingTestimonial.first_name,
          last_name: editingTestimonial.last_name,
          email: editingTestimonial.email,
          testimonial: editingTestimonial.testimonial,
          status: editingTestimonial.status,
          is_agricapital_subscriber: editingTestimonial.is_agricapital_subscriber,
          photo_url: photoUrl,
        })
        .eq('id', editingTestimonial.id);

      if (error) {
        toast.error("Erreur lors de la sauvegarde");
      } else {
        toast.success("Témoignage modifié avec succès");
        setIsEditing(false);
        setEditingTestimonial(null);
        fetchTestimonials();
      }
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredTestimonials = testimonials.filter(t => {
    if (filter === 'pending') return !t.approved;
    if (filter === 'approved') return t.approved;
    return true;
  });

  const getStatusLabel = (status: string | null) => {
    const option = statusOptions.find(opt => opt.value === status);
    return option ? option.label : status || "Non spécifié";
  };

  return (
    <AdminLayout title="Gestion des Témoignages">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer" onClick={() => setFilter('all')}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{testimonials.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer" onClick={() => setFilter('pending')}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-amber-500">{testimonials.filter(t => !t.approved).length}</p>
              <p className="text-sm text-muted-foreground">En attente</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer" onClick={() => setFilter('approved')}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-green-500">{testimonials.filter(t => t.approved).length}</p>
              <p className="text-sm text-muted-foreground">Approuvés</p>
            </CardContent>
          </Card>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>Tous</Button>
          <Button variant={filter === 'pending' ? 'default' : 'outline'} onClick={() => setFilter('pending')}>En attente</Button>
          <Button variant={filter === 'approved' ? 'default' : 'outline'} onClick={() => setFilter('approved')}>Approuvés</Button>
        </div>

        {/* Testimonials list */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Aucun témoignage</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredTestimonials.map((testimonial) => (
              <Card key={testimonial.id} className={`${!testimonial.approved ? 'border-l-4 border-l-amber-500' : 'border-l-4 border-l-green-500'}`}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    {testimonial.photo_url ? (
                      <img
                        src={testimonial.photo_url}
                        alt={`${testimonial.first_name} ${testimonial.last_name}`}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover mx-auto md:mx-0"
                      />
                    ) : (
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-muted flex items-center justify-center mx-auto md:mx-0">
                        <User className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2">
                        <div className="text-center md:text-left">
                          <h3 className="font-bold text-foreground">
                            {testimonial.first_name} {testimonial.last_name}
                          </h3>
                          {testimonial.email && (
                            <p className="text-sm text-muted-foreground">{testimonial.email}</p>
                          )}
                          <p className="text-sm text-primary">{getStatusLabel(testimonial.status)}</p>
                          {testimonial.is_agricapital_subscriber && (
                            <p className="text-xs text-green-600">✓ Souscripteur AgriCapital</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {new Date(testimonial.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs self-center md:self-start ${testimonial.approved ? 'bg-green-500/20 text-green-500' : 'bg-amber-500/20 text-amber-500'}`}>
                          {testimonial.approved ? 'Approuvé' : 'En attente'}
                        </span>
                      </div>
                      <p className="text-foreground text-sm md:text-base">{testimonial.testimonial}</p>
                      <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(testimonial)} className="gap-1">
                          <Edit className="w-3 h-3" /> Modifier
                        </Button>
                        {!testimonial.approved && (
                          <Button size="sm" onClick={() => handleApprove(testimonial.id, true)} className="gap-1">
                            <Check className="w-3 h-3" /> Approuver
                          </Button>
                        )}
                        {testimonial.approved && (
                          <Button size="sm" variant="outline" onClick={() => handleApprove(testimonial.id, false)} className="gap-1">
                            <X className="w-3 h-3" /> Rejeter
                          </Button>
                        )}
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(testimonial.id)} className="gap-1">
                          <Trash2 className="w-3 h-3" /> Supprimer
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifier le témoignage</DialogTitle>
            </DialogHeader>
            {editingTestimonial && (
              <div className="space-y-4">
                {/* Photo */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Photo</label>
                  <div className="flex items-center gap-4">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Changer la photo
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Prénom</label>
                    <Input
                      value={editingTestimonial.first_name}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom</label>
                    <Input
                      value={editingTestimonial.last_name}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, last_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={editingTestimonial.email || ""}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Statut</label>
                  <Select
                    value={editingTestimonial.status || "other"}
                    onValueChange={(value) => setEditingTestimonial({ ...editingTestimonial, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Témoignage</label>
                  <Textarea
                    value={editingTestimonial.testimonial}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, testimonial: e.target.value })}
                    rows={5}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingTestimonial.is_agricapital_subscriber || false}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, is_agricapital_subscriber: e.target.checked })}
                    id="subscriber"
                  />
                  <label htmlFor="subscriber" className="text-sm">Souscripteur AgriCapital</label>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>Annuler</Button>
                  <Button onClick={handleSaveEdit} disabled={isSaving}>
                    {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Sauvegarder
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminTestimonials;
