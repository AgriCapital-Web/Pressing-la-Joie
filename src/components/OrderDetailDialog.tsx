import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS, formatPrice } from "@/lib/constants";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Send, Clock, MessageCircle } from "lucide-react";

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

interface HistoryEntry {
  id: string;
  action: string;
  details: string;
  performer_name: string;
  created_at: string;
}

interface Comment {
  id: string;
  comment: string;
  author_name: string;
  created_at: string;
}

export default function OrderDetailDialog({
  order,
  open,
  onClose,
}: {
  order: Order | null;
  open: boolean;
  onClose: () => void;
}) {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState<"history" | "comments">("comments");

  useEffect(() => {
    if (order && open) {
      fetchHistory();
      fetchComments();
    }
  }, [order, open]);

  const fetchHistory = async () => {
    if (!order) return;
    const { data } = await supabase
      .from("order_history")
      .select("*")
      .eq("order_id", order.id)
      .order("created_at", { ascending: false });
    if (data) setHistory(data as unknown as HistoryEntry[]);
  };

  const fetchComments = async () => {
    if (!order) return;
    const { data } = await supabase
      .from("order_comments")
      .select("*")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true });
    if (data) setComments(data as unknown as Comment[]);
  };

  const sendComment = async () => {
    if (!newComment.trim() || !order || !user) return;
    setSending(true);
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle();

    await supabase.from("order_comments").insert([{
      order_id: order.id,
      comment: newComment.trim(),
      author_id: user.id,
      author_name: profile?.display_name || user.email || "Inconnu",
    }]);
    setNewComment("");
    setSending(false);
    fetchComments();
  };

  if (!order) return null;

  const statusInfo = ORDER_STATUS_LABELS[order.status] || ORDER_STATUS_LABELS.pending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {order.customer_name}
            <Badge variant="secondary" className={statusInfo.color}>{statusInfo.label}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order summary */}
          <div className="rounded-md border p-3 space-y-1 text-sm">
            <p className="text-muted-foreground">{order.customer_phone}</p>
            {(order.items as OrderItem[]).map((item, i) => (
              <div key={i} className="flex justify-between text-foreground">
                <span>{item.qty}× {item.name}</span>
                <span className="tabular-nums">{formatPrice(item.qty * item.price)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{formatPrice(Number(order.total))}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {order.is_paid ? "✅ Payé" : "⏳ Non payé"} • {format(new Date(order.created_at), "dd MMM yyyy HH:mm", { locale: fr })}
            </p>
            {order.notes && <p className="text-xs text-muted-foreground italic">{order.notes}</p>}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setTab("comments")}
              className={`pb-2 px-3 text-sm font-medium transition-colors ${tab === "comments" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
            >
              <MessageCircle className="inline mr-1 h-3.5 w-3.5" />
              Notes ({comments.length})
            </button>
            <button
              onClick={() => setTab("history")}
              className={`pb-2 px-3 text-sm font-medium transition-colors ${tab === "history" ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}
            >
              <Clock className="inline mr-1 h-3.5 w-3.5" />
              Historique ({history.length})
            </button>
          </div>

          {tab === "comments" && (
            <div className="space-y-3">
              <div className="max-h-48 overflow-y-auto space-y-2">
                {comments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">Aucune note pour le moment</p>
                )}
                {comments.map((c) => (
                  <div key={c.id} className="rounded-md bg-muted/50 p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">{c.author_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(c.created_at), "dd/MM HH:mm", { locale: fr })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground">{c.comment}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ajouter une note interne..."
                  onKeyDown={(e) => e.key === "Enter" && sendComment()}
                />
                <Button size="icon" onClick={sendComment} disabled={sending || !newComment.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="max-h-64 overflow-y-auto space-y-2">
              {history.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Aucun historique</p>
              )}
              {history.map((h) => (
                <div key={h.id} className="flex items-start gap-3 rounded-md bg-muted/50 p-2.5">
                  <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{h.action}</p>
                    {h.details && <p className="text-xs text-muted-foreground">{h.details}</p>}
                    <p className="text-xs text-muted-foreground">
                      {h.performer_name} • {format(new Date(h.created_at), "dd/MM HH:mm", { locale: fr })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
