import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Globe, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface VisitorLocation {
  country: string;
  city: string;
  count: number;
}

const VisitorMap = () => {
  const [locations, setLocations] = useState<VisitorLocation[]>([]);
  const [totalVisitors, setTotalVisitors] = useState(0);
  const [uniqueCountries, setUniqueCountries] = useState(0);

  useEffect(() => {
    fetchVisitorLocations();
  }, []);

  const fetchVisitorLocations = async () => {
    // Get visitor data with location info
    const { data: visits, count } = await supabase
      .from("page_visits")
      .select("country, city, visitor_id", { count: "exact" });

    if (visits) {
      setTotalVisitors(count || 0);

      // Count visitors by country/city
      const locationCounts: Record<string, VisitorLocation> = {};
      const countries = new Set<string>();

      visits.forEach((visit) => {
        const country = visit.country || "Côte d'Ivoire";
        const city = visit.city || "Non spécifié";
        const key = `${country}-${city}`;
        
        countries.add(country);

        if (!locationCounts[key]) {
          locationCounts[key] = { country, city, count: 0 };
        }
        locationCounts[key].count++;
      });

      setUniqueCountries(countries.size);
      
      const sortedLocations = Object.values(locationCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
      
      setLocations(sortedLocations);
    }
  };

  // Country flag emoji mapping
  const getCountryFlag = (country: string): string => {
    const flags: Record<string, string> = {
      "Côte d'Ivoire": "🇨🇮",
      "France": "🇫🇷",
      "Senegal": "🇸🇳",
      "Mali": "🇲🇱",
      "Burkina Faso": "🇧🇫",
      "Guinea": "🇬🇳",
      "Cameroon": "🇨🇲",
      "Nigeria": "🇳🇬",
      "Ghana": "🇬🇭",
      "Togo": "🇹🇬",
      "Benin": "🇧🇯",
      "Morocco": "🇲🇦",
      "Tunisia": "🇹🇳",
      "Algeria": "🇩🇿",
      "United States": "🇺🇸",
      "Canada": "🇨🇦",
      "Belgium": "🇧🇪",
      "Switzerland": "🇨🇭",
      "Germany": "🇩🇪",
      "United Kingdom": "🇬🇧",
      "China": "🇨🇳",
      "Japan": "🇯🇵",
    };
    return flags[country] || "🌍";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Carte des Visiteurs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{totalVisitors.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total Visiteurs</p>
          </div>
          <div className="bg-green-500/10 rounded-lg p-4 text-center">
            <Globe className="w-6 h-6 mx-auto mb-2 text-green-500" />
            <p className="text-2xl font-bold">{uniqueCountries}</p>
            <p className="text-xs text-muted-foreground">Pays</p>
          </div>
        </div>

        {/* Location List */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Top Localisations</h4>
          {locations.length > 0 ? (
            locations.map((loc, index) => (
              <div
                key={`${loc.country}-${loc.city}`}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getCountryFlag(loc.country)}</span>
                  <div>
                    <p className="font-medium text-sm">{loc.city}</p>
                    <p className="text-xs text-muted-foreground">{loc.country}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div 
                    className="h-2 bg-primary rounded-full" 
                    style={{ 
                      width: `${Math.max(20, (loc.count / (locations[0]?.count || 1)) * 80)}px` 
                    }}
                  />
                  <span className="text-sm font-medium min-w-[40px] text-right">
                    {loc.count}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Aucune donnée de localisation disponible</p>
              <p className="text-xs mt-1">Les données seront collectées automatiquement</p>
            </div>
          )}
        </div>

        {/* Info */}
        {locations.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg text-center">
            <p className="text-sm text-green-700 font-medium">
              ✅ Collecte de géolocalisation active
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Les données sont collectées automatiquement via l'IP des visiteurs
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VisitorMap;
