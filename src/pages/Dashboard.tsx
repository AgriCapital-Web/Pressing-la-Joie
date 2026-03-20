import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, LogOut, Users } from "lucide-react";
import { formatPrice } from "@/lib/constants";
import NewOrderDialog from "@/components/NewOrderDialog";
import OrderCard from "@/components/OrderCard";
import ThemeToggle from "@/components/ThemeToggle";
import logoImg from "@/assets/logo-lajoie.png";

interface Order {
  id: number;
  ticket_number: string;
  customer_name: string;
  customer_phone: string;
  items: Array<{ name: string; qty: number; price: number }>;
  total: number;
  status: string;
  is_paid: boolean;
  notes: string;
  created_at: string;
}

const STATUS_FILTERS = [
  { value: "all", label: "Tous" },
  { value: "pending", label: "En cours" },
  { value: "ready", label: "Prêt" },
  { value: "collected", label: "Retiré" },
];

export default function Dashboard() {
  const { user, role, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNewOrder, setShowNewOrder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [todayTotal, setTodayTotal] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  const fetchOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) {
      setOrders(data as unknown as Order[]);
      const today = new Date().toDateString();
      const todayPaid = (data as unknown as Order[]).filter(
        (o) => o.is_paid && new Date(o.created_at).toDateString() === today
      );
      setTodayTotal(todayPaid.reduce((sum, o) => sum + Number(o.total), 0));
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  useEffect(() => {
    const channel = supabase
      .channel("orders-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        fetchOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_phone.includes(search);
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const readyCount = orders.filter((o) => o.status === "ready").length;
  const todayOrders = orders.filter((o) => new Date(o.created_at).toDateString() === new Date().toDateString()).length;

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
            <img src={logoImg} alt="La Joie Pressing" className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20" />
            <div>
              <h1 className="text-lg font-bold text-foreground">La Joie Pressing</h1>
              <p className="text-xs text-muted-foreground">
              {role === "admin" ? "Super Admin" : "Gérant"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {role === "admin" && (
              <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                <Users className="mr-1 h-4 w-4" />
                Admin
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="mr-1 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6">
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          <div className="rounded-lg bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">En cours</p>
            <p className="text-2xl font-bold tabular-nums text-foreground">{pendingCount}</p>
          </div>
          <div className="rounded-lg bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Prêts à retirer</p>
            <p className="text-2xl font-bold tabular-nums text-primary">{readyCount}</p>
          </div>
          <div className="rounded-lg bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Commandes du jour</p>
            <p className="text-2xl font-bold tabular-nums text-foreground">{todayOrders}</p>
          </div>
          <div className="rounded-lg bg-card p-4 shadow-card">
            <p className="text-sm text-muted-foreground">Caisse du jour</p>
            <p className="text-2xl font-bold tabular-nums text-success">{formatPrice(todayTotal)}</p>
          </div>
        </div>

        <div className="mb-4 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par nom ou téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => setShowNewOrder(true)} className="hidden sm:flex">
            <Plus className="mr-1 h-4 w-4" />
            Nouvelle entrée
          </Button>
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((f) => (
            <Button
              key={f.value}
              variant={statusFilter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(f.value)}
              className="shrink-0"
            >
              {f.label}
              {f.value !== "all" && (
                <span className="ml-1.5 tabular-nums">
                  ({orders.filter((o) => o.status === f.value).length})
                </span>
              )}
            </Button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-lg bg-card p-12 text-center shadow-card">
            <p className="text-muted-foreground">Aucune commande trouvée</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} onUpdate={fetchOrders} />
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setShowNewOrder(true)}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 sm:hidden"
      >
        <Plus className="h-6 w-6" />
      </button>

      <NewOrderDialog open={showNewOrder} onClose={() => setShowNewOrder(false)} onCreated={fetchOrders} />
    </div>
  );
}
