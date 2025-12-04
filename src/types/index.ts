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


