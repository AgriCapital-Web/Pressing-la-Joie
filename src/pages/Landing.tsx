import { useState } from "react";
import { Link } from "react-router-dom";
import { Shirt, Clock, Truck, Shield, Phone, MapPin, ShoppingBag, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SERVICE_PRESETS, formatPrice } from "@/lib/constants";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logoImg from "@/assets/logo-lajoie.jpeg";

const features = [
  { icon: Shirt, title: "Nettoyage Expert", desc: "Soin professionnel pour tous types de vêtements" },
  { icon: Clock, title: "Service Rapide", desc: "Prêt en 24-48h selon le service" },
  { icon: Truck, title: "Collecte à domicile", desc: "On vient chercher et livrer vos vêtements" },
  { icon: Shield, title: "Garantie Qualité", desc: "Satisfaction garantie ou reprise gratuite" },
];

interface CartItem {
  name: string;
  qty: number;
  price: number;
}

export default function Landing() {
  const [showOrder, setShowOrder] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [saving, setSaving] = useState(false);

  const addItem = (preset: { name: string; price: number }) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.name === preset.name);
      if (existing) return prev.map((i) => (i.name === preset.name ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { name: preset.name, qty: 1, price: preset.price }];
    });
  };

  const updateQty = (name: string, delta: number) => {
    setCart((prev) => prev.map((i) => (i.name === name ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0));
  };

  const total = cart.reduce((sum, i) => sum + i.qty * i.price, 0);

  const handleOnlineOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("Nom et téléphone requis");
      return;
    }
    if (cart.length === 0) {
      toast.error("Ajoutez au moins un article");
      return;
    }
    setSaving(true);
    const notes = address.trim() ? `Collecte à domicile: ${address.trim()}` : "Commande en ligne";
    const { error } = await supabase.from("orders").insert([{
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      items: JSON.parse(JSON.stringify(cart)),
      total,
      manager_id: "00000000-0000-0000-0000-000000000000",
      notes,
    }]);
    setSaving(false);
    if (error) {
      toast.error("Erreur, veuillez réessayer");
    } else {
      toast.success("Commande envoyée ! Nous vous contacterons pour la collecte.");
      setCustomerName("");
      setCustomerPhone("");
      setAddress("");
      setCart([]);
      setShowOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="La Joie Pressing" className="h-12 w-12 rounded-full object-cover" />
            <div>
              <h1 className="text-lg font-bold text-foreground">La Joie Pressing</h1>
              <p className="text-xs text-muted-foreground">La propreté, notre métier</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/track">
              <Button variant="outline" size="sm">Suivre ma commande</Button>
            </Link>
            <Button size="sm" onClick={() => setShowOrder(true)}>
              <ShoppingBag className="mr-1 h-4 w-4" />
              Commander
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-20 text-center">
        <div className="container max-w-3xl">
          <img src={logoImg} alt="La Joie Pressing" className="mx-auto mb-8 h-32 w-32 rounded-full object-cover shadow-card" />
          <h2 className="mb-4 text-4xl font-bold text-foreground">
            Votre satisfaction, notre fierté.
          </h2>
          <p className="mb-8 text-lg text-muted-foreground">
            Service de pressing professionnel avec collecte et livraison à domicile à Abidjan.
            Confiez-nous vos vêtements, on s'occupe du reste.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={() => setShowOrder(true)}>
              <ShoppingBag className="mr-2 h-5 w-5" />
              Commander en ligne
            </Button>
            <a href="#tarifs">
              <Button variant="outline" size="lg">Voir les tarifs</Button>
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-card py-16">
        <div className="container">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="rounded-lg bg-background p-6 shadow-card animate-fade-in">
                <f.icon className="mb-3 h-8 w-8 text-primary" />
                <h3 className="mb-1 font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="py-16">
        <div className="container max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-bold text-foreground">Nos Tarifs</h2>
          <div className="rounded-lg bg-card shadow-card overflow-hidden">
            <div className="divide-y">
              {SERVICE_PRESETS.map((s) => (
                <div key={s.name} className="flex items-center justify-between px-6 py-4">
                  <span className="font-medium text-foreground">{s.name}</span>
                  <span className="font-semibold tabular-nums text-primary">
                    {formatPrice(s.price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="border-t bg-card py-16">
        <div className="container max-w-2xl text-center">
          <h2 className="mb-6 text-2xl font-bold text-foreground">Contactez-nous</h2>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>07 59 56 60 87</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Abidjan, Côte d'Ivoire</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} La Joie Pressing. Tous droits réservés.</p>
        <Link to="/login" className="mt-1 inline-block text-xs hover:text-primary">Espace gérant</Link>
      </footer>

      {/* Online Order Modal */}
      {showOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-card p-6 shadow-xl animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground">Commander en ligne</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowOrder(false)}>✕</Button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>Nom complet *</Label>
                  <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Kouamé Jean" />
                </div>
                <div>
                  <Label>Téléphone *</Label>
                  <Input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="07 XX XX XX XX" />
                </div>
              </div>
              <div>
                <Label>Adresse de collecte (optionnel)</Label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Quartier, rue..." />
              </div>

              <div>
                <Label className="mb-2 block">Sélectionnez vos articles</Label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_PRESETS.map((p) => (
                    <Button key={p.name} variant="outline" size="sm" onClick={() => addItem(p)} className="text-xs">
                      {p.name} — {formatPrice(p.price)}
                    </Button>
                  ))}
                </div>
              </div>

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
                        <span className="ml-2 w-24 text-right text-sm tabular-nums text-muted-foreground">
                          {formatPrice(item.qty * item.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-lg font-bold text-foreground">Total: {formatPrice(total)}</span>
                <Button onClick={handleOnlineOrder} disabled={saving}>
                  {saving ? "Envoi..." : "Envoyer la commande"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Nous vous contacterons pour confirmer et organiser la collecte à domicile.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
