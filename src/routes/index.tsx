import { createFileRoute, Link } from "@tanstack/react-router";
import { useProperties } from "@/hooks/use-properties";
import { useSettings } from "@/hooks/use-settings";
import { calculatePropertyScore, getScoreLabel } from "@/lib/scoring";
import { ScoreGauge } from "@/components/scoring/score-gauge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, Building2, TrendingUp } from "lucide-react";

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

  const recentProperties = properties.slice(0, 4);

  // Calculate stats
  const avgScore =
    properties.length > 0
      ? Math.round(
          properties.reduce((sum, p) => {
            const score = calculatePropertyScore(p, settings.weights);
            return sum + score.overallScore;
          }, 0) / properties.length
        )
      : 0;

  const topProperty =
    properties.length > 0
      ? properties.reduce((top, p) => {
          const score = calculatePropertyScore(p, settings.weights);
          const topScore = calculatePropertyScore(top, settings.weights);
          return score.overallScore > topScore.overallScore ? p : top;
        })
      : null;

  const topScore = topProperty
    ? calculatePropertyScore(topProperty, settings.weights).overallScore
    : 0;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="border-b border-border/50 bg-linear-to-b from-background to-muted/30">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                {getGreeting()}
              </h1>
              <p className="mt-2 text-base text-muted-foreground sm:text-lg">
                {properties.length === 0
                  ? "Start evaluating your first property"
                  : `Tracking ${properties.length} ${properties.length === 1 ? "property" : "properties"}`}
              </p>
            </div>

            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link to="/properties/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          {properties.length > 0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <Card className="border-0 bg-card/60 shadow-sm backdrop-blur-sm">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{properties.length}</p>
                    <p className="text-sm text-muted-foreground">Properties</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-card/60 shadow-sm backdrop-blur-sm">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10">
                    <TrendingUp className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">{avgScore}</p>
                    <p className="text-sm text-muted-foreground">Average Score</p>
                  </div>
                </CardContent>
              </Card>

              {topProperty && (
                <Card className="border-0 bg-card/60 shadow-sm backdrop-blur-sm sm:col-span-2 lg:col-span-1">
                  <CardContent className="flex items-center gap-4 p-5">
                    <ScoreGauge score={topScore} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{topProperty.name}</p>
                      <p className="text-sm text-muted-foreground">Top Rated</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recent Properties */}
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {recentProperties.length > 0 ? (
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold sm:text-2xl">Recent Properties</h2>
              <Link
                to="/properties"
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {recentProperties.map((property) => {
                const score = calculatePropertyScore(property, settings.weights);
                return (
                  <Link
                    key={property.id}
                    to="/properties/$id"
                    params={{ id: String(property.id) }}
                    className="group block"
                  >
                    <Card className="h-full border-0 bg-card shadow-sm transition-all duration-200 hover:shadow-md group-active:scale-[0.98]">
                      <CardContent className="p-5">
                        <div className="mb-4 flex items-start justify-between">
                          <ScoreGauge score={score.overallScore} size="sm" />
                          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                            {getScoreLabel(score.overallScore)}
                          </span>
                        </div>
                        <h3 className="font-medium leading-tight group-hover:text-primary">
                          {property.name}
                        </h3>
                        <p className="mt-1 text-sm text-muted-foreground">{property.postcode}</p>
                        {property.price > 0 && (
                          <p className="mt-3 text-lg font-semibold">
                            £{property.price.toLocaleString()}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
              <Building2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">No properties yet</h2>
            <p className="mt-2 max-w-sm text-muted-foreground">
              Add your first property to start evaluating and comparing homes.
            </p>
            <Button asChild className="mt-6">
              <Link to="/properties/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Property
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
