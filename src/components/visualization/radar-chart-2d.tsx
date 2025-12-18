import { useMemo } from "react";
import type { CategoryScore } from "@/types";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface RadarChart2DProps {
  scores: CategoryScore[];
  size?: number;
  className?: string;
}

export function RadarChart2D({ scores, size = 200, className }: RadarChart2DProps) {
  const categories = CATEGORIES.filter((c) => c.defaultWeight > 0);
  const count = categories.length;
  const center = size / 2;
  const radius = (size / 2) * 0.7;

  const { points, gridLines, axisLines, labels } = useMemo(() => {
    const angleStep = (Math.PI * 2) / count;
    const pts: string[] = [];
    const grids: string[][] = [[], [], [], []];
    const axes: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const lbls: { x: number; y: number; text: string; score: number }[] = [];

    categories.forEach((category, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const categoryScore = scores.find((s) => s.categoryId === category.id);
      const value = (categoryScore?.score ?? 0) / 100;

      const x = center + Math.cos(angle) * radius * Math.max(0.05, value);
      const y = center + Math.sin(angle) * radius * Math.max(0.05, value);
      pts.push(`${x},${y}`);

      [0.25, 0.5, 0.75, 1].forEach((scale, gi) => {
        const gx = center + Math.cos(angle) * radius * scale;
        const gy = center + Math.sin(angle) * radius * scale;
        grids[gi].push(`${gx},${gy}`);
      });

      axes.push({
        x1: center,
        y1: center,
        x2: center + Math.cos(angle) * radius,
        y2: center + Math.sin(angle) * radius,
      });

      const lx = center + Math.cos(angle) * (radius + 20);
      const ly = center + Math.sin(angle) * (radius + 20);
      lbls.push({
        x: lx,
        y: ly,
        text: category.name.split(" ")[0],
        score: categoryScore?.score ?? 0,
      });
    });

    return {
      points: pts.join(" "),
      gridLines: grids.map((g) => g.join(" ")),
      axisLines: axes,
      labels: lbls,
    };
  }, [scores, count, center, radius, categories]);

  return (
    <div className={cn("relative", className)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Grid circles */}
        {gridLines.map((line, i) => (
          <polygon
            key={i}
            points={line}
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-border"
            opacity={0.5}
          />
        ))}

        {/* Axis lines */}
        {axisLines.map((axis, i) => (
          <line
            key={i}
            x1={axis.x1}
            y1={axis.y1}
            x2={axis.x2}
            y2={axis.y2}
            stroke="currentColor"
            strokeWidth="1"
            className="text-border"
          />
        ))}

        {/* Score polygon */}
        <polygon
          points={points}
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="2"
          className="text-primary transition-all duration-500"
        />

        {/* Score dots */}
        {points.split(" ").map((point, i) => {
          const [x, y] = point.split(",").map(Number);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="4"
              fill="currentColor"
              className="text-primary"
            />
          );
        })}
      </svg>

      {/* Labels */}
      {labels.map((label, i) => (
        <div
          key={i}
          className="absolute text-xs text-muted-foreground whitespace-nowrap"
          style={{
            left: label.x,
            top: label.y,
            transform: "translate(-50%, -50%)",
          }}
        >
          <span className="block text-center">{label.text}</span>
          <span className="block text-center font-medium text-foreground">{label.score}</span>
        </div>
      ))}
    </div>
  );
}
