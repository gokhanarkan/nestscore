import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { addProperty } from "@/hooks/use-properties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/properties/new")({
  component: NewPropertyPage,
});

function NewPropertyPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    postcode: "",
    address: "",
    price: "",
    agent: "",
  });

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
              <Input
                id="postcode"
                placeholder="e.g., E8 1AB"
                value={form.postcode}
                onChange={(e) => updateField("postcode", e.target.value)}
                required
              />
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
