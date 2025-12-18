import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import { addProperty } from "@/hooks/use-properties";
import { lookupPostcode, autocompletePostcode } from "@/lib/postcode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, MapPin, Check } from "lucide-react";
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

  const [form, setForm] = useState({
    name: "",
    postcode: "",
    address: "",
    price: "",
    agent: "",
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

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <button
        onClick={() => navigate({ to: "/properties" })}
        className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <Card>
        <CardHeader>
          <CardTitle>Add Property</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Property Name *</Label>
              <Input
                id="name"
                placeholder="e.g., 2 Bed Flat in Hackney"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postcode">Postcode *</Label>
              <div className="relative">
                <Input
                  id="postcode"
                  placeholder="e.g., E8 1AB"
                  value={form.postcode}
                  onChange={(e) => updateField("postcode", e.target.value.toUpperCase())}
                  className="pr-10"
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {postcodeStatus === "checking" && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {postcodeStatus === "valid" && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </div>

                {suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border border-border bg-card shadow-lg">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => selectSuggestion(suggestion)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent"
                      >
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {postcodeStatus === "valid" && area && (
                <p className="text-xs text-muted-foreground">
                  <MapPin className="mr-1 inline h-3 w-3" />
                  {area}
                </p>
              )}
              {postcodeStatus === "invalid" && form.postcode.length >= 3 && (
                <p className="text-xs text-destructive">Invalid postcode</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Full Address</Label>
              <Input
                id="address"
                placeholder="e.g., 123 Mare Street"
                value={form.address}
                onChange={(e) => updateField("address", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (£)</Label>
              <Input
                id="price"
                type="text"
                inputMode="numeric"
                placeholder="e.g., 450000"
                value={form.price}
                onChange={(e) => updateField("price", e.target.value.replace(/[^0-9]/g, ""))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent">Estate Agent</Label>
              <Input
                id="agent"
                placeholder="e.g., Foxtons"
                value={form.agent}
                onChange={(e) => updateField("agent", e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading || !form.name || !form.postcode}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Property"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
