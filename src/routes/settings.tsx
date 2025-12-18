import { createFileRoute } from "@tanstack/react-router";
import { useSettings, updateSettings } from "@/hooks/use-settings";
import { CATEGORIES } from "@/lib/constants";
import { lookupPostcode } from "@/lib/postcode";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { exportToCSV, downloadCSV } from "@/lib/export";
import { useState, useEffect, useCallback } from "react";
import { Loader2, Check, MapPin } from "lucide-react";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const settings = useSettings();
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [workPostcode, setWorkPostcode] = useState(settings.workPostcode ?? "");
  const [postcodeStatus, setPostcodeStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");

  useEffect(() => {
    setWorkPostcode(settings.workPostcode ?? "");
  }, [settings.workPostcode]);

  const totalWeight = Object.values(settings.weights).reduce((a, b) => a + b, 0);

  const handleWeightChange = async (categoryId: string, value: number) => {
    const newWeights = { ...settings.weights, [categoryId]: value };
    await updateSettings({ weights: newWeights });
  };

  const checkAndSavePostcode = useCallback(async (postcode: string) => {
    if (postcode.length < 3) {
      setPostcodeStatus("idle");
      await updateSettings({ workPostcode: postcode, workCoordinates: undefined });
      return;
    }

    setPostcodeStatus("checking");
    const result = await lookupPostcode(postcode);

    if (result) {
      setPostcodeStatus("valid");
      await updateSettings({
        workPostcode: postcode.toUpperCase(),
        workCoordinates: { lat: result.latitude, lng: result.longitude },
      });
    } else {
      setPostcodeStatus("invalid");
      await updateSettings({ workPostcode: postcode.toUpperCase(), workCoordinates: undefined });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (workPostcode !== settings.workPostcode) {
        checkAndSavePostcode(workPostcode);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [workPostcode, settings.workPostcode, checkAndSavePostcode]);

  const handleExportJSON = async () => {
    try {
      const properties = await db.properties.toArray();
      const data = { properties, settings, exportedAt: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nestscore-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportStatus("JSON exported!");
      setTimeout(() => setExportStatus(null), 3000);
    } catch {
      setExportStatus("Export failed");
    }
  };

  const handleExportCSV = async () => {
    try {
      const properties = await db.properties.toArray();
      if (properties.length === 0) {
        setExportStatus("No properties to export");
        setTimeout(() => setExportStatus(null), 3000);
        return;
      }
      const csv = exportToCSV(properties, settings);
      downloadCSV(csv, `nestscore-${new Date().toISOString().split("T")[0]}.csv`);
      setExportStatus("CSV exported!");
      setTimeout(() => setExportStatus(null), 3000);
    } catch {
      setExportStatus("Export failed");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.properties && Array.isArray(data.properties)) {
        for (const property of data.properties) {
          const { id, ...rest } = property;
          await db.properties.add({
            ...rest,
            createdAt: new Date(rest.createdAt),
            updatedAt: new Date(rest.updatedAt),
          });
        }
      }

      if (data.settings?.weights) {
        await updateSettings({ weights: data.settings.weights });
      }

      setExportStatus(`Imported ${data.properties?.length ?? 0} properties!`);
      setTimeout(() => setExportStatus(null), 3000);
    } catch {
      setExportStatus("Import failed - invalid file");
    }

    e.target.value = "";
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to delete all properties? This cannot be undone.")) {
      await db.properties.clear();
      setExportStatus("All properties deleted");
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Category Weights</CardTitle>
            <CardDescription>
              Adjust how much each category affects the overall score. Total: {totalWeight}%
              {totalWeight !== 100 && (
                <span className="ml-2 text-destructive">(should be 100%)</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {CATEGORIES.map((category) => (
              <div key={category.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={category.id}>{category.name}</Label>
                  <span className="text-sm font-medium">{settings.weights[category.id]}%</span>
                </div>
                <Slider
                  id={category.id}
                  min={0}
                  max={50}
                  step={5}
                  value={[settings.weights[category.id]]}
                  onValueChange={([value]) => handleWeightChange(category.id, value)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Work Location</CardTitle>
            <CardDescription>
              Set your work postcode to calculate commute distances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="work-postcode">Work Postcode</Label>
              <div className="relative">
                <Input
                  id="work-postcode"
                  placeholder="e.g., EC2A 4NE"
                  value={workPostcode}
                  onChange={(e) => setWorkPostcode(e.target.value.toUpperCase())}
                  className="pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {postcodeStatus === "checking" && (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                  {postcodeStatus === "valid" && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
              {postcodeStatus === "valid" && settings.workCoordinates && (
                <p className="text-xs text-muted-foreground">
                  <MapPin className="mr-1 inline h-3 w-3" />
                  Location saved
                </p>
              )}
              {postcodeStatus === "invalid" && workPostcode.length >= 3 && (
                <p className="text-xs text-destructive">Invalid postcode</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Management</CardTitle>
            <CardDescription>Export or import your property data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {exportStatus && (
              <p className="text-sm text-primary">{exportStatus}</p>
            )}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleExportJSON}>Export JSON</Button>
              <Button variant="outline" onClick={handleExportCSV}>Export CSV</Button>
              <Button variant="outline" asChild>
                <label className="cursor-pointer">
                  Import JSON
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImport}
                  />
                </label>
              </Button>
            </div>
            <div className="pt-2">
              <Button variant="destructive" onClick={handleClearAll}>
                Clear All Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
