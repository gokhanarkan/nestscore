import type { Property, CategoryScore, PropertyScore } from "@/types";
import { CATEGORIES } from "./constants";

export function calculateCategoryScore(
  categoryId: string,
  answers: Record<string, string | boolean | number>
): CategoryScore {
  const category = CATEGORIES.find((c) => c.id === categoryId);
  if (!category) {
    return { categoryId, score: 0, answeredCount: 0, totalCount: 0 };
  }

  let totalScore = 0;
  let answeredCount = 0;

  for (const question of category.questions) {
    const answer = answers[question.id];
    if (answer === undefined || answer === "") continue;

    answeredCount++;

    if (question.type === "boolean") {
      totalScore += answer === true ? 100 : 0;
    } else if (question.type === "select" && question.options) {
      const option = question.options.find((o) => o.value === answer);
      if (option) {
        totalScore += option.score;
      }
    } else if (question.type === "slider") {
      // For slider questions (like service charge), lower is better
      // Normalize inversely: max value = 0 score, min value = 100 score
      const min = question.min ?? 0;
      const max = question.max ?? 100;
      const value = typeof answer === "number" ? answer : parseFloat(String(answer));
      if (!isNaN(value)) {
        const normalized = 100 - ((value - min) / (max - min)) * 100;
        totalScore += Math.max(0, Math.min(100, normalized));
      }
    }
  }

  const score = answeredCount > 0 ? Math.round(totalScore / answeredCount) : 0;

  return {
    categoryId,
    score,
    answeredCount,
    totalCount: category.questions.length,
  };
}

export function calculateOverallScore(
  answers: Record<string, string | boolean | number>,
  weights: Record<string, number>
): PropertyScore {
  const categoryScores: CategoryScore[] = [];
  let weightedSum = 0;
  let totalWeight = 0;

  for (const category of CATEGORIES) {
    const categoryScore = calculateCategoryScore(category.id, answers);
    categoryScores.push(categoryScore);

    const weight = weights[category.id] ?? category.defaultWeight;
    if (weight > 0 && categoryScore.answeredCount > 0) {
      weightedSum += categoryScore.score * weight;
      totalWeight += weight;
    }
  }

  const overallScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;

  return {
    propertyId: 0,
    overallScore,
    categoryScores,
  };
}

export function calculatePropertyScore(
  property: Property,
  weights: Record<string, number>
): PropertyScore {
  const result = calculateOverallScore(property.answers, weights);
  return { ...result, propertyId: property.id ?? 0 };
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "var(--score-excellent)";
  if (score >= 60) return "var(--score-good)";
  if (score >= 40) return "var(--score-fair)";
  return "var(--score-poor)";
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
}

export function getCompletionPercentage(
  answers: Record<string, string | boolean | number>
): number {
  const totalQuestions = CATEGORIES.reduce((sum, c) => sum + c.questions.length, 0);
  const answeredQuestions = Object.keys(answers).filter(
    (key) => answers[key] !== undefined && answers[key] !== ""
  ).length;
  return Math.round((answeredQuestions / totalQuestions) * 100);
}
