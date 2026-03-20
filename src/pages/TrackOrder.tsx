import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS, formatPrice } from "@/lib/constants";
import { isValidIvoryCoastLocalPhone, toIvoryCoastLocalPhone } from "@/lib/phone";
import { Search, ArrowLeft } from "lucide-react";
import logoImg from "@/assets/logo-lajoie.png";

interface OrderResult {
  customer_name: string;
  customer_phone: string;
  status: string;
  is_paid: boolean;
  total: number;
  items: Array<{ name: string; qty: number; price: number }>;
  created_at: string;
}

export default function TrackOrder() {
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<OrderResult[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const formattedPhone = toIvoryCoastLocalPhone(query.trim());
    if (!isValidIvoryCoastLocalPhone(formattedPhone)) {
      setOrders([]);
      setNotFound(true);
      return;
    }

    const phoneVariants = [formattedPhone, formattedPhone.slice(1), `225${formattedPhone.slice(1)}`];

    setLoading(true);
    setNotFound(false);

    // Search by phone - show non-collected orders first
    const { data } = await supabase
      .from("orders")
      .select("customer_name, customer_phone, status, is_paid, total, items, created_at")
      .in("customer_phone", phoneVariants)
      .order("created_at", { ascending: false });

    if (data && data.length > 0) {
      // Show pending/ready orders (non-delivered) first
      const pending = (data as unknown as OrderResult[]).filter((o) => o.status !== "collected");
      const delivered = (data as unknown as OrderResult[]).filter((o) => o.status === "collected");
      setOrders(pending.length > 0 ? pending : delivered.slice(0, 3));
    } else {
      setOrders([]);
      setNotFound(true);
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <img src={logoImg} alt="La Joie Pressing" className="mx-auto mb-4 h-16 w-16 rounded-full object-cover" />
          <h1 className="text-xl font-bold text-foreground">Suivre ma commande</h1>
          <p className="text-sm text-muted-foreground">Entrez votre numéro de téléphone</p>
        </div>

        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <Input
            placeholder="07 XX XX XX XX"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {notFound && (
          <div className="rounded-lg bg-card p-6 text-center shadow-card">
            <p className="text-muted-foreground">Aucune commande trouvée pour ce numéro</p>
          </div>
        )}

        {orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order, idx) => {
              const statusInfo = ORDER_STATUS_LABELS[order.status] || ORDER_STATUS_LABELS.pending;
              return (
                <div key={idx} className="rounded-lg bg-card p-6 shadow-card animate-fade-in">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{order.customer_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                    <Badge variant="secondary" className={statusInfo.color}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    {(order.items as Array<{ name: string; qty: number; price: number }>).map((item, i) => (
                      <div key={i} className="flex justify-between text-muted-foreground">
                        <span>{item.qty}× {item.name}</span>
                        <span className="tabular-nums">{formatPrice(item.qty * item.price)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t pt-3">
                    <span className="font-medium text-foreground">Total</span>
                    <span className="font-bold tabular-nums text-foreground">{formatPrice(Number(order.total))}</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {order.is_paid ? "✓ Payé" : "En attente de paiement"}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-3 w-3" />
            Retour au site
          </Link>
        </div>
      </div>
    </div>
  );
}
