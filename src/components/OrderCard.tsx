import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_LABELS, formatPrice } from "@/lib/constants";
import { ArrowRight, CreditCard, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface OrderItem {
  name: string;
  qty: number;
  price: number;
}

interface Order {
  id: number;
  ticket_number: string;
  customer_name: string;
  customer_phone: string;
  items: OrderItem[];
  total: number;
  status: string;
  is_paid: boolean;
  notes: string;
  created_at: string;
}

function buildWhatsAppMessage(order: Order): string {
  const statusLabel = ORDER_STATUS_LABELS[order.status]?.label || order.status;
  const paymentStatus = order.is_paid ? "✅ *Payé*" : "⏳ *Non payé*";
  const itemsList = (order.items as OrderItem[])
    .map((item) => `  • ${item.qty}× ${item.name} — ${formatPrice(item.qty * item.price)}`)
    .join("\n");

  return `Bonjour *${order.customer_name}* 👋,

Voici une mise à jour de votre commande chez *La Joie Pressing* 🧺

📋 *Détails de la commande :*
${itemsList}

💰 *Total :* *${formatPrice(Number(order.total))}*
📊 *Statut :* ${statusLabel}
💳 *Paiement :* ${paymentStatus}

${order.status === "ready" ? "🎉 Votre commande est *prête* ! Vous pouvez venir la récupérer.\n" : ""}📍 *La Joie Pressing* — Abidjan
📞 07 59 56 60 87

Merci de votre confiance ! 🙏`;
}

function sendWhatsApp(order: Order) {
  const phone = order.customer_phone.replace(/\s/g, "").replace(/^0/, "225");
  const message = encodeURIComponent(buildWhatsAppMessage(order));
  window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
}

export default function OrderCard({ order, onUpdate }: { order: Order; onUpdate: () => void }) {
  const statusInfo = ORDER_STATUS_LABELS[order.status] || ORDER_STATUS_LABELS.pending;

  const updateStatus = async (newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus as "pending" | "ready" | "collected" })
      .eq("id", order.id);
    if (error) toast.error("Erreur lors de la mise à jour");
    else {
      toast.success(`Commande → ${ORDER_STATUS_LABELS[newStatus].label}`);
      onUpdate();
    }
  };

  const togglePaid = async () => {
    const { error } = await supabase
      .from("orders")
      .update({ is_paid: !order.is_paid })
      .eq("id", order.id);
    if (error) toast.error("Erreur");
    else {
      toast.success(order.is_paid ? "Paiement annulé" : "Paiement enregistré");
      onUpdate();
    }
  };

  const nextStatus = order.status === "pending" ? "ready" : order.status === "ready" ? "collected" : null;

  return (
    <div className="rounded-lg bg-card p-5 shadow-card transition-shadow hover:shadow-card-hover animate-fade-in">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <p className="font-semibold text-foreground">{order.customer_name}</p>
          <p className="text-xs text-muted-foreground">{order.customer_phone}</p>
        </div>
        <Badge variant="secondary" className={statusInfo.color}>
          {statusInfo.label}
        </Badge>
      </div>

      <div className="mb-3 space-y-1 text-sm">
        {(order.items as OrderItem[]).map((item, i) => (
          <div key={i} className="flex justify-between text-muted-foreground">
            <span>{item.qty}× {item.name}</span>
            <span className="tabular-nums">{formatPrice(item.qty * item.price)}</span>
          </div>
        ))}
      </div>

      <div className="mb-3 flex items-center justify-between border-t pt-3">
        <span className="text-sm font-medium text-foreground">Total</span>
        <span className="text-lg font-bold tabular-nums text-foreground">{formatPrice(Number(order.total))}</span>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
        <span>{format(new Date(order.created_at), "dd MMM yyyy HH:mm", { locale: fr })}</span>
        {order.notes && <span className="truncate max-w-[120px]">{order.notes}</span>}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={order.is_paid ? "outline" : "default"}
          size="sm"
          className="flex-1"
          onClick={togglePaid}
        >
          <CreditCard className="mr-1 h-3 w-3" />
          {order.is_paid ? "Payé ✓" : "Encaisser"}
        </Button>
        {nextStatus && (
          <Button variant="outline" size="sm" className="flex-1" onClick={() => updateStatus(nextStatus)}>
            <ArrowRight className="mr-1 h-3 w-3" />
            {ORDER_STATUS_LABELS[nextStatus].label}
          </Button>
        )}
        {order.customer_phone && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => sendWhatsApp(order)}
            className="text-success border-success/30 hover:bg-success/10"
          >
            <MessageCircle className="mr-1 h-3 w-3" />
            WhatsApp
          </Button>
        )}
      </div>
    </div>
  );
}
