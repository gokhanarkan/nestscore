import { useState } from "react";
import type { Category } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
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

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <Card className={cn("transition-all", open && "ring-1 ring-primary/20")}>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{category.name}</p>
                  <span className="text-sm font-medium">{score}</span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <Progress value={completion} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground">
                    {answeredCount}/{category.questions.length}
                  </span>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "h-5 w-5 text-muted-foreground transition-transform",
                  open && "rotate-180"
                )}
              />
            </CardContent>
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t border-border px-4 py-4 space-y-4">
            {category.questions.map((question) => (
              <div key={question.id} className="space-y-2">
                <Label htmlFor={question.id} className="text-sm">
                  {question.label}
                  {question.critical && (
                    <span className="ml-1 text-primary">*</span>
                  )}
                </Label>

                {question.type === "select" && question.options && (
                  <Select
                    value={String(answers[question.id] ?? "")}
                    onValueChange={(value) => onAnswerChange(question.id, value)}
                  >
                    <SelectTrigger id={question.id}>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {question.type === "boolean" && (
                  <div className="flex gap-2">
                    {[
                      { value: true, label: "Yes" },
                      { value: false, label: "No" },
                    ].map((option) => (
                      <button
                        key={String(option.value)}
                        type="button"
                        onClick={() => onAnswerChange(question.id, option.value)}
                        className={cn(
                          "flex-1 rounded-lg border py-2 text-sm font-medium transition-all",
                          answers[question.id] === option.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}

                {question.type === "slider" && (
                  <div className="space-y-2">
                    <Slider
                      id={question.id}
                      min={question.min ?? 0}
                      max={question.max ?? 100}
                      step={question.step ?? 1}
                      value={[Number(answers[question.id]) || question.min || 0]}
                      onValueChange={([value]) => onAnswerChange(question.id, value)}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {question.unit}
                        {question.min ?? 0}
                      </span>
                      <span className="font-medium text-foreground">
                        {question.unit}
                        {Number(answers[question.id]) || question.min || 0}
                      </span>
                      <span>
                        {question.unit}
                        {question.max ?? 100}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
