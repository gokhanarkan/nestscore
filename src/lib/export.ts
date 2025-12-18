import type { Property, Settings } from "@/types";
import { CATEGORIES } from "./constants";
import { calculatePropertyScore } from "./scoring";

export function exportToCSV(properties: Property[], settings: Settings): string {
  const headers = [
    "Name",
    "Address",
    "Postcode",
    "Price",
    "Agent",
    "Overall Score",
    ...CATEGORIES.filter((c) => c.defaultWeight > 0).map((c) => c.name),
    "Notes",
    "Created",
  ];

  const rows = properties.map((property) => {
    const score = calculatePropertyScore(property, settings.weights);
    const categoryScores = CATEGORIES.filter((c) => c.defaultWeight > 0).map((category) => {
      const cs = score.categoryScores.find((s) => s.categoryId === category.id);
      return cs?.score ?? "";
    });

    return [
      escapeCSV(property.name),
      escapeCSV(property.address),
      escapeCSV(property.postcode),
      property.price || "",
      escapeCSV(property.agent || ""),
      score.overallScore,
      ...categoryScores,
      escapeCSV(property.notes),
      property.createdAt.toISOString().split("T")[0],
    ];
  });

  return [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
}

function escapeCSV(value: string): string {
  if (!value) return "";
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
