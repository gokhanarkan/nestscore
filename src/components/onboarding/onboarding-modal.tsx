import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { loadSampleProperties } from "@/lib/sample-data";
import { lookupPostcode } from "@/lib/postcode";
import { updateSettings } from "@/hooks/use-settings";
import {
  Home,
  ListChecks,
  GitCompare,
  MapPin,
  ArrowRight,
  Sparkles,
  Check,
  Loader2,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ONBOARDING_KEY = "nestscore-onboarded";

interface OnboardingModalProps {
  onComplete: () => void;
}

const steps = [
  {
    id: "welcome",
    title: "Welcome to NestScore",
    description: "Your personal property evaluation companion for finding the perfect home in London.",
    icon: Home,
  },
  {
    id: "features",
    title: "How It Works",
    description: "Score properties across 10 categories, compare them side-by-side, and track your house hunt.",
    icon: ListChecks,
    features: [
      { icon: ListChecks, text: "Score properties on 37 criteria" },
      { icon: GitCompare, text: "Compare up to 4 properties" },
      { icon: MapPin, text: "View all properties on a map" },
    ],
  },
  {
    id: "setup",
    title: "Quick Setup",
    description: "Let's personalize your experience.",
    icon: Sparkles,
  },
];

export function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [workPostcode, setWorkPostcode] = useState("");
  const [postcodeStatus, setPostcodeStatus] = useState<"idle" | "checking" | "valid" | "invalid">("idle");
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [samplesLoaded, setSamplesLoaded] = useState(false);

  const handleLoadSamples = async () => {
    setLoadingSamples(true);
    try {
      await loadSampleProperties();
      setSamplesLoaded(true);
    } catch (e) {
      console.error("Failed to load samples:", e);
    } finally {
      setLoadingSamples(false);
    }
  };

  const checkPostcode = useCallback(async (postcode: string) => {
    if (postcode.length < 3) {
      setPostcodeStatus("idle");
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
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (workPostcode.length >= 3) {
        checkPostcode(workPostcode);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [workPostcode, checkPostcode]);

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    onComplete();
  };

  const canProceed = currentStep < steps.length - 1;
  const isLastStep = currentStep === steps.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-100 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="w-full max-w-md"
      >
        {/* Progress dots */}
        <div className="mb-6 flex justify-center gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === currentStep ? "w-8 bg-primary" : "w-2 bg-muted-foreground/20"
              )}
            />
          ))}
        </div>

        {/* Content */}
        <div className="rounded-3xl border border-border/50 bg-card p-6 shadow-2xl sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 0: Welcome */}
              {currentStep === 0 && (
                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10">
                    <Home className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight">{steps[0].title}</h2>
                  <p className="mt-3 text-muted-foreground">{steps[0].description}</p>
                </div>
              )}

              {/* Step 1: Features */}
              {currentStep === 1 && (
                <div className="text-center">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/10">
                    <ListChecks className="h-10 w-10 text-amber-500" />
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight">{steps[1].title}</h2>
                  <p className="mt-3 text-muted-foreground">{steps[1].description}</p>

                  <div className="mt-6 space-y-3">
                    {steps[1].features?.map((feature, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3 text-left"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <feature.icon className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Setup */}
              {currentStep === 2 && (
                <div>
                  <div className="text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-green-500/10">
                      <Sparkles className="h-10 w-10 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-semibold tracking-tight">{steps[2].title}</h2>
                    <p className="mt-3 text-muted-foreground">{steps[2].description}</p>
                  </div>

                  <div className="mt-6 space-y-4">
                    {/* Work Postcode */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Work Location (optional)</label>
                      <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="e.g., EC2A 4NE"
                          value={workPostcode}
                          onChange={(e) => setWorkPostcode(e.target.value.toUpperCase())}
                          className="flex-1 bg-transparent text-base uppercase outline-none placeholder:normal-case placeholder:text-muted-foreground/60"
                        />
                        {postcodeStatus === "checking" && (
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        {postcodeStatus === "valid" && (
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/10">
                            <Check className="h-3 w-3 text-green-600" />
                          </div>
                        )}
                      </div>
                      {postcodeStatus === "valid" && (
                        <p className="text-xs text-green-600">Location saved for commute calculations</p>
                      )}
                    </div>

                    {/* Sample Data */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Sample Data</label>
                      <Button
                        variant={samplesLoaded ? "outline" : "secondary"}
                        onClick={handleLoadSamples}
                        disabled={loadingSamples || samplesLoaded}
                        className="w-full gap-2"
                      >
                        {loadingSamples ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : samplesLoaded ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        {samplesLoaded ? "Sample Properties Loaded" : "Load Sample Properties"}
                      </Button>
                      <p className="text-center text-xs text-muted-foreground">
                        Try out the app with 4 pre-filled London properties
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex items-center gap-3">
            {currentStep > 0 && (
              <Button
                variant="ghost"
                onClick={() => setCurrentStep((s) => s - 1)}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            )}
            <div className="flex-1" />
            {canProceed ? (
              <Button onClick={() => setCurrentStep((s) => s + 1)} className="gap-2">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="gap-2">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Skip button */}
        {!isLastStep && (
          <button
            onClick={handleComplete}
            className="mx-auto mt-4 block text-sm text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      const onboarded = localStorage.getItem(ONBOARDING_KEY);
      if (!onboarded) {
        // Check if user already has properties (returning user)
        const propertyCount = await db.properties.count();
        // Only show onboarding for truly new users with no properties
        if (propertyCount === 0) {
          // Small delay for smoother initial render
          setTimeout(() => setShowOnboarding(true), 300);
        } else {
          // User has properties, mark as onboarded
          localStorage.setItem(ONBOARDING_KEY, "true");
        }
      }
      setChecked(true);
    };
    checkOnboarding();
  }, []);

  const completeOnboarding = () => {
    setShowOnboarding(false);
    localStorage.setItem(ONBOARDING_KEY, "true");
  };

  return { showOnboarding, completeOnboarding, checked };
}
