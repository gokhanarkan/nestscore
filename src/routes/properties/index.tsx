import { createFileRoute, Link } from "@tanstack/react-router";
import { useProperties } from "@/hooks/use-properties";
import { useSettings } from "@/hooks/use-settings";
import { calculatePropertyScore } from "@/lib/scoring";
import { ScoreGauge } from "@/components/scoring/score-gauge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useMemo } from "react";

export const Route = createFileRoute("/properties/")({
  component: PropertiesPage,
});

function PropertiesPage() {
  const properties = useProperties();
  const settings = useSettings();
  const [search, setSearch] = useState("");

  const filteredProperties = useMemo(() => {
    if (!search.trim()) return properties;
    const query = search.toLowerCase();
    return properties.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.postcode.toLowerCase().includes(query) ||
        p.address.toLowerCase().includes(query)
    );
  }, [properties, search]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Properties</h1>
        <p className="text-sm text-muted-foreground">
          {properties.length} {properties.length === 1 ? "property" : "properties"} saved
        </p>
      </header>

      {properties.length > 0 && (
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      )}

      {filteredProperties.length > 0 ? (
        <div className="space-y-3">
          {filteredProperties.map((property) => {
            const score = calculatePropertyScore(property, settings.weights);
            return (
              <Link
                key={property.id}
                to="/properties/$id"
                params={{ id: String(property.id) }}
                className="block"
              >
                <Card className="transition-all hover:shadow-md hover:border-primary/20 active:scale-[0.99]">
                  <CardContent className="flex items-center gap-4 p-4">
                    <ScoreGauge score={score.overallScore} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{property.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {property.address || property.postcode}
                      </p>
                      {property.price > 0 && (
                        <p className="text-sm font-medium text-primary">
                          £{property.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : properties.length > 0 ? (
        <p className="py-8 text-center text-muted-foreground">
          No properties match your search
        </p>
      ) : (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">
            No properties yet. Click the + button to add your first property.
          </p>
        </div>
      )}
    </div>
  );
}
