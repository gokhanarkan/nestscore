import { useMemo } from "react";
import type { CategoryScore } from "@/types";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { getScoreColor } from "@/lib/scoring";

interface RadarChart2DProps {
  scores: CategoryScore[];
  size?: number;
  showLabels?: boolean;
  className?: string;
}

export function RadarChart2D({ scores, size = 200, showLabels = true, className }: RadarChart2DProps) {
  const categories = CATEGORIES.filter((c) => c.defaultWeight > 0);
  const count = categories.length;
  const padding = showLabels ? 45 : 10;
  const chartSize = size - padding * 2;
  const center = size / 2;
  const radius = chartSize / 2;

  const { points, gridLines, axisLines, labels, pointsArray } = useMemo(() => {
    const angleStep = (Math.PI * 2) / count;
    const pts: string[] = [];
    const ptsArray: { x: number; y: number; score: number }[] = [];
    const grids: string[][] = [[], [], [], [], []];
    const axes: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const lbls: { x: number; y: number; text: string; score: number; angle: number }[] = [];

    categories.forEach((category, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const categoryScore = scores.find((s) => s.categoryId === category.id);
      const value = (categoryScore?.score ?? 0) / 100;

      const x = center + Math.cos(angle) * radius * Math.max(0.08, value);
      const y = center + Math.sin(angle) * radius * Math.max(0.08, value);
      pts.push(`${x},${y}`);
      ptsArray.push({ x, y, score: categoryScore?.score ?? 0 });

      [0.2, 0.4, 0.6, 0.8, 1].forEach((scale, gi) => {
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

      if (showLabels) {
        const labelRadius = radius + 25;
        const lx = center + Math.cos(angle) * labelRadius;
        const ly = center + Math.sin(angle) * labelRadius;
        lbls.push({
          x: lx,
          y: ly,
          text: category.name.length > 10 ? category.name.split(" ")[0] : category.name,
          score: categoryScore?.score ?? 0,
          angle,
        });
      }
    });

    return {
      points: pts.join(" "),
      pointsArray: ptsArray,
      gridLines: grids.map((g) => g.join(" ")),
      axisLines: axes,
      labels: lbls,
    };
  }, [scores, count, center, radius, categories, showLabels]);

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid circles */}
        {gridLines.map((line, i) => (
          <polygon
            key={i}
            points={line}
            fill="none"
            stroke="currentColor"
            strokeWidth={i === gridLines.length - 1 ? "1.5" : "1"}
            className="text-border/40"
            strokeDasharray={i < gridLines.length - 1 ? "2,4" : undefined}
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
            className="text-border/30"
          />
        ))}

        {/* Score polygon fill */}
        <polygon
          points={points}
          fill="url(#radarGradient)"
          className="transition-all duration-300 ease-out"
        />

        {/* Score polygon stroke */}
        <polygon
          points={points}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinejoin="round"
          className="transition-all duration-300 ease-out"
          filter="url(#glow)"
        />

        {/* Score dots */}
        {pointsArray.map((point, i) => (
          <g key={i}>
            <circle
              cx={point.x}
              cy={point.y}
              r="6"
              fill="hsl(var(--background))"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              className="transition-all duration-300 ease-out"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="3"
              fill="hsl(var(--primary))"
              className="transition-all duration-300 ease-out"
            />
          </g>
        ))}
      </svg>

      {/* Labels */}
      {labels.map((label, i) => {
        const isTop = label.angle < 0;
        return (
          <div
            key={i}
            className="absolute flex flex-col items-center gap-0.5"
            style={{
              left: label.x,
              top: label.y,
              transform: `translate(-50%, ${isTop ? "-100%" : "0%"})`,
            }}
          >
            <span
              className="text-[10px] font-medium leading-tight text-muted-foreground"
              style={{ textAlign: "center" }}
            >
              {label.text}
            </span>
            <span
              className="text-xs font-semibold tabular-nums"
              style={{ color: getScoreColor(label.score) }}
            >
              {label.score}
            </span>
          </div>
        );
      })}
    </div>
  );
}
