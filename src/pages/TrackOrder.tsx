import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { Search, ArrowLeft } from "lucide-react";
import logoImg from "@/assets/logo-lajoie.jpeg";

export default function TrackOrder() {
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setNotFound(false);
    const { data } = await supabase
      .from("orders")
      .select("ticket_number, customer_name, status, is_paid, total, items, created_at")
      .or(`ticket_number.eq.${query.trim()},customer_phone.eq.${query.trim()}`)
      .maybeSingle();
    setOrder(data);
    setNotFound(!data);
    setLoading(false);
  };

  const statusInfo = order ? (ORDER_STATUS_LABELS[order.status] || ORDER_STATUS_LABELS.pending) : null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <img src={logoImg} alt="La Joie Pressing" className="mx-auto mb-4 h-16 w-16 rounded-full object-cover" />
          <h1 className="text-xl font-bold text-foreground">Suivre ma commande</h1>
          <p className="text-sm text-muted-foreground">Entrez votre numéro de ticket ou téléphone</p>
        </div>

        <form onSubmit={handleSearch} className="mb-6 flex gap-2">
          <Input
            placeholder="TK-00001 ou numéro de téléphone"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button type="submit" disabled={loading}>
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {notFound && (
          <div className="rounded-lg bg-card p-6 text-center shadow-card">
            <p className="text-muted-foreground">Aucune commande trouvée</p>
          </div>
        )}

        {order && statusInfo && (
          <div className="rounded-lg bg-card p-6 shadow-card animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{order.customer_name}</p>
                <p className="text-xs text-muted-foreground">{order.ticket_number}</p>
              </div>
              <Badge variant="secondary" className={statusInfo.color}>
                {statusInfo.label}
              </Badge>
            </div>
            <div className="space-y-1 text-sm">
              {(order.items as Array<{name: string; qty: number; price: number}>).map((item, i) => (
                <div key={i} className="flex justify-between text-muted-foreground">
                  <span>{item.qty}× {item.name}</span>
                  <span className="tabular-nums">{(item.qty * item.price).toFixed(2)} €</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t pt-3">
              <span className="font-medium text-foreground">Total</span>
              <span className="font-bold tabular-nums text-foreground">{Number(order.total).toFixed(2)} €</span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {order.is_paid ? "✓ Payé" : "En attente de paiement"}
            </div>
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
