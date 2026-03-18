import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SERVICE_PRESETS } from "@/lib/constants";
import { Plus, Minus, X } from "lucide-react";
import { toast } from "sonner";

interface CartItem {
  name: string;
  qty: number;
  price: number;
}

export default function NewOrderDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const { user } = useAuth();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [saving, setSaving] = useState(false);

  const addItem = (preset: { name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.name === preset.name);
      if (existing) {
        return prev.map((i) => (i.name === preset.name ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { name: preset.name, qty: 1, price: preset.price }];
    });
  };

  const updateQty = (name: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => (i.name === name ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  };

  const total = cart.reduce((sum, i) => sum + i.qty * i.price, 0);

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      toast.error("Nom du client requis");
      return;
    }
    if (cart.length === 0) {
      toast.error("Ajoutez au moins un article");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("orders").insert({
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      items: cart,
      total,
      manager_id: user!.id,
    });
    setSaving(false);
    if (error) {
      toast.error("Erreur: " + error.message);
    } else {
      toast.success("Commande créée !");
      setCustomerName("");
      setCustomerPhone("");
      setCart([]);
      onClose();
      onCreated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvelle entrée</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Nom du client *</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Jean Dupont" />
            </div>
            <div>
              <Label>Téléphone</Label>
              <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="+33 6 ..." />
            </div>
          </div>

          {/* Presets */}
          <div>
            <Label className="mb-2 block">Articles</Label>
            <div className="flex flex-wrap gap-2">
              {SERVICE_PRESETS.map((p) => (
                <Button
                  key={p.name}
                  variant="outline"
                  size="sm"
                  onClick={() => addItem(p)}
                  className="text-xs"
                >
                  {p.name} — {p.price.toFixed(2)}€
                </Button>
              ))}
            </div>
          </div>

          {/* Cart */}
          {cart.length > 0 && (
            <div className="rounded-md border divide-y">
              {cart.map((item) => (
                <div key={item.name} className="flex items-center justify-between px-4 py-2">
                  <span className="text-sm font-medium text-foreground">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQty(item.name, -1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm tabular-nums">{item.qty}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQty(item.name, 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                    <span className="ml-2 w-16 text-right text-sm tabular-nums text-muted-foreground">
                      {(item.qty * item.price).toFixed(2)} €
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Total & Submit */}
          <div className="flex items-center justify-between border-t pt-4">
            <span className="text-lg font-bold text-foreground">Total: {total.toFixed(2)} €</span>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving ? "Enregistrement..." : "Enregistrer l'entrée"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
