export type SocialCategory = "healthcare" | "culture" | "social";

export interface SocialObject {
  id: string;
  name: string;
  category: SocialCategory;
  description: string;
  address: string;
  coordinates: [number, number]; // [lat, lon]
  accessibilityNotes: string[];
}


