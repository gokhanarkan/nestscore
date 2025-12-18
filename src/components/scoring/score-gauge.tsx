import { cn } from "@/lib/utils";
import { getScoreColor, getScoreLabel } from "@/lib/scoring";

interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

export function ScoreGauge({ score, size = "md", showLabel = false, className }: ScoreGaugeProps) {
  const dimensions = {
    sm: { size: 48, stroke: 4, fontSize: "text-sm" },
    md: { size: 72, stroke: 5, fontSize: "text-xl" },
    lg: { size: 120, stroke: 8, fontSize: "text-3xl" },
  };

  const { size: d, stroke, fontSize } = dimensions[size];
  const radius = (d - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const color = getScoreColor(score);

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className="relative" style={{ width: d, height: d }}>
        <svg width={d} height={d} className="-rotate-90">
          <circle
            cx={d / 2}
            cy={d / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-muted/30"
          />
          <circle
            cx={d / 2}
            cy={d / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-semibold", fontSize)}>{score}</span>
        </div>
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground">{getScoreLabel(score)}</span>
      )}
    </div>
  );
}
