import { useState, useEffect } from "react";
import type { CategoryScore } from "@/types";
import { RadarChart3D } from "./radar-chart-3d";
import { RadarChart2D } from "./radar-chart-2d";
import { cn } from "@/lib/utils";

interface ScoreRadarProps {
  scores: CategoryScore[];
  size?: number;
  prefer3D?: boolean;
  className?: string;
}

export function ScoreRadar({ scores, size = 280, prefer3D = true, className }: ScoreRadarProps) {
  const [use3D, setUse3D] = useState(false);

  useEffect(() => {
    // Check if WebGL is available and device can handle 3D
    if (!prefer3D) return;

    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      // Use 3D only on desktop with WebGL support
      setUse3D(!!gl && !isMobile);
    } catch {
      setUse3D(false);
    }
  }, [prefer3D]);

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {use3D ? (
        <RadarChart3D scores={scores} size={size} animate />
      ) : (
        <RadarChart2D scores={scores} size={size} />
      )}
    </div>
  );
}
