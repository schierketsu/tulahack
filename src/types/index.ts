export type SocialCategory = "healthcare" | "culture" | "social" | "market";

export type DisabilityType =
  | "vision" // с нарушениями зрения
  | "hearing" // с нарушениями слуха
  | "wheelchair" // передвигающихся на креслах-колясках
  | "mobility" // с нарушениями опорно-двигательного аппарата
  | "mental"; // с умственными нарушениями

export interface SocialObject {
  id: string;
  name: string;
  category: SocialCategory;
  description: string;
  address: string;
  coordinates: [number, number]; // [lat, lon]
  accessibilityNotes: string[];
  accessibility: {
    vision: boolean;
    hearing: boolean;
    wheelchair: boolean;
    mobility: boolean;
    mental: boolean;
  };
}

export interface User {
  id: number;
  nickname: string;
}

export interface UserStats {
  reviewCount: number;
  points: number;
}

export interface Review {
  id: number;
  rating: number;
  text: string;
  created_at: string;
  nickname?: string;
}

export interface ReviewSummary {
  count: number;
  avgRating: number;
}


