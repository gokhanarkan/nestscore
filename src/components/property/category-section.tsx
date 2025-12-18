import { useState } from "react";
import type { Category } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { getScoreColor } from "@/lib/scoring";
import {
  ChevronDown,
  MapPin,
  Store,
  Shield,
  Building2,
  Zap,
  Wifi,
  Leaf,
  Sofa,
  Trees,
  FileText,
  Check,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  MapPin,
  Store,
  Shield,
  Building2,
  Zap,
  Wifi,
  Leaf,
  Sofa,
  Trees,
  FileText,
};

interface CategorySectionProps {
  category: Category;
  answers: Record<string, string | boolean | number>;
  score: number;
  answeredCount: number;
  onAnswerChange: (questionId: string, value: string | boolean | number) => void;
}

export function CategorySection({
  category,
  answers,
  score,
  answeredCount,
  onAnswerChange,
}: CategorySectionProps) {
  const [open, setOpen] = useState(false);
  const Icon = iconMap[category.icon] ?? MapPin;
  const completion = Math.round((answeredCount / category.questions.length) * 100);
  const isComplete = answeredCount === category.questions.length;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className={cn(
        "border-0 shadow-sm transition-all duration-200",
        open && "ring-2 ring-primary/20"
      )}>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left focus:outline-none">
            <CardContent className="flex items-center gap-4 p-4 sm:p-5">
              <div className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                isComplete ? "bg-green-500/10" : "bg-primary/10"
              )}>
                <Icon className={cn(
                  "h-5 w-5",
                  isComplete ? "text-green-600" : "text-primary"
                )} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{category.name}</p>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-semibold tabular-nums"
                      style={{ color: getScoreColor(score) }}
                    >
                      {score}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        isComplete ? "bg-green-500" : "bg-primary"
                      )}
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {answeredCount}/{category.questions.length}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200",
                  open && "rotate-180"
                )}
              />
            </CardContent>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-border/50 px-4 py-4 sm:px-5 sm:py-5">
            <div className="space-y-5">
              {category.questions.map((question, index) => (
                  <div key={question.id} className="space-y-3">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                        {index + 1}
                      </span>
                      <p className="text-sm font-medium leading-tight">
                        {question.label}
                        {question.critical && (
                          <span className="ml-1 text-primary">*</span>
                        )}
                      </p>
                    </div>

                    {/* Select Question */}
                    {question.type === "select" && question.options && (
                      <div className="ml-7 grid gap-2 sm:grid-cols-2">
                        {question.options.map((option) => {
                          const isSelected = answers[question.id] === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => onAnswerChange(question.id, option.value)}
                              className={cn(
                                "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all",
                                isSelected
                                  ? "border-primary bg-primary/5 text-foreground"
                                  : "border-border bg-background hover:border-primary/40 hover:bg-muted/50"
                              )}
                            >
                              <div className={cn(
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                                isSelected
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground/30"
                              )}>
                                {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                              </div>
                              <span className={cn(
                                "font-medium",
                                isSelected ? "text-foreground" : "text-muted-foreground"
                              )}>
                                {option.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Boolean Question */}
                    {question.type === "boolean" && (
                      <div className="ml-7 flex gap-3">
                        {[
                          { value: true, label: "Yes" },
                          { value: false, label: "No" },
                        ].map((option) => {
                          const isSelected = answers[question.id] === option.value;
                          return (
                            <button
                              key={String(option.value)}
                              type="button"
                              onClick={() => onAnswerChange(question.id, option.value)}
                              className={cn(
                                "flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all sm:flex-none sm:min-w-24",
                                isSelected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-background hover:border-primary/40 hover:bg-muted/50"
                              )}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Slider Question */}
                    {question.type === "slider" && (
                      <div className="ml-7 space-y-3">
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            id={question.id}
                            min={question.min ?? 0}
                            max={question.max ?? 100}
                            step={question.step ?? 1}
                            value={Number(answers[question.id]) || question.min || 0}
                            onChange={(e) => onAnswerChange(question.id, Number(e.target.value))}
                            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md"
                          />
                          <div className="flex min-w-16 items-center justify-center rounded-lg bg-muted px-3 py-1.5">
                            <span className="text-sm font-semibold tabular-nums">
                              {question.unit}{Number(answers[question.id]) || question.min || 0}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{question.unit}{question.min ?? 0}</span>
                          <span>{question.unit}{question.max ?? 100}</span>
                        </div>
                      </div>
                    )}
                  </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
