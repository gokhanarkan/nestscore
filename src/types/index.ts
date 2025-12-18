export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Property {
  id?: number;
  name: string;
  address: string;
  postcode: string;
  price: number;
  agent?: string;
  viewingDate?: string;
  answers: Record<string, string | boolean | number>;
  notes: string;
  images?: string[];
  coordinates?: Coordinates;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id: string;
  weights: Record<string, number>;
  workPostcode?: string;
  workCoordinates?: Coordinates;
  theme: "light" | "dark" | "system";
}

export type QuestionType = "select" | "boolean" | "slider";

export interface QuestionOption {
  value: string;
  label: string;
  score: number;
}

export interface Question {
  id: string;
  label: string;
  type: QuestionType;
  options?: QuestionOption[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  critical?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  defaultWeight: number;
  questions: Question[];
}

export interface CategoryScore {
  categoryId: string;
  score: number;
  answeredCount: number;
  totalCount: number;
}

export interface PropertyScore {
  propertyId: number;
  overallScore: number;
  categoryScores: CategoryScore[];
}
