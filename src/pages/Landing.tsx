import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Truck, Shield, Phone, MapPin, ShoppingBag, Plus, Minus, Star, Sparkles, ChevronRight } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SERVICE_PRESETS, formatPrice } from "@/lib/constants";
import { isValidIvoryCoastLocalPhone, toIvoryCoastLocalPhone } from "@/lib/phone";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logoImg from "@/assets/logo-lajoie.png";
import ThemeToggle from "@/components/ThemeToggle";
import PwaInstallPrompt from "@/components/PwaInstallPrompt";

const features = [
  { icon: Sparkles, title: "Nettoyage Expert", desc: "Soin professionnel pour tous types de vêtements et tissus délicats" },
  { icon: Clock, title: "Service Rapide", desc: "Prêt en 24 à 48h selon le type de service demandé" },
  { icon: Truck, title: "Collecte & Livraison", desc: "On vient chercher et livrer vos vêtements à domicile" },
  { icon: Shield, title: "Garantie Qualité", desc: "Satisfaction garantie ou reprise gratuite de votre commande" },
];

const testimonials = [
  { name: "Aminata K.", text: "Excellent service ! Mes rideaux n'ont jamais été aussi propres. Je recommande vivement.", stars: 5 },
  { name: "Moussa D.", text: "Rapide, professionnel et tarifs corrects. La collecte à domicile est un vrai plus.", stars: 5 },
  { name: "Fatou B.", text: "Mon costume est revenu impeccable. Merci La Joie Pressing !", stars: 5 },
];

interface CartItem {
  name: string;
  qty: number;
  price: number;
}

const onlineOrderSchema = z.object({
  customerName: z.string().trim().min(2, "Nom requis").max(120, "Nom trop long"),
  customerPhone: z
    .string()
    .trim()
    .transform(toIvoryCoastLocalPhone)
    .refine((phone) => isValidIvoryCoastLocalPhone(phone), "Numéro ivoirien invalide"),
  address: z.string().trim().max(200, "Adresse trop longue").optional(),
  cart: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(100),
        qty: z.number().int().min(1).max(50),
        price: z.number().min(0),
      }),
    )
    .min(1, "Ajoutez au moins un article"),
});

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
    const parsed = onlineOrderSchema.safeParse({
      customerName,
      customerPhone,
      address,
      cart,
    });

    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Vérifiez le formulaire");
      return;
    }

    const orderTotal = parsed.data.cart.reduce((sum, item) => sum + item.qty * item.price, 0);

    setSaving(true);
    try {
      const notes = parsed.data.address?.trim()
        ? `Collecte à domicile: ${parsed.data.address.trim()}`
        : "Commande en ligne";

      const { error } = await supabase.from("orders").insert([
        {
          customer_name: parsed.data.customerName,
          customer_phone: parsed.data.customerPhone,
          items: JSON.parse(JSON.stringify(parsed.data.cart)),
          total: orderTotal,
          manager_id: null,
          notes,
        } as any,
      ]);

      if (error) {
        toast.error(error.message || "Erreur, veuillez réessayer");
        return;
      }

      toast.success("Commande envoyée ! Nous vous contacterons bientôt.");
      setCustomerName("");
      setCustomerPhone("");
      setAddress("");
      setCart([]);
      setShowOrder(false);
    } catch {
      toast.error("Impossible d'envoyer la commande. Vérifiez la connexion puis réessayez.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b bg-card/90 backdrop-blur-md">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="La Joie Pressing" className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20" />
            <span className="text-lg font-bold text-foreground">La Joie Pressing</span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#services" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Services</a>
            <a href="#tarifs" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Tarifs</a>
            <a href="#avis" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Avis</a>
            <a href="#contact" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Contact</a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
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

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Pressing professionnel à Daloa
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Vos vêtements méritent{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                le meilleur soin
              </span>
            </h1>
            <p className="mb-10 text-lg text-muted-foreground sm:text-xl">
              Service de nettoyage à sec professionnel avec collecte et livraison à domicile.
              Confiez-nous vos vêtements, on s'occupe du reste.
            </p>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" onClick={() => setShowOrder(true)} className="w-full sm:w-auto text-base px-8">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Commander en ligne
              </Button>
              <a href="#tarifs">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base px-8">
                  Voir nos tarifs
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </a>
            </div>
            <div className="mt-10 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                24-48h
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-primary" />
                Livraison gratuite
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-primary" />
                Qualité garantie
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="border-t bg-card/50 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">Pourquoi nous choisir ?</h2>
            <p className="text-muted-foreground">Un service complet pensé pour votre confort</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div key={f.title} className="group rounded-xl bg-background p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
                <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tarifs with images */}
      <section id="tarifs" className="py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">Nos Tarifs</h2>
            <p className="text-muted-foreground">Des prix transparents et accessibles</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SERVICE_PRESETS.map((s) => (
              <div key={s.name} className="group rounded-xl bg-card overflow-hidden shadow-card transition-all hover:shadow-card-hover hover:-translate-y-1">
                <div className="aspect-square bg-muted/30 p-4 flex items-center justify-center">
                  <img src={s.image} alt={s.name} className="h-full w-full object-contain transition-transform group-hover:scale-105" loading="lazy" />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-semibold text-foreground">{s.name}</h3>
                  <p className="mt-1 text-lg font-bold tabular-nums text-primary">{formatPrice(s.price)}</p>
                  <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => { addItem(s); setShowOrder(true); }}>
                    <Plus className="mr-1 h-3 w-3" />
                    Ajouter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avis */}
      <section id="avis" className="border-t bg-card/50 py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold text-foreground">Ce que disent nos clients</h2>
            <p className="text-muted-foreground">La satisfaction de nos clients est notre priorité</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-xl bg-background p-6 shadow-card">
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">"{t.text}"</p>
                <p className="text-sm font-semibold text-foreground">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20">
        <div className="container max-w-2xl text-center">
          <h2 className="mb-3 text-3xl font-bold text-foreground">Contactez-nous</h2>
          <p className="mb-8 text-muted-foreground">Nous sommes à votre disposition</p>
          <div className="flex flex-col items-center gap-4">
            <a href="https://wa.me/2250759566087" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-success/10 px-6 py-3 text-success transition-colors hover:bg-success/20">
              <Phone className="h-5 w-5" />
              <span className="font-semibold">07 59 56 60 87</span>
            </a>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Daloa, Côte d'Ivoire</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-8">
        <div className="container flex flex-col items-center gap-3 text-center">
          <div className="flex items-center gap-2">
            <img src={logoImg} alt="La Joie Pressing" className="h-8 w-8 rounded-full object-cover" />
            <span className="font-semibold text-foreground">La Joie Pressing</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} La Joie Pressing — Daloa. Tous droits réservés.
          </p>
          <Link to="/login" className="text-xs text-muted-foreground transition-colors hover:text-primary">
            Espace gérant
          </Link>
        </div>
      </footer>

      {/* Online Order Modal */}
      {showOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-card p-6 shadow-xl animate-fade-in">
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
                <div className="grid grid-cols-2 gap-2">
                  {SERVICE_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() => addItem(p)}
                      className="flex items-center gap-2 rounded-lg border p-2 text-left transition-colors hover:bg-muted/50"
                    >
                      <img src={p.image} alt={p.name} className="h-10 w-10 rounded object-contain bg-muted/30" />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                        <p className="text-xs tabular-nums text-primary">{formatPrice(p.price)}</p>
                      </div>
                    </button>
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

      <PwaInstallPrompt />
    </div>
  );
}
