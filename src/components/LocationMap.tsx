import { useState } from "react";
import { Card } from "@/components/ui/card";
import { MapPin, Navigation, ExternalLink, Map as MapIcon, Satellite } from "lucide-react";
import { Button } from "@/components/ui/button";

// Coordonnées AgriCapital — Daloa, Côte d'Ivoire (géocodées)
const AGRICAPITAL_COORDS = { lat: 6.8770, lng: -6.4502 };
const ADDRESS_LABEL = "AgriCapital — Daloa, Côte d'Ivoire";

const LocationMap = () => {
  const [mapType, setMapType] = useState<"m" | "k">("m"); // m=plan, k=satellite
  const { lat, lng } = AGRICAPITAL_COORDS;

  // Iframe embed sans clé API — fonctionne partout, y compris production Vercel
  const bbox = `${lng - 0.03},${lat - 0.02},${lng + 0.03},${lat + 0.02}`;
  const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  const googleSrc = `https://maps.google.com/maps?q=${lat},${lng}&z=14&t=${mapType}&output=embed`;

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const viewUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return (
    <Card className="overflow-hidden border-border">
      <div className="flex items-center justify-between gap-3 px-4 py-3 bg-card border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground text-sm truncate">Nous localiser</h3>
            <p className="text-xs text-muted-foreground truncate">{ADDRESS_LABEL}</p>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <div className="hidden sm:flex rounded-md border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setMapType("m")}
              className={`px-2 py-1 text-xs flex items-center gap-1 ${mapType === "m" ? "bg-primary text-primary-foreground" : "bg-background"}`}
              aria-label="Vue plan"
            >
              <MapIcon className="w-3.5 h-3.5" /> Plan
            </button>
            <button
              type="button"
              onClick={() => setMapType("k")}
              className={`px-2 py-1 text-xs flex items-center gap-1 ${mapType === "k" ? "bg-primary text-primary-foreground" : "bg-background"}`}
              aria-label="Vue satellite"
            >
              <Satellite className="w-3.5 h-3.5" /> Satellite
            </button>
          </div>
          <Button asChild size="sm" variant="outline">
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
              <Navigation className="w-4 h-4 mr-1" /> Itinéraire
            </a>
          </Button>
          <Button asChild size="sm" variant="ghost" className="hidden sm:inline-flex">
            <a href={viewUrl} target="_blank" rel="noopener noreferrer" aria-label="Ouvrir dans Google Maps">
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>
      </div>
      <div className="relative w-full" style={{ aspectRatio: "16 / 9", minHeight: 320 }}>
        <iframe
          key={mapType}
          title="Carte AgriCapital Daloa"
          src={googleSrc}
          className="absolute inset-0 w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          onError={(e) => {
            // Fallback vers OpenStreetMap si Google refuse
            (e.currentTarget as HTMLIFrameElement).src = osmSrc;
          }}
        />
      </div>
    </Card>
  );
};

export default LocationMap;
