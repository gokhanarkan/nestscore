import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useProperty, updateProperty, deleteProperty } from "@/hooks/use-properties";
import { useSettings } from "@/hooks/use-settings";
import { calculatePropertyScore } from "@/lib/scoring";
import { CATEGORIES } from "@/lib/constants";
import { ScoreGauge } from "@/components/scoring/score-gauge";
import { ScoreRadar } from "@/components/visualization/score-radar";
import { CategorySection } from "@/components/property/category-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Trash2, MapPin, Navigation } from "lucide-react";
import { useState, useMemo } from "react";
import { calculateDistance, formatDistance } from "@/lib/postcode";

export const Route = createFileRoute("/properties/$id")({
  component: PropertyDetailPage,
});

function PropertyDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const property = useProperty(parseInt(id, 10));
  const settings = useSettings();
  const [deleteOpen, setDeleteOpen] = useState(false);

  const score = useMemo(() => {
    if (!property) return null;
    return calculatePropertyScore(property, settings.weights);
  }, [property, settings.weights]);

  const distanceToWork = useMemo(() => {
    if (!property?.coordinates || !settings.workCoordinates) return null;
    return calculateDistance(property.coordinates, settings.workCoordinates);
  }, [property?.coordinates, settings.workCoordinates]);

  if (!property || !score) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const handleAnswerChange = async (questionId: string, value: string | boolean | number) => {
    const newAnswers = { ...property.answers, [questionId]: value };
    await updateProperty(property.id!, { answers: newAnswers });
  };

  const handleDelete = async () => {
    await deleteProperty(property.id!);
    navigate({ to: "/properties" });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/properties" })}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Property</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{property.name}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
            <ScoreGauge score={score.overallScore} size="lg" showLabel />
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl font-semibold">{property.name}</h1>
              <div className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground sm:justify-start">
                <MapPin className="h-3.5 w-3.5" />
                {property.address || property.postcode}
              </div>
              {property.price > 0 && (
                <p className="mt-2 text-lg font-semibold text-primary">
                  £{property.price.toLocaleString()}
                </p>
              )}
              {property.agent && (
                <p className="mt-1 text-sm text-muted-foreground">{property.agent}</p>
              )}
              {distanceToWork !== null && (
                <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                  <Navigation className="h-3.5 w-3.5" />
                  {formatDistance(distanceToWork)} from work
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Radar Chart */}
      <Card className="mb-6">
        <CardContent className="flex items-center justify-center p-6">
          <ScoreRadar scores={score.categoryScores} size={280} />
        </CardContent>
      </Card>

      <div className="mb-4">
        <h2 className="text-lg font-medium">Assessment</h2>
        <p className="text-sm text-muted-foreground">
          Answer questions to calculate the property score
        </p>
      </div>

      <div className="space-y-4">
        {CATEGORIES.map((category) => {
          const categoryScore = score.categoryScores.find(
            (cs) => cs.categoryId === category.id
          );
          return (
            <CategorySection
              key={category.id}
              category={category}
              answers={property.answers}
              score={categoryScore?.score ?? 0}
              answeredCount={categoryScore?.answeredCount ?? 0}
              onAnswerChange={handleAnswerChange}
            />
          );
        })}
      </div>
    </div>
  );
}
