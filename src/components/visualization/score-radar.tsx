import type { CategoryScore } from "@/types";
import { RadarChart2D } from "./radar-chart-2d";
import { cn } from "@/lib/utils";

interface ScoreRadarProps {
  scores: CategoryScore[];
  size?: number;
  className?: string;
}

export function ScoreRadar({ scores, size = 280, className }: ScoreRadarProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <RadarChart2D scores={scores} size={size} />
    </div>
  );
}
