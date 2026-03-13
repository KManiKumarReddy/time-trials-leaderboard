export type Gender = "M" | "F";
export type EntryStatus = "ok" | "dns" | "dnf";

export interface Runner {
  id: string;
  name: string;
  gender: Gender;
}

export interface Entry {
  id: string;
  editionId: string;
  runnerId: string;
  time: string;
  status: EntryStatus;
}

export interface Edition {
  id: string;
  num: number;
  date: string;
  location: string;
}

export interface Config {
  club: string;
  season: string;
  distance: string;
  logoUrl?: string;
  location: string;
  coverPhotoUrl: string;
  googleForm: string;
  description: string;
  social: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    website?: string;
    email?: string;
    affiliation?: string;
    affiliationUrl?: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string;
    ogImage: string;
  };
}

export interface AppData {
  config: Config;
  runners: Runner[];
  editions: Edition[];
  entries: Entry[];
}

// Normalized structure for O(1) lookups
export interface NormalizedData {
  config: Config;
  runners: Record<string, Runner>;
  editions: Record<string, Edition>;
  entries: Record<string, Entry>;
  editionOrder: string[]; // for maintaining display order
}
