import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShieldCheck, ShieldOff, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Manager {
  user_id: string;
  display_name: string;
  email: string;
  is_active: boolean;
  role: string;
}

export default function Admin() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  // Stats
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    if (!authLoading && (!user || role !== "admin")) navigate("/dashboard");
  }, [user, role, authLoading, navigate]);

  const fetchData = async () => {
    // Fetch managers with roles
    const { data: profiles } = await supabase.from("profiles").select("*");
    const { data: roles } = await supabase.from("user_roles").select("*");

    if (profiles && roles) {
      const mgrs = profiles.map((p) => ({
        user_id: p.user_id,
        display_name: p.display_name,
        email: p.email || "",
        is_active: p.is_active,
        role: roles.find((r) => r.user_id === p.user_id)?.role || "manager",
      }));
      setManagers(mgrs.filter((m) => m.user_id !== user?.id));
    }

    // Fetch stats
    const { data: orders } = await supabase.from("orders").select("total, is_paid");
    if (orders) {
      setTotalOrders(orders.length);
      setTotalRevenue(orders.filter((o) => o.is_paid).reduce((s, o) => s + Number(o.total), 0));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user && role === "admin") fetchData();
  }, [user, role]);

  const toggleActive = async (managerId: string, currentlyActive: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: !currentlyActive })
      .eq("user_id", managerId);
    if (error) toast.error("Erreur");
    else {
      toast.success(currentlyActive ? "Accès révoqué" : "Accès restauré");
      fetchData();
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b bg-card/80 backdrop-blur-sm">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">Administration</h1>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container py-6">
        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-card p-6 shadow-card">
            <p className="text-sm text-muted-foreground">Total commandes</p>
            <p className="text-3xl font-bold tabular-nums text-foreground">{totalOrders}</p>
          </div>
          <div className="rounded-lg bg-card p-6 shadow-card">
            <p className="text-sm text-muted-foreground">Chiffre d'affaires (payé)</p>
            <p className="text-3xl font-bold tabular-nums text-success">{totalRevenue.toFixed(2)} €</p>
          </div>
        </div>

        {/* Managers */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Gérants</h2>
        </div>

        {managers.length === 0 ? (
          <div className="rounded-lg bg-card p-8 text-center shadow-card">
            <p className="text-muted-foreground">Aucun gérant enregistré</p>
          </div>
        ) : (
          <div className="space-y-3">
            {managers.map((m) => (
              <div key={m.user_id} className="flex items-center justify-between rounded-lg bg-card p-4 shadow-card">
                <div>
                  <p className="font-medium text-foreground">{m.display_name}</p>
                  <p className="text-sm text-muted-foreground">{m.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className={m.is_active ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}>
                    {m.is_active ? "Actif" : "Révoqué"}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleActive(m.user_id, m.is_active)}
                  >
                    {m.is_active ? <ShieldOff className="mr-1 h-3 w-3" /> : <ShieldCheck className="mr-1 h-3 w-3" />}
                    {m.is_active ? "Révoquer" : "Restaurer"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
