import { createFileRoute } from "@tanstack/react-router";
import { useSettings, updateSettings } from "@/hooks/use-settings";
import { CATEGORIES } from "@/lib/constants";
import { lookupPostcode } from "@/lib/postcode";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { db, defaultSettings } from "@/lib/db";
import { exportToCSV, downloadCSV } from "@/lib/export";
import { loadSampleProperties, removeSampleProperties, hasSampleProperties } from "@/lib/sample-data";
import { useState, useEffect, useCallback } from "react";
import { Loader2, Check, MapPin, Settings as SettingsIcon, Scale, Briefcase, Database, Download, Upload, Trash2, AlertCircle, Sparkles, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const settings = useSettings();
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [workPostcode, setWorkPostcode] = useState(settings.workPostcode ?? "");
  const [postcodeStatus, setPostcodeStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [hasSamples, setHasSamples] = useState(false);
  const [loadingSamples, setLoadingSamples] = useState(false);

  useEffect(() => {
    setWorkPostcode(settings.workPostcode ?? "");
  }, [settings.workPostcode]);

  useEffect(() => {
    hasSampleProperties().then(setHasSamples);
  }, []);

  const totalWeight = Object.values(settings.weights).reduce((a, b) => a + b, 0);
  const isWeightValid = totalWeight === 100;

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
      setHasSamples(false);
      setExportStatus("All properties deleted");
      setTimeout(() => setExportStatus(null), 3000);
    }
  };

  const handleLoadSamples = async () => {
    setLoadingSamples(true);
    try {
      const count = await loadSampleProperties();
      setHasSamples(true);
      setExportStatus(`Loaded ${count} sample properties!`);
      setTimeout(() => setExportStatus(null), 3000);
    } catch {
      setExportStatus("Failed to load samples");
      setTimeout(() => setExportStatus(null), 3000);
    } finally {
      setLoadingSamples(false);
    }
  };

  const handleRemoveSamples = async () => {
    setLoadingSamples(true);
    try {
      const count = await removeSampleProperties();
      setHasSamples(false);
      setExportStatus(`Removed ${count} sample properties`);
      setTimeout(() => setExportStatus(null), 3000);
    } catch {
      setExportStatus("Failed to remove samples");
      setTimeout(() => setExportStatus(null), 3000);
    } finally {
      setLoadingSamples(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-muted/20 to-background">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <SettingsIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Customize your scoring preferences
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Category Weights */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-5 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                    <Scale className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Category Weights</h2>
                    <p className="text-sm text-muted-foreground">
                      Adjust importance of each category
                    </p>
                  </div>
                </div>
                <div className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium",
                  isWeightValid ? "bg-green-500/10 text-green-600" : "bg-destructive/10 text-destructive"
                )}>
                  {!isWeightValid && <AlertCircle className="h-4 w-4" />}
                  {totalWeight}%
                </div>
              </div>

              <div className="space-y-5">
                {CATEGORIES.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="flex min-w-12 items-center justify-center rounded-lg bg-muted px-2 py-1 text-sm font-semibold tabular-nums">
                        {settings.weights[category.id]}%
                      </span>
                    </div>
                    <input
                      type="range"
                      id={category.id}
                      min={0}
                      max={50}
                      step={5}
                      value={settings.weights[category.id]}
                      onChange={(e) => handleWeightChange(category.id, Number(e.target.value))}
                      className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-border pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateSettings({ weights: defaultSettings.weights })}
                  className="gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Work Location */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10">
                  <Briefcase className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h2 className="font-semibold">Work Location</h2>
                  <p className="text-sm text-muted-foreground">
                    Set your work postcode for commute calculations
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div
                  className={cn(
                    "flex items-center gap-3 rounded-xl border bg-background px-4 py-3 transition-all",
                    focusedField === "postcode"
                      ? "border-primary ring-4 ring-primary/10"
                      : "border-border hover:border-muted-foreground/30"
                  )}
                >
                  <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <input
                    id="work-postcode"
                    type="text"
                    placeholder="e.g., EC2A 4NE"
                    value={workPostcode}
                    onChange={(e) => setWorkPostcode(e.target.value.toUpperCase())}
                    onFocus={() => setFocusedField("postcode")}
                    onBlur={() => setFocusedField(null)}
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
                {postcodeStatus === "valid" && settings.workCoordinates && (
                  <p className="flex items-center gap-1.5 text-sm text-green-600">
                    <Check className="h-3.5 w-3.5" />
                    Location saved
                  </p>
                )}
                {postcodeStatus === "invalid" && workPostcode.length >= 3 && (
                  <p className="text-sm text-destructive">
                    Invalid postcode - please check and try again
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10">
                  <Database className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h2 className="font-semibold">Data Management</h2>
                  <p className="text-sm text-muted-foreground">
                    Export or import your property data
                  </p>
                </div>
              </div>

              {exportStatus && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm font-medium text-primary">
                  <Check className="h-4 w-4" />
                  {exportStatus}
                </div>
              )}

              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button onClick={handleExportJSON} className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Export JSON
                  </Button>
                  <Button variant="outline" onClick={handleExportCSV} className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
                <Button variant="outline" asChild className="w-full gap-2">
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4" />
                    Import JSON Backup
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImport}
                    />
                  </label>
                </Button>
                <div className="pt-3">
                  <Button
                    variant="outline"
                    onClick={handleClearAll}
                    className="w-full gap-2 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sample Data */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500/10">
                  <Sparkles className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h2 className="font-semibold">Sample Data</h2>
                  <p className="text-sm text-muted-foreground">
                    Load sample London properties to explore the app
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {hasSamples ? (
                  <Button
                    variant="outline"
                    onClick={handleRemoveSamples}
                    disabled={loadingSamples}
                    className="w-full gap-2"
                  >
                    {loadingSamples ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                    Remove Sample Properties
                  </Button>
                ) : (
                  <Button
                    onClick={handleLoadSamples}
                    disabled={loadingSamples}
                    className="w-full gap-2"
                  >
                    {loadingSamples ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Load Sample Properties
                  </Button>
                )}
                <p className="text-center text-xs text-muted-foreground">
                  {hasSamples
                    ? "Sample properties are loaded. Remove them when you're ready to add your own."
                    : "Loads 4 sample London properties with pre-filled assessments."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
