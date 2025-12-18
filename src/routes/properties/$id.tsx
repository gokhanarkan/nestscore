import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useProperty, updateProperty, deleteProperty } from "@/hooks/use-properties";
import { useSettings } from "@/hooks/use-settings";
import { calculatePropertyScore, getScoreLabel } from "@/lib/scoring";
import { CATEGORIES, PROPERTY_TAGS } from "@/lib/constants";
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
import { ArrowLeft, Trash2, MapPin, Navigation, StickyNote, PoundSterling, Building2, ExternalLink, Star, Eye, XCircle, Heart, Share2 } from "lucide-react";
import type { PropertyTag } from "@/types";
import { ShareModal } from "@/components/sharing/share-modal";
import { createPropertyShareData, type ShareData } from "@/lib/sharing";
import { useState, useMemo, useRef, useEffect } from "react";
import { calculateDistance, formatDistance } from "@/lib/postcode";
import { cn } from "@/lib/utils";

const TAG_ICONS = {
  shortlisted: Star,
  viewed: Eye,
  rejected: XCircle,
  favourite: Heart,
} as const;

export const Route = createFileRoute("/properties/$id")({
  component: PropertyDetailPage,
});

function PropertyDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const property = useProperty(parseInt(id, 10));
  const settings = useSettings();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const notesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareData, setShareData] = useState<ShareData | null>(null);

  useEffect(() => {
    if (property) {
      setNotes(property.notes || "");
    }
  }, [property]);

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

  const handleNotesChange = (value: string) => {
    setNotes(value);
    if (notesTimeoutRef.current) {
      clearTimeout(notesTimeoutRef.current);
    }
    notesTimeoutRef.current = setTimeout(async () => {
      await updateProperty(property.id!, { notes: value });
    }, 500);
  };

  const handleDelete = async () => {
    await deleteProperty(property.id!);
    navigate({ to: "/properties" });
  };

  const handleToggleTag = async (tagId: PropertyTag) => {
    const currentTags = property.tags || [];
    const newTags = currentTags.includes(tagId)
      ? currentTags.filter((t) => t !== tagId)
      : [...currentTags, tagId];
    await updateProperty(property.id!, { tags: newTags });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-border/50 bg-linear-to-b from-muted/20 to-background">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="flex items-center justify-between">
            <Link
              to="/properties"
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Properties</span>
              <span className="sm:hidden">Back</span>
            </Link>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShareData(createPropertyShareData(property));
                  setShareModalOpen(true);
                }}
                className="text-muted-foreground hover:text-primary"
              >
                <Share2 className="h-4 w-4" />
                <span className="ml-2 hidden sm:inline">Share</span>
              </Button>
              <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">Delete</span>
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
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Property Overview - Responsive Grid */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          {/* Score Card */}
          <Card className="border-0 bg-card shadow-sm lg:row-span-2">
            <CardContent className="flex flex-col items-center p-6">
              <ScoreGauge score={score.overallScore} size="lg" showLabel />
              <div className="mt-4 text-center">
                <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  {getScoreLabel(score.overallScore)}
                </span>
              </div>
              <div className="mt-6 hidden w-full sm:block">
                <ScoreRadar scores={score.categoryScores} size={200} />
              </div>
            </CardContent>
          </Card>

          {/* Property Info Card */}
          <Card className="border-0 bg-card shadow-sm lg:col-span-2">
            <CardContent className="p-6">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{property.name}</h1>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-2">
                {PROPERTY_TAGS.map((tag) => {
                  const TagIcon = TAG_ICONS[tag.id as keyof typeof TAG_ICONS];
                  const isActive = property.tags?.includes(tag.id as PropertyTag);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => handleToggleTag(tag.id as PropertyTag)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                        isActive
                          ? "border-transparent text-white"
                          : "border-border bg-background text-muted-foreground hover:border-muted-foreground/50"
                      )}
                      style={isActive ? { backgroundColor: tag.color } : undefined}
                    >
                      <TagIcon className="h-3.5 w-3.5" />
                      {tag.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {property.address || property.postcode}
                </span>
                {property.agent && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="h-4 w-4" />
                    {property.agent}
                  </span>
                )}
                {property.listingUrl && (
                  <a
                    href={property.listingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Listing
                  </a>
                )}
              </div>
              {property.price > 0 && (
                <p className="mt-4 flex items-center gap-2 text-2xl font-semibold text-primary">
                  <PoundSterling className="h-5 w-5" />
                  {property.price.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-0 bg-card shadow-sm lg:col-span-2">
            <CardContent className="p-0">
              <div className="grid divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <div className="flex items-center gap-4 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Postcode</p>
                    <p className="font-semibold">{property.postcode}</p>
                  </div>
                </div>
                {distanceToWork !== null && (
                  <div className="flex items-center gap-4 p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                      <Navigation className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">From Work</p>
                      <p className="font-semibold">{formatDistance(distanceToWork)}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-4 p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                    <StickyNote className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Categories</p>
                    <p className="font-semibold">{CATEGORIES.length} assessed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assessment Section */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Categories */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">Assessment</h2>
              <p className="mt-1 text-sm text-muted-foreground">
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

          {/* Notes Sidebar */}
          <div className="lg:sticky lg:top-20 lg:self-start">
            <Card className="border-0 bg-card shadow-sm">
              <CardContent className="p-5">
                <h3 className="mb-3 flex items-center gap-2 font-semibold">
                  <StickyNote className="h-4 w-4 text-muted-foreground" />
                  Notes
                </h3>
                <textarea
                  id="notes"
                  placeholder="Add your notes about this property..."
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  className={cn(
                    "min-h-32 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm transition-all sm:min-h-50",
                    "placeholder:text-muted-foreground/60",
                    "focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
                  )}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Notes are saved automatically
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        shareData={shareData}
        title="Share Property"
        description="Share this property with others."
      />
    </div>
  );
}
