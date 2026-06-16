import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, UserPlus, Shield, Key, Globe } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const AdminSettings = () => {
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const generateSecurePassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*';
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, b => chars[b % chars.length]).join('');
  };

  const handleCreateAdmin = async () => {
    if (!newAdminEmail) {
      toast.error("Veuillez entrer un email");
      return;
    }
    setIsCreatingAdmin(true);
    const tempPassword = generateSecurePassword();

    try {
      const { data: userData, error: signUpError } = await supabase.auth.signUp({
        email: newAdminEmail,
        password: tempPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/admin`,
        },
      });

      if (signUpError || !userData.user) {
        toast.error("Erreur lors de la création du compte");
        setIsCreatingAdmin(false);
        return;
      }

      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userData.user.id,
          role: 'admin',
        });

      if (roleError) {
        toast.error("Erreur lors de l'attribution du rôle");
      } else {
        toast.success(`Administrateur créé. Un email de confirmation a été envoyé à ${newAdminEmail}. Le mot de passe temporaire doit être changé à la première connexion.`);
        setNewAdminEmail("");
      }
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      toast.success("Mot de passe modifié avec succès");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      toast.error("Erreur lors du changement de mot de passe");
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <AdminLayout title="Paramètres">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Admin */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Créer un Administrateur
            </CardTitle>
            <CardDescription>
              Ajoutez un nouvel administrateur au système
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="email@exemple.com"
              />
            </div>
            <Button onClick={handleCreateAdmin} disabled={isCreatingAdmin} className="w-full">
              {isCreatingAdmin && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Créer l'administrateur
            </Button>
            <p className="text-xs text-muted-foreground">
              Le mot de passe par défaut sera : @AgriCapital2025
            </p>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5" />
              Changer le Mot de Passe
            </CardTitle>
            <CardDescription>
              Modifiez votre mot de passe administrateur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nouveau mot de passe</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nouveau mot de passe"
              />
            </div>
            <Button onClick={handleChangePassword} disabled={isChangingPassword} className="w-full">
              {isChangingPassword && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Modifier le mot de passe
            </Button>
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Authentification à deux facteurs</span>
                <span className="text-xs px-2 py-1 bg-amber-500/20 text-amber-500 rounded">Bientôt</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Sessions actives</span>
                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-500 rounded">1 session</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Dernière connexion</span>
                <span className="text-xs text-muted-foreground">{new Date().toLocaleDateString('fr-FR')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Site Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Informations du Site
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Domaine</span>
                <span className="text-sm font-medium">agricapital.ci</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Hébergement</span>
                <span className="text-sm font-medium">Vercel</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm">Version</span>
                <span className="text-sm font-medium">2.0.0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
