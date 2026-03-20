import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_KEY = "pwa-install-dismissed";

function isStandaloneMode() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export default function PwaInstallPrompt() {
  const [open, setOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandaloneMode()) return;
    if (localStorage.getItem(DISMISS_KEY) === "true") return;

    const onBeforeInstallPrompt = (event: Event) => {
      const installEvent = event as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      setDeferredPrompt(installEvent);
      setOpen(true);
    };

    const onInstalled = () => setOpen(false);

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    const showFallback = window.setTimeout(() => {
      if (!isStandaloneMode()) setOpen(true);
    }, 2500);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      window.clearTimeout(showFallback);
    };
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "true");
    setOpen(false);
  };

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setOpen(false);
  };

  if (!open || isStandaloneMode()) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-card-hover animate-fade-in">
        <div className="mb-3 flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-foreground">Installer l'application</p>
            <p className="text-sm text-muted-foreground">
              Ajoutez La Joie Pressing à votre écran d'accueil pour un accès rapide et hors ligne.
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={dismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {deferredPrompt ? (
          <Button className="w-full" onClick={handleInstall}>
            <Download className="mr-2 h-4 w-4" />
            Installer maintenant
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
              Sur iPhone: appuyez sur <strong>Partager</strong> puis <strong>Sur l'écran d'accueil</strong>.
            </p>
            <Button className="w-full" onClick={dismiss}>J'ai compris</Button>
          </div>
        )}
      </div>
    </div>
  );
}