import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useProperties } from "@/hooks/use-properties";
import { useSettings } from "@/hooks/use-settings";
import { calculatePropertyScore, getScoreLabel } from "@/lib/scoring";
import { CATEGORIES } from "@/lib/constants";
import { ScoreGauge } from "@/components/scoring/score-gauge";
import { RadarChart2D } from "@/components/visualization/radar-chart-2d";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, Plus, Trophy, TrendingUp, TrendingDown, Minus, GitCompare } from "lucide-react";

export const Route = createFileRoute("/compare")({
  component: ComparePage,
});

function ComparePage() {
  const properties = useProperties();
  const settings = useSettings();
  const [selected, setSelected] = useState<number[]>([]);

  const scores = useMemo(() => {
    return properties.map((p) => ({
      property: p,
      score: calculatePropertyScore(p, settings.weights),
    }));
  }, [properties, settings.weights]);

  const selectedScores = scores.filter((s) => selected.includes(s.property.id!));

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : prev.length < 4
          ? [...prev, id]
          : prev
    );
  };

  // Find the best property and best category scores
  const bestOverall = selectedScores.length > 0
    ? selectedScores.reduce((best, curr) =>
        curr.score.overallScore > best.score.overallScore ? curr : best
      )
    : null;

  const getBestForCategory = (categoryId: string) => {
    if (selectedScores.length === 0) return null;
    let best = selectedScores[0];
    let bestScore = best.score.categoryScores.find((cs) => cs.categoryId === categoryId)?.score ?? 0;

    for (const item of selectedScores) {
      const score = item.score.categoryScores.find((cs) => cs.categoryId === categoryId)?.score ?? 0;
      if (score > bestScore) {
        best = item;
        bestScore = score;
      }
    }
    return bestScore > 0 ? best.property.id : null;
  };

  if (properties.length < 2) {
    return (
      <div className="min-h-screen bg-linear-to-b from-muted/20 to-background">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:py-16">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
              <GitCompare className="h-10 w-10 text-muted-foreground" />
            </div>
            <h1 className="text-2xl font-semibold">Compare Properties</h1>
            <p className="mt-2 text-muted-foreground">
              Add at least 2 properties to compare them side by side.
            </p>
            <Button asChild className="mt-6">
              <Link to="/properties/new">
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-muted/20 to-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Compare Properties</h1>
          <p className="mt-1 text-muted-foreground">
            Select up to 4 properties to compare
          </p>
        </header>

        {/* Property Selection Pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          {scores.map(({ property, score }) => (
            <button
              key={property.id}
              onClick={() => toggleSelect(property.id!)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all",
                selected.includes(property.id!)
                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                  : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
              )}
            >
              {selected.includes(property.id!) && <Check className="h-3.5 w-3.5" />}
              <span className="max-w-32 truncate sm:max-w-none">{property.name}</span>
              <Badge
                variant={selected.includes(property.id!) ? "outline" : "secondary"}
                className={cn(
                  "ml-1 tabular-nums",
                  selected.includes(property.id!) && "border-primary-foreground/30 text-primary-foreground"
                )}
              >
                {score.overallScore}
              </Badge>
            </button>
          ))}
        </div>

        {selectedScores.length >= 2 ? (
          <div className="space-y-6">
            {/* Property Cards - Horizontal scroll on mobile, grid on desktop */}
            <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
              {selectedScores.map(({ property, score }) => {
                const isBest = bestOverall?.property.id === property.id;
                return (
                  <Card
                    key={property.id}
                    className={cn(
                      "relative min-w-[200px] shrink-0 overflow-hidden border-0 shadow-sm transition-shadow hover:shadow-md sm:min-w-0 sm:shrink",
                      isBest && "ring-2 ring-primary"
                    )}
                  >
                    {isBest && (
                      <div className="absolute right-3 top-3">
                        <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                          <Trophy className="h-3 w-3" />
                          Best
                        </div>
                      </div>
                    )}
                    <CardContent className="flex flex-col items-center p-4 sm:p-6">
                      <ScoreGauge score={score.overallScore} size="md" showLabel />
                      <p className="mt-4 text-center font-semibold">{property.name}</p>
                      <p className="text-sm text-muted-foreground">{property.postcode}</p>
                      {property.price > 0 && (
                        <p className="mt-2 text-lg font-semibold text-primary">
                          £{property.price.toLocaleString()}
                        </p>
                      )}
                      <Badge variant="secondary" className="mt-3">
                        {getScoreLabel(score.overallScore)}
                      </Badge>

                      {/* Mini radar chart */}
                      <div className="mt-4 hidden opacity-80 sm:block">
                        <RadarChart2D scores={score.categoryScores} size={128} showLabels={false} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Category Comparison Table */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="border-b border-border bg-muted/30 px-4 py-3 sm:px-6">
                  <h2 className="font-semibold">Category Breakdown</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-4 py-3 text-left font-medium sm:px-6">Category</th>
                        {selectedScores.map(({ property }) => (
                          <th key={property.id} className="px-4 py-3 text-center font-medium sm:px-6">
                            <span className="hidden sm:inline">{property.name}</span>
                            <span className="sm:hidden">{property.name.slice(0, 10)}...</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {CATEGORIES.filter((c) => c.defaultWeight > 0).map((category) => {
                        const bestId = getBestForCategory(category.id);
                        const categoryScores = selectedScores.map(({ property, score }) => ({
                          propertyId: property.id,
                          score: score.categoryScores.find((cs) => cs.categoryId === category.id)?.score ?? 0,
                        }));

                        return (
                          <tr key={category.id} className="border-b border-border last:border-0">
                            <td className="px-4 py-3 font-medium sm:px-6">
                              <span className="hidden sm:inline">{category.name}</span>
                              <span className="sm:hidden">{category.name.split(" ")[0]}</span>
                            </td>
                            {categoryScores.map((cs, i) => {
                              const isBest = cs.propertyId === bestId && cs.score > 0;
                              const allScores = categoryScores.map((c) => c.score);
                              const maxScore = Math.max(...allScores);
                              const minScore = Math.min(...allScores.filter((s) => s > 0));
                              const isWorst = cs.score === minScore && cs.score < maxScore && cs.score > 0;

                              return (
                                <td
                                  key={i}
                                  className="px-4 py-3 text-center sm:px-6"
                                >
                                  <div className="flex items-center justify-center gap-1.5">
                                    {cs.score > 0 ? (
                                      <>
                                        <span
                                          className={cn(
                                            "tabular-nums",
                                            isBest && "font-semibold text-green-600",
                                            isWorst && "text-muted-foreground"
                                          )}
                                        >
                                          {cs.score}
                                        </span>
                                        {isBest && categoryScores.length > 2 && (
                                          <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                                        )}
                                        {isWorst && categoryScores.length > 2 && (
                                          <TrendingDown className="h-3.5 w-3.5 text-muted-foreground" />
                                        )}
                                      </>
                                    ) : (
                                      <Minus className="h-4 w-4 text-muted-foreground/50" />
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/30 font-medium">
                        <td className="px-4 py-3 sm:px-6">Overall Score</td>
                        {selectedScores.map(({ property, score }) => {
                          const isBest = bestOverall?.property.id === property.id;
                          return (
                            <td
                              key={property.id}
                              className={cn(
                                "px-4 py-3 text-center tabular-nums sm:px-6",
                                isBest && "text-primary"
                              )}
                            >
                              {score.overallScore}
                            </td>
                          );
                        })}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Price Comparison (if applicable) */}
            {selectedScores.some(({ property }) => property.price > 0) && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <h2 className="mb-4 font-semibold">Price Comparison</h2>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {selectedScores.map(({ property, score }) => {
                      const pricePerPoint = property.price > 0 && score.overallScore > 0
                        ? Math.round(property.price / score.overallScore)
                        : 0;
                      const lowestPrice = Math.min(
                        ...selectedScores
                          .filter(({ property: p }) => p.price > 0)
                          .map(({ property: p }) => p.price)
                      );
                      const isCheapest = property.price === lowestPrice && property.price > 0;

                      return (
                        <div key={property.id} className="text-center">
                          <p className="text-sm text-muted-foreground">{property.name}</p>
                          {property.price > 0 ? (
                            <>
                              <p className={cn(
                                "mt-1 text-xl font-semibold",
                                isCheapest && "text-green-600"
                              )}>
                                £{property.price.toLocaleString()}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                £{pricePerPoint.toLocaleString()}/point
                              </p>
                            </>
                          ) : (
                            <p className="mt-1 text-muted-foreground">—</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <GitCompare className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-lg font-medium">Select Properties to Compare</p>
            <p className="mt-1 text-muted-foreground">
              Click on the property pills above to select at least 2 properties
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
