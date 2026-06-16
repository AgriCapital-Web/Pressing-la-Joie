import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import L from "leaflet";
import { useLanguage } from "@/contexts/LanguageContext";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const IvoryCoastMap = () => {
  const { t } = useLanguage();

  // Coordinates for Daloa
  const daloaPosition: [number, number] = [6.8770, -6.4503];

  // Approximate boundaries of Haut-Sassandra region
  const hautSassandraPolygon: [number, number][] = [
    [7.5, -7.2],
    [7.5, -5.8],
    [6.2, -5.8],
    [6.2, -7.2],
  ];

  return (
    <section id="zone-intervention" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.map.title}
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t.map.subtitle}
          </p>
        </div>

        <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-strong">
          <MapContainer
            // @ts-ignore
            center={daloaPosition}
            zoom={8}
            scrollWheelZoom={false}
            style={{ height: "500px", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              // @ts-ignore
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Highlight Haut-Sassandra region */}
            <Polygon
              positions={hautSassandraPolygon}
              pathOptions={{
                color: "hsl(152, 65%, 25%)",
                fillColor: "hsl(152, 65%, 25%)",
                fillOpacity: 0.2,
                weight: 2,
              }}
            />

            {/* Marker for Daloa */}
            <Marker position={daloaPosition}>
              <Popup>
                <div className="text-center p-2">
                  <strong className="text-lg text-agri-green">Daloa</strong>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t.map.marker}
                  </p>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        <div className="mt-8 text-center">
          <p className="text-muted-foreground">
            {t.map.description}
          </p>
        </div>
      </div>
    </section>
  );
};

export default IvoryCoastMap;
