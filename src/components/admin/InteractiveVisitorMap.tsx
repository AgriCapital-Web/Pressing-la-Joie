import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Users, MapPin, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom marker icons based on visitor count
const createCustomIcon = (count: number) => {
  const color = count >= 100 ? '#e11d48' : count >= 50 ? '#f97316' : count >= 10 ? '#eab308' : '#22c55e';
  const size = Math.min(20 + Math.log2(count + 1) * 6, 40);
  
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: ${size > 25 ? '10px' : '8px'};
      font-weight: bold;
    ">${count > 9 ? count : ''}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

interface VisitorLocation {
  country: string;
  city: string;
  latitude: number;
  longitude: number;
  count: number;
}

const InteractiveVisitorMap = () => {
  const [locations, setLocations] = useState<VisitorLocation[]>([]);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [uniqueCountries, setUniqueCountries] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    fetchVisitorLocations();
    
    // Real-time subscription for new visits
    const channel = supabase
      .channel('visitor-locations')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'page_visits' },
        () => fetchVisitorLocations()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchVisitorLocations = async () => {
    setIsLoading(true);
    
    const { data: visits, count } = await supabase
      .from("page_visits")
      .select("country, city, latitude, longitude, visitor_id", { count: "exact" });

    if (visits) {
      setTotalVisitors(count || 0);

      const locationCounts: Record<string, VisitorLocation> = {};
      const countries = new Set<string>();

      visits.forEach((visit) => {
        if (visit.latitude && visit.longitude) {
          const country = visit.country || "Unknown";
          const city = visit.city || "Unknown";
          const key = `${visit.latitude.toFixed(2)}-${visit.longitude.toFixed(2)}`;
          
          countries.add(country);

          if (!locationCounts[key]) {
            locationCounts[key] = {
              country,
              city,
              latitude: visit.latitude,
              longitude: visit.longitude,
              count: 0
            };
          }
          locationCounts[key].count++;
        }
      });

      setUniqueCountries(countries.size);
      setLocations(Object.values(locationCounts).sort((a, b) => b.count - a.count));
      setLastUpdate(new Date());
    }
    
    setIsLoading(false);
  };

  // Country flag mapping
  const getCountryFlag = (country: string): string => {
    const flags: Record<string, string> = {
      "Ivory Coast": "🇨🇮", "Côte d'Ivoire": "🇨🇮",
      "France": "🇫🇷", "Senegal": "🇸🇳", "Mali": "🇲🇱",
      "Burkina Faso": "🇧🇫", "Guinea": "🇬🇳", "Cameroon": "🇨🇲",
      "Nigeria": "🇳🇬", "Ghana": "🇬🇭", "Togo": "🇹🇬",
      "Benin": "🇧🇯", "Morocco": "🇲🇦", "Tunisia": "🇹🇳",
      "Algeria": "🇩🇿", "United States": "🇺🇸", "Canada": "🇨🇦",
      "Belgium": "🇧🇪", "Switzerland": "🇨🇭", "Germany": "🇩🇪",
      "United Kingdom": "🇬🇧", "China": "🇨🇳", "Japan": "🇯🇵",
    };
    return flags[country] || "🌍";
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Carte Interactive des Visiteurs
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchVisitorLocations}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
        {lastUpdate && (
          <p className="text-xs text-muted-foreground">
            Dernière mise à jour: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 p-4 border-b bg-muted/30">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xl font-bold">{totalVisitors.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground">Total Visites</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-green-500" />
              <span className="text-xl font-bold">{uniqueCountries}</span>
            </div>
            <p className="text-xs text-muted-foreground">Pays</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span className="text-xl font-bold">{locations.length}</span>
            </div>
            <p className="text-xs text-muted-foreground">Localisations</p>
          </div>
        </div>

        {/* Map */}
        <div className="h-[400px] relative">
          <MapContainer
            // @ts-ignore
            center={[7.539989, -5.547080]}
            zoom={3}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              // @ts-ignore
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {locations.map((loc, index) => (
              <Marker
                key={`${loc.latitude}-${loc.longitude}-${index}`}
                position={[loc.latitude, loc.longitude] as [number, number]}
                // @ts-ignore - icon prop is valid but types are incorrect
                icon={createCustomIcon(loc.count)}
              >
                <Popup>
                  <div className="text-center min-w-[150px]">
                    <div className="text-2xl mb-1">{getCountryFlag(loc.country)}</div>
                    <p className="font-bold">{loc.city}</p>
                    <p className="text-sm text-muted-foreground">{loc.country}</p>
                    <Badge className="mt-2" variant="secondary">
                      {loc.count} visite{loc.count > 1 ? 's' : ''}
                    </Badge>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Top Locations List */}
        <div className="p-4 border-t max-h-[200px] overflow-y-auto">
          <h4 className="text-sm font-medium text-muted-foreground mb-3">Top 10 Localisations</h4>
          <div className="space-y-2">
            {locations.slice(0, 10).map((loc, index) => (
              <div
                key={`list-${index}`}
                className="flex items-center justify-between p-2 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getCountryFlag(loc.country)}</span>
                  <div>
                    <p className="font-medium text-sm">{loc.city}</p>
                    <p className="text-xs text-muted-foreground">{loc.country}</p>
                  </div>
                </div>
                <Badge variant="outline">{loc.count}</Badge>
              </div>
            ))}
            
            {locations.length === 0 && !isLoading && (
              <div className="text-center py-4 text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">En attente de données de géolocalisation...</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Legend */}
        <div className="p-4 border-t bg-muted/30">
          <p className="text-xs font-medium text-muted-foreground mb-2">Légende</p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-xs">1-9</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-xs">10-49</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-xs">50-99</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="text-xs">100+</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveVisitorMap;
