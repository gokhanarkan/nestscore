import { createFileRoute, Link } from "@tanstack/react-router";
import { useProperties } from "@/hooks/use-properties";
import { useSettings } from "@/hooks/use-settings";
import { calculatePropertyScore } from "@/lib/scoring";
import { ScoreGauge } from "@/components/scoring/score-gauge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const properties = useProperties();
  const settings = useSettings();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const recentProperties = properties.slice(0, 3);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{getGreeting()}</h1>
        <p className="mt-1 text-muted-foreground">
          {properties.length === 0
            ? "Start evaluating your first property"
            : `You have ${properties.length} ${properties.length === 1 ? "property" : "properties"} saved`}
        </p>
      </header>

      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        <Link to="/properties/new" className="block">
          <Card className="h-full transition-all hover:shadow-md hover:border-primary/20 active:scale-[0.98]">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium">Add Property</p>
                <p className="text-sm text-muted-foreground">Quick evaluation</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        {properties.length >= 2 && (
          <Link to="/compare" className="block">
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/20 active:scale-[0.98]">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <ArrowRight className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-medium">Compare</p>
                  <p className="text-sm text-muted-foreground">Side by side</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        )}
      </div>

      {recentProperties.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium">Recent Properties</h2>
            <Link
              to="/properties"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {recentProperties.map((property) => {
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
                          {property.postcode}
                          {property.price > 0 && ` · £${property.price.toLocaleString()}`}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {properties.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="mb-4 text-muted-foreground">
            No properties yet. Add your first property to start evaluating.
          </p>
          <Button asChild>
            <Link to="/properties/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Property
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
