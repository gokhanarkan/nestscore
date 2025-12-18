import { createFileRoute, Link } from "@tanstack/react-router";
import { useProperties } from "@/hooks/use-properties";
import { useSettings } from "@/hooks/use-settings";
import { calculatePropertyScore, getScoreColor } from "@/lib/scoring";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { DivIcon } from "leaflet";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreGauge } from "@/components/scoring/score-gauge";
import { useMemo } from "react";
import "leaflet/dist/leaflet.css";

export const Route = createFileRoute("/map")({
  component: MapPage,
});

const LONDON_CENTER = { lat: 51.509865, lng: -0.118092 };

function createScoreIcon(score: number): DivIcon {
  const color = getScoreColor(score);
  return new DivIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: ${color};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 12px;
      ">${score}</div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

const workIcon = new DivIcon({
  className: "work-marker",
  html: `
    <div style="
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #1d1d1f;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
    ">W</div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

function MapPage() {
  const properties = useProperties();
  const settings = useSettings();

  const propertiesWithCoords = useMemo(() => {
    return properties
      .filter((p) => p.coordinates)
      .map((p) => ({
        property: p,
        score: calculatePropertyScore(p, settings.weights),
      }));
  }, [properties, settings.weights]);

  const mapCenter = useMemo(() => {
    if (propertiesWithCoords.length > 0) {
      const coords = propertiesWithCoords[0].property.coordinates!;
      return { lat: coords.lat, lng: coords.lng };
    }
    if (settings.workCoordinates) {
      return settings.workCoordinates;
    }
    return LONDON_CENTER;
  }, [propertiesWithCoords, settings.workCoordinates]);

  if (properties.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-semibold">Map View</h1>
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">
            Add properties with valid postcodes to see them on the map.
          </p>
        </div>
      </div>
    );
  }

  if (propertiesWithCoords.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-semibold">Map View</h1>
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">
            None of your properties have valid coordinates. Try adding properties with UK postcodes.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-5rem)] md:h-screen">
      <MapContainer
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={12}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Work location marker and radius */}
        {settings.workCoordinates && (
          <>
            <Marker
              position={[settings.workCoordinates.lat, settings.workCoordinates.lng]}
              icon={workIcon}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-medium">Work Location</p>
                  <p className="text-sm text-muted-foreground">{settings.workPostcode}</p>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[settings.workCoordinates.lat, settings.workCoordinates.lng]}
              radius={5000}
              pathOptions={{
                color: "#007aff",
                fillColor: "#007aff",
                fillOpacity: 0.1,
                weight: 1,
              }}
            />
          </>
        )}

        {/* Property markers */}
        {propertiesWithCoords.map(({ property, score }) => (
          <Marker
            key={property.id}
            position={[property.coordinates!.lat, property.coordinates!.lng]}
            icon={createScoreIcon(score.overallScore)}
          >
            <Popup>
              <Link
                to="/properties/$id"
                params={{ id: String(property.id) }}
                className="block min-w-[200px]"
              >
                <Card className="border-0 shadow-none">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3">
                      <ScoreGauge score={score.overallScore} size="sm" />
                      <div>
                        <p className="font-medium">{property.name}</p>
                        <p className="text-sm text-muted-foreground">{property.postcode}</p>
                        {property.price > 0 && (
                          <p className="text-sm font-medium text-primary">
                            £{property.price.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
