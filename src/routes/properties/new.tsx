import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { addProperty } from "@/hooks/use-properties";
import { lookupPostcode, autocompletePostcode } from "@/lib/postcode";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, MapPin, Check, Home, PoundSterling, Building2, MapPinned, Link as LinkIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Coordinates } from "@/types";

export const Route = createFileRoute("/properties/new")({
  component: NewPropertyPage,
});

function NewPropertyPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [postcodeStatus, setPostcodeStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [coordinates, setCoordinates] = useState<Coordinates | undefined>();
  const [area, setArea] = useState<string>("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    postcode: "",
    address: "",
    price: "",
    agent: "",
    listingUrl: "",
  });

  const checkPostcode = useCallback(async (postcode: string) => {
    if (postcode.length < 3) {
      setPostcodeStatus("idle");
      setCoordinates(undefined);
      setArea("");
      return;
    }

    setPostcodeStatus("checking");
    const result = await lookupPostcode(postcode);

    if (result) {
      setPostcodeStatus("valid");
      setCoordinates({ lat: result.latitude, lng: result.longitude });
      setArea(result.admin_district || result.region || "");
    } else {
      setPostcodeStatus("invalid");
      setCoordinates(undefined);
      setArea("");
    }
  }, []);

  const fetchSuggestions = useCallback(async (partial: string) => {
    if (partial.length < 2) {
      setSuggestions([]);
      return;
    }
    const results = await autocompletePostcode(partial);
    setSuggestions(results.slice(0, 5));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (form.postcode) {
        checkPostcode(form.postcode);
        fetchSuggestions(form.postcode);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [form.postcode, checkPostcode, fetchSuggestions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.postcode.trim()) return;

    setLoading(true);
    try {
      const id = await addProperty({
        name: form.name.trim(),
        postcode: form.postcode.trim().toUpperCase(),
        address: form.address.trim(),
        price: form.price ? parseInt(form.price.replace(/,/g, ""), 10) : 0,
        agent: form.agent.trim(),
        listingUrl: form.listingUrl.trim() || undefined,
        answers: {},
        notes: "",
        coordinates,
      });
      navigate({ to: "/properties/$id", params: { id: String(id) } });
    } catch (error) {
      console.error("Failed to add property:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const selectSuggestion = (postcode: string) => {
    setForm((prev) => ({ ...prev, postcode }));
    setSuggestions([]);
  };

  const formatPrice = (value: string) => {
    const num = parseInt(value.replace(/,/g, ""), 10);
    if (isNaN(num)) return "";
    return num.toLocaleString();
  };

  const isFormValid = form.name.trim() && form.postcode.trim();

  return (
    <div className="min-h-screen bg-linear-to-b from-muted/30 to-background">
      <div className="mx-auto max-w-xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/properties"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Properties</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>

        {/* Title */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Home className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Add Property</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter property details to start your evaluation
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Property Name */}
          <div className="group">
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Property Name
            </label>
            <div
              className={cn(
                "flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-all",
                focusedField === "name"
                  ? "border-primary ring-4 ring-primary/10"
                  : "border-border hover:border-muted-foreground/30"
              )}
            >
              <Home className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                id="name"
                type="text"
                placeholder="e.g., 2 Bed Flat in Hackney"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                onFocus={() => setFocusedField("name")}
                onBlur={() => setFocusedField(null)}
                className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          {/* Postcode */}
          <div className="group">
            <label
              htmlFor="postcode"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Postcode
            </label>
            <div className="relative">
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-all",
                  focusedField === "postcode"
                    ? "border-primary ring-4 ring-primary/10"
                    : "border-border hover:border-muted-foreground/30"
                )}
              >
                <MapPinned className="h-5 w-5 shrink-0 text-muted-foreground" />
                <input
                  id="postcode"
                  type="text"
                  placeholder="e.g., E8 1AB"
                  value={form.postcode}
                  onChange={(e) => updateField("postcode", e.target.value.toUpperCase())}
                  onFocus={() => setFocusedField("postcode")}
                  onBlur={() => setTimeout(() => setFocusedField(null), 150)}
                  className="flex-1 bg-transparent text-base uppercase outline-none placeholder:text-muted-foreground/60 placeholder:normal-case"
                />
                <div className="flex h-5 w-5 items-center justify-center">
                  {postcodeStatus === "checking" && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {postcodeStatus === "valid" && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10">
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    </div>
                  )}
                </div>
              </div>

              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && focusedField === "postcode" && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => selectSuggestion(suggestion)}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent",
                        index !== suggestions.length - 1 && "border-b border-border/50"
                      )}
                    >
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {postcodeStatus === "valid" && area && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-green-600">
                <MapPin className="h-3.5 w-3.5" />
                {area}
              </p>
            )}
            {postcodeStatus === "invalid" && form.postcode.length >= 3 && (
              <p className="mt-2 text-sm text-destructive">
                Invalid postcode - please check and try again
              </p>
            )}
          </div>

          {/* Full Address */}
          <div className="group">
            <label
              htmlFor="address"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Full Address <span className="text-muted-foreground">(optional)</span>
            </label>
            <div
              className={cn(
                "flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-all",
                focusedField === "address"
                  ? "border-primary ring-4 ring-primary/10"
                  : "border-border hover:border-muted-foreground/30"
              )}
            >
              <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                id="address"
                type="text"
                placeholder="e.g., 123 Mare Street, London"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
                onFocus={() => setFocusedField("address")}
                onBlur={() => setFocusedField(null)}
                className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          {/* Price */}
          <div className="group">
            <label
              htmlFor="price"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Price <span className="text-muted-foreground">(optional)</span>
            </label>
            <div
              className={cn(
                "flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-all",
                focusedField === "price"
                  ? "border-primary ring-4 ring-primary/10"
                  : "border-border hover:border-muted-foreground/30"
              )}
            >
              <PoundSterling className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                id="price"
                type="text"
                inputMode="numeric"
                placeholder="e.g., 450,000"
                value={form.price ? formatPrice(form.price) : ""}
                onChange={(e) => updateField("price", e.target.value.replace(/[^0-9]/g, ""))}
                onFocus={() => setFocusedField("price")}
                onBlur={() => setFocusedField(null)}
                className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          {/* Estate Agent */}
          <div className="group">
            <label
              htmlFor="agent"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Estate Agent <span className="text-muted-foreground">(optional)</span>
            </label>
            <div
              className={cn(
                "flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-all",
                focusedField === "agent"
                  ? "border-primary ring-4 ring-primary/10"
                  : "border-border hover:border-muted-foreground/30"
              )}
            >
              <Building2 className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                id="agent"
                type="text"
                placeholder="e.g., Foxtons"
                value={form.agent}
                onChange={(e) => updateField("agent", e.target.value)}
                onFocus={() => setFocusedField("agent")}
                onBlur={() => setFocusedField(null)}
                className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          {/* Listing URL */}
          <div className="group">
            <label
              htmlFor="listingUrl"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              Listing URL <span className="text-muted-foreground">(optional)</span>
            </label>
            <div
              className={cn(
                "flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-all",
                focusedField === "listingUrl"
                  ? "border-primary ring-4 ring-primary/10"
                  : "border-border hover:border-muted-foreground/30"
              )}
            >
              <LinkIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                id="listingUrl"
                type="url"
                placeholder="e.g., https://rightmove.co.uk/..."
                value={form.listingUrl}
                onChange={(e) => updateField("listingUrl", e.target.value)}
                onFocus={() => setFocusedField("listingUrl")}
                onBlur={() => setFocusedField(null)}
                className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/60"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={loading || !isFormValid}
              className="w-full rounded-xl py-6 text-base font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Adding Property...
                </>
              ) : (
                "Add Property"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
