import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { decodeShareData, type ShareData, type SettingsShareData, type PropertyShareData, type PropertiesShareData } from "@/lib/sharing";
import { addProperty } from "@/hooks/use-properties";
import { updateSettings } from "@/hooks/use-settings";
import { lookupPostcode } from "@/lib/postcode";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Scale, Home, AlertCircle, Check, Loader2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/share")({
  component: SharePage,
  validateSearch: (search: Record<string, unknown>): { data?: string } => {
    return {
      data: typeof search.data === "string" ? search.data : undefined,
    };
  },
});

function SharePage() {
  const navigate = useNavigate();
  const { data: encodedData } = Route.useSearch();
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);

  useEffect(() => {
    if (!encodedData) {
      setError("No share data found in URL");
      return;
    }

    const data = decodeShareData(encodedData);
    if (!data) {
      setError("Invalid or corrupted share data");
      return;
    }

    setShareData(data);
  }, [encodedData]);

  const handleImportSettings = async () => {
    if (!shareData || shareData.type !== "settings") return;

    setImporting(true);
    try {
      const data = shareData.data as SettingsShareData;
      await updateSettings({ weights: data.weights });

      if (data.workPostcode) {
        const result = await lookupPostcode(data.workPostcode);
        if (result) {
          await updateSettings({
            workPostcode: data.workPostcode,
            workCoordinates: { lat: result.latitude, lng: result.longitude },
          });
        }
      }

      setImported(true);
    } catch (e) {
      console.error("Failed to import settings:", e);
      setError("Failed to import settings");
    } finally {
      setImporting(false);
    }
  };

  const handleImportProperty = async () => {
    if (!shareData || shareData.type !== "property") return;

    setImporting(true);
    try {
      const data = shareData.data as PropertyShareData;

      // Lookup coordinates for the postcode
      let coordinates;
      const result = await lookupPostcode(data.postcode);
      if (result) {
        coordinates = { lat: result.latitude, lng: result.longitude };
      }

      const id = await addProperty({
        name: data.name,
        postcode: data.postcode,
        address: data.address,
        price: data.price,
        agent: data.agent,
        listingUrl: data.listingUrl,
        answers: data.answers,
        notes: data.notes,
        coordinates,
      });

      navigate({ to: "/properties/$id", params: { id: String(id) } });
    } catch (e) {
      console.error("Failed to import property:", e);
      setError("Failed to import property");
    } finally {
      setImporting(false);
    }
  };

  const handleImportProperties = async () => {
    if (!shareData || shareData.type !== "properties") return;

    setImporting(true);
    try {
      const data = shareData.data as PropertiesShareData;

      for (const prop of data.properties) {
        let coordinates;
        const result = await lookupPostcode(prop.postcode);
        if (result) {
          coordinates = { lat: result.latitude, lng: result.longitude };
        }

        await addProperty({
          name: prop.name,
          postcode: prop.postcode,
          address: prop.address,
          price: prop.price,
          agent: prop.agent,
          listingUrl: prop.listingUrl,
          answers: prop.answers,
          notes: prop.notes,
          coordinates,
        });
      }

      setImported(true);
    } catch (e) {
      console.error("Failed to import properties:", e);
      setError("Failed to import properties");
    } finally {
      setImporting(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-b from-muted/20 to-background">
        <div className="mx-auto max-w-md px-4 py-16">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <h1 className="text-xl font-semibold">Import Failed</h1>
              <p className="mt-2 text-muted-foreground">{error}</p>
              <Button
                className="mt-6"
                onClick={() => navigate({ to: "/" })}
              >
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!shareData) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (imported) {
    return (
      <div className="min-h-screen bg-linear-to-b from-muted/20 to-background">
        <div className="mx-auto max-w-md px-4 py-16">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="text-xl font-semibold">Import Successful!</h1>
              <p className="mt-2 text-muted-foreground">
                {shareData.type === "settings"
                  ? "Category weights have been imported."
                  : shareData.type === "property"
                    ? "Property has been added to your list."
                    : `${(shareData.data as PropertiesShareData).properties.length} properties have been imported.`}
              </p>
              <Button
                className="mt-6 gap-2"
                onClick={() =>
                  navigate({
                    to: shareData.type === "settings" ? "/settings" : "/properties",
                  })
                }
              >
                {shareData.type === "settings" ? "View Settings" : "View Properties"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-muted/20 to-background">
      <div className="mx-auto max-w-md px-4 py-16">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            {shareData.type === "settings" && (
              <>
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
                    <Scale className="h-8 w-8 text-amber-500" />
                  </div>
                  <h1 className="text-xl font-semibold">Import Category Weights</h1>
                  <p className="mt-2 text-muted-foreground">
                    Someone shared their scoring preferences with you.
                  </p>
                </div>

                <div className="mb-6 space-y-2">
                  <p className="text-sm font-medium">Weights to import:</p>
                  <div className="max-h-48 overflow-y-auto rounded-lg bg-muted/50 p-3">
                    {Object.entries((shareData.data as SettingsShareData).weights).map(
                      ([category, weight]) => (
                        <div
                          key={category}
                          className="flex justify-between py-1 text-sm"
                        >
                          <span className="capitalize">{category}</span>
                          <span className="font-medium">{weight}%</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <Button
                  className="w-full gap-2"
                  onClick={handleImportSettings}
                  disabled={importing}
                >
                  {importing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Import Weights
                </Button>
              </>
            )}

            {shareData.type === "property" && (
              <>
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Home className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-xl font-semibold">Import Property</h1>
                  <p className="mt-2 text-muted-foreground">
                    Someone shared a property with you.
                  </p>
                </div>

                <div className="mb-6 rounded-lg bg-muted/50 p-4">
                  <p className="font-medium">
                    {(shareData.data as PropertyShareData).name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {(shareData.data as PropertyShareData).postcode}
                  </p>
                  {(shareData.data as PropertyShareData).price > 0 && (
                    <p className="mt-2 font-semibold text-primary">
                      £{(shareData.data as PropertyShareData).price.toLocaleString()}
                    </p>
                  )}
                </div>

                <Button
                  className="w-full gap-2"
                  onClick={handleImportProperty}
                  disabled={importing}
                >
                  {importing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Import Property
                </Button>
              </>
            )}

            {shareData.type === "properties" && (
              <>
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                    <Home className="h-8 w-8 text-primary" />
                  </div>
                  <h1 className="text-xl font-semibold">Import Properties</h1>
                  <p className="mt-2 text-muted-foreground">
                    Someone shared{" "}
                    {(shareData.data as PropertiesShareData).properties.length}{" "}
                    properties with you.
                  </p>
                </div>

                <div className="mb-6 max-h-64 space-y-2 overflow-y-auto">
                  {(shareData.data as PropertiesShareData).properties.map(
                    (prop, i) => (
                      <div key={i} className="rounded-lg bg-muted/50 p-3">
                        <p className="font-medium">{prop.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {prop.postcode}
                        </p>
                      </div>
                    )
                  )}
                </div>

                <Button
                  className="w-full gap-2"
                  onClick={handleImportProperties}
                  disabled={importing}
                >
                  {importing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Import All Properties
                </Button>
              </>
            )}

            <Button
              variant="ghost"
              className="mt-3 w-full"
              onClick={() => navigate({ to: "/" })}
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
