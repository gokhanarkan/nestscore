import { createFileRoute, Link } from "@tanstack/react-router";
import { useProperties } from "@/hooks/use-properties";
import { useSettings } from "@/hooks/use-settings";
import { calculatePropertyScore, getScoreLabel, getScoreColor } from "@/lib/scoring";
import { PROPERTY_TAGS } from "@/lib/constants";
import { ScoreGauge } from "@/components/scoring/score-gauge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, List, Plus, MapPin, ChevronRight, Building2, Star, Eye, XCircle, Heart } from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import type { PropertyTag } from "@/types";

const TAG_ICONS = {
  shortlisted: Star,
  viewed: Eye,
  rejected: XCircle,
  favourite: Heart,
} as const;

export const Route = createFileRoute("/properties/")({
  component: PropertiesPage,
});

function PropertiesPage() {
  const properties = useProperties();
  const settings = useSettings();
  const [search, setSearch] = useState("");
  const [focusedSearch, setFocusedSearch] = useState(false);
  const [tagFilter, setTagFilter] = useState<PropertyTag | null>(null);

  const filteredProperties = useMemo(() => {
    let result = properties;

    // Filter by search
    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.postcode.toLowerCase().includes(query) ||
          p.address.toLowerCase().includes(query)
      );
    }

    // Filter by tag
    if (tagFilter) {
      result = result.filter((p) => p.tags?.includes(tagFilter));
    }

    return result;
  }, [properties, search, tagFilter]);

  return (
    <div className="min-h-screen bg-linear-to-b from-muted/20 to-background">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <List className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Properties</h1>
              <p className="text-sm text-muted-foreground">
                {properties.length} {properties.length === 1 ? "property" : "properties"} saved
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="gap-2">
            <Link to="/properties/new">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Property</span>
            </Link>
          </Button>
        </div>

        {/* Search */}
        {properties.length > 0 && (
          <div className="mb-6 space-y-3">
            <div
              className={cn(
                "flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-all",
                focusedSearch
                  ? "border-primary ring-4 ring-primary/10"
                  : "border-border hover:border-muted-foreground/30"
              )}
            >
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, postcode, or address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setFocusedSearch(true)}
                onBlur={() => setFocusedSearch(false)}
                className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Tag Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTagFilter(null)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                  tagFilter === null
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                All
              </button>
              {PROPERTY_TAGS.map((tag) => {
                const TagIcon = TAG_ICONS[tag.id as keyof typeof TAG_ICONS];
                const isActive = tagFilter === tag.id;
                const count = properties.filter((p) => p.tags?.includes(tag.id as PropertyTag)).length;
                if (count === 0) return null;
                return (
                  <button
                    key={tag.id}
                    onClick={() => setTagFilter(isActive ? null : tag.id as PropertyTag)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                      isActive
                        ? "text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    )}
                    style={isActive ? { backgroundColor: tag.color } : undefined}
                  >
                    <TagIcon className="h-3 w-3" />
                    {tag.label}
                    <span className={cn("tabular-nums", isActive ? "opacity-80" : "opacity-60")}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Property List */}
        {filteredProperties.length > 0 ? (
          <div className="space-y-3">
            {filteredProperties.map((property) => {
              const score = calculatePropertyScore(property, settings.weights);
              return (
                <Link
                  key={property.id}
                  to="/properties/$id"
                  params={{ id: String(property.id) }}
                  className="group block"
                >
                  <Card className="border-0 shadow-sm transition-all duration-200 hover:shadow-md group-active:scale-[0.99]">
                    <CardContent className="flex items-center gap-4 p-4 sm:p-5">
                      <ScoreGauge score={score.overallScore} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-medium group-hover:text-primary">
                            {property.name}
                          </p>
                          <span
                            className="hidden shrink-0 rounded-full px-2 py-0.5 text-xs font-medium sm:inline-block"
                            style={{
                              backgroundColor: `${getScoreColor(score.overallScore)}15`,
                              color: getScoreColor(score.overallScore),
                            }}
                          >
                            {getScoreLabel(score.overallScore)}
                          </span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            {property.postcode}
                          </span>
                          {property.price > 0 && (
                            <span className="font-medium text-primary">
                              £{property.price.toLocaleString()}
                            </span>
                          )}
                          {property.tags && property.tags.length > 0 && (
                            <div className="flex gap-1">
                              {property.tags.map((tagId) => {
                                const tag = PROPERTY_TAGS.find((t) => t.id === tagId);
                                if (!tag) return null;
                                const TagIcon = TAG_ICONS[tagId as keyof typeof TAG_ICONS];
                                return (
                                  <span
                                    key={tagId}
                                    className="flex h-5 w-5 items-center justify-center rounded-full"
                                    style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                                    title={tag.label}
                                  >
                                    <TagIcon className="h-3 w-3" />
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : properties.length > 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">No results found</p>
            <p className="mt-1 text-muted-foreground">
              Try a different search term
            </p>
          </div>
        ) : (
          <div className="py-16 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-muted">
              <Building2 className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">No properties yet</h2>
            <p className="mt-2 max-w-sm mx-auto text-muted-foreground">
              Add your first property to start evaluating and comparing homes.
            </p>
            <Button asChild className="mt-6 gap-2">
              <Link to="/properties/new">
                <Plus className="h-4 w-4" />
                Add Your First Property
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
