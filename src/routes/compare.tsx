import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useProperties } from "@/hooks/use-properties";
import { useSettings } from "@/hooks/use-settings";
import { calculatePropertyScore } from "@/lib/scoring";
import { CATEGORIES } from "@/lib/constants";
import { ScoreGauge } from "@/components/scoring/score-gauge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

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

  if (properties.length < 2) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-semibold">Compare Properties</h1>
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">
            Add at least 2 properties to compare them side by side.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Compare Properties</h1>
        <p className="text-sm text-muted-foreground">
          Select up to 4 properties to compare
        </p>
      </header>

      <div className="mb-6 flex flex-wrap gap-2">
        {scores.map(({ property, score }) => (
          <button
            key={property.id}
            onClick={() => toggleSelect(property.id!)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-all",
              selected.includes(property.id!)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:border-primary/50"
            )}
          >
            {selected.includes(property.id!) && <Check className="h-3.5 w-3.5" />}
            <span>{property.name}</span>
            <Badge variant="secondary" className="ml-1">
              {score.overallScore}
            </Badge>
          </button>
        ))}
      </div>

      {selectedScores.length >= 2 && (
        <>
          <div className="mb-6 grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedScores.length}, 1fr)` }}>
            {selectedScores.map(({ property, score }) => (
              <Card key={property.id}>
                <CardContent className="flex flex-col items-center p-4">
                  <ScoreGauge score={score.overallScore} size="md" showLabel />
                  <p className="mt-3 text-center font-medium">{property.name}</p>
                  <p className="text-sm text-muted-foreground">{property.postcode}</p>
                  {property.price > 0 && (
                    <p className="mt-1 font-medium text-primary">
                      £{property.price.toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Category Comparison</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-3 text-left font-medium">Category</th>
                      {selectedScores.map(({ property }) => (
                        <th key={property.id} className="px-4 py-3 text-center font-medium">
                          {property.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {CATEGORIES.filter((c) => c.defaultWeight > 0).map((category) => {
                      const categoryScores = selectedScores.map(({ score }) =>
                        score.categoryScores.find((cs) => cs.categoryId === category.id)?.score ?? 0
                      );
                      const maxScore = Math.max(...categoryScores);

                      return (
                        <tr key={category.id} className="border-b border-border last:border-0">
                          <td className="px-4 py-3 font-medium">{category.name}</td>
                          {categoryScores.map((catScore, i) => (
                            <td
                              key={selectedScores[i].property.id}
                              className={cn(
                                "px-4 py-3 text-center",
                                catScore === maxScore && maxScore > 0 && "font-semibold text-primary"
                              )}
                            >
                              {catScore || "—"}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {selectedScores.length < 2 && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">
            Select at least 2 properties to see the comparison
          </p>
        </div>
      )}
    </div>
  );
}
