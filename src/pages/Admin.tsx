import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, ShieldCheck, ShieldOff, UserPlus, TrendingUp, Package, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/constants";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { format, subDays, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import ThemeToggle from "@/components/ThemeToggle";

interface Manager {
  user_id: string;
  display_name: string;
  email: string;
  is_active: boolean;
  role: string;
}

interface Order {
  id: number;
  total: number;
  is_paid: boolean;
  status: string;
  created_at: string;
  customer_name: string;
}

const PIE_COLORS = ["hsl(38, 92%, 50%)", "hsl(221, 83%, 53%)", "hsl(142, 71%, 45%)"];

export default function Admin() {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || role !== "admin")) navigate("/dashboard");
  }, [user, role, authLoading, navigate]);

  const fetchData = async () => {
    const [profilesRes, rolesRes, ordersRes] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("user_roles").select("*"),
      supabase.from("orders").select("id, total, is_paid, status, created_at, customer_name"),
    ]);

    if (profilesRes.data && rolesRes.data) {
      const mgrs = profilesRes.data.map((p) => ({
        user_id: p.user_id,
        display_name: p.display_name,
        email: p.email || "",
        is_active: p.is_active,
        role: rolesRes.data!.find((r) => r.user_id === p.user_id)?.role || "manager",
      }));
      setManagers(mgrs.filter((m) => m.user_id !== user?.id));
    }

    if (ordersRes.data) {
      setOrders(ordersRes.data as unknown as Order[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user && role === "admin") fetchData();
  }, [user, role]);

  const totalOrders = orders.length;
  const totalRevenue = orders.filter((o) => o.is_paid).reduce((s, o) => s + Number(o.total), 0);
  const unpaidTotal = orders.filter((o) => !o.is_paid).reduce((s, o) => s + Number(o.total), 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / orders.filter(o => o.is_paid).length || 1) : 0;

  const weeklyData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const day = startOfDay(subDays(new Date(), i));
      const dayStr = day.toDateString();
      const dayOrders = orders.filter(
        (o) => o.is_paid && new Date(o.created_at).toDateString() === dayStr
      );
      const revenue = dayOrders.reduce((s, o) => s + Number(o.total), 0);
      const count = orders.filter((o) => new Date(o.created_at).toDateString() === dayStr).length;
      days.push({
        day: format(day, "EEE dd", { locale: fr }),
        revenue,
        count,
      });
    }
    return days;
  }, [orders]);

  const statusData = useMemo(() => [
    { name: "En cours", value: orders.filter((o) => o.status === "pending").length },
    { name: "Prêt", value: orders.filter((o) => o.status === "ready").length },
    { name: "Retiré", value: orders.filter((o) => o.status === "collected").length },
  ], [orders]);

  const recentOrders = useMemo(() => 
    orders.slice(0, 10).map((o) => ({
      ...o,
      date: format(new Date(o.created_at), "dd/MM HH:mm", { locale: fr }),
    })),
  [orders]);

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

  const handleCreateManager = async () => {
    if (!newEmail || !newPassword || !newName) {
      toast.error("Tous les champs sont requis");
      return;
    }
    setCreating(true);
    try {
      const res = await supabase.functions.invoke("create-manager", {
        body: { email: newEmail, password: newPassword, displayName: newName },
      });
      if (res.error || res.data?.error) {
        toast.error(res.data?.error || "Erreur lors de la création");
      } else {
        toast.success("Gérant créé avec succès !");
        setNewEmail("");
        setNewPassword("");
        setNewName("");
        setShowCreate(false);
        fetchData();
      }
    } catch {
      toast.error("Erreur réseau");
    }
    setCreating(false);
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
          <ThemeToggle />
        </div>
      </header>

      <div className="container py-6">
        {/* KPI Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2"><Package className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Total commandes</p>
                <p className="text-2xl font-bold tabular-nums text-foreground">{totalOrders}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2"><TrendingUp className="h-5 w-5 text-success" /></div>
              <div>
                <p className="text-sm text-muted-foreground">CA (payé)</p>
                <p className="text-2xl font-bold tabular-nums text-success">{formatPrice(totalRevenue)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-warning/10 p-2"><CreditCard className="h-5 w-5 text-warning" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Impayés</p>
                <p className="text-2xl font-bold tabular-nums text-warning">{formatPrice(unpaidTotal)}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent p-2"><TrendingUp className="h-5 w-5 text-foreground" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Panier moyen</p>
                <p className="text-2xl font-bold tabular-nums text-foreground">{formatPrice(avgOrderValue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-lg bg-card p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Chiffre d'affaires hebdomadaire</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => [formatPrice(value), "Recettes"]}
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-lg bg-card p-6 shadow-card">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Répartition des statuts</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent orders table */}
        <div className="mb-8 rounded-lg bg-card shadow-card overflow-hidden">
          <div className="p-6 pb-3">
            <h2 className="text-lg font-semibold text-foreground">Dernières commandes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t bg-muted/50">
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Client</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Date</th>
                  <th className="px-6 py-3 text-left font-medium text-muted-foreground">Statut</th>
                  <th className="px-6 py-3 text-right font-medium text-muted-foreground">Montant</th>
                  <th className="px-6 py-3 text-right font-medium text-muted-foreground">Paiement</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-3 font-medium text-foreground">{o.customer_name}</td>
                    <td className="px-6 py-3 text-muted-foreground">{o.date}</td>
                    <td className="px-6 py-3">
                      <Badge variant="secondary" className={
                        o.status === "pending" ? "bg-warning/10 text-warning" :
                        o.status === "ready" ? "bg-primary/10 text-primary" :
                        "bg-success/10 text-success"
                      }>
                        {o.status === "pending" ? "En cours" : o.status === "ready" ? "Prêt" : "Retiré"}
                      </Badge>
                    </td>
                    <td className="px-6 py-3 text-right tabular-nums font-medium text-foreground">{formatPrice(Number(o.total))}</td>
                    <td className="px-6 py-3 text-right">
                      {o.is_paid ? <span className="text-success">✅</span> : <span className="text-warning">⏳</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Manager management */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Gérants</h2>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <UserPlus className="mr-1 h-4 w-4" />
            Nouveau gérant
          </Button>
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
                  <Button variant="outline" size="sm" onClick={() => toggleActive(m.user_id, m.is_active)}>
                    {m.is_active ? <ShieldOff className="mr-1 h-3 w-3" /> : <ShieldCheck className="mr-1 h-3 w-3" />}
                    {m.is_active ? "Révoquer" : "Restaurer"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Créer un compte gérant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom complet</Label>
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Kouassi Marie" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="gerant@lajoiepressing.ci" />
            </div>
            <div>
              <Label>Mot de passe</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 6 caractères" />
            </div>
            <Button className="w-full" onClick={handleCreateManager} disabled={creating}>
              {creating ? "Création..." : "Créer le gérant"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
