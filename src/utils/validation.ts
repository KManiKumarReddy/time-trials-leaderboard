import { z } from "zod";

export const ConfigSchema = z.object({
  club: z.string(),
  season: z.string(),
  distance: z.string(),
  logoUrl: z.string().optional(),
  location: z.string(),
  coverPhotoUrl: z.string(),
  googleForm: z.string(),
  description: z.string(),
  social: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    youtube: z.string().optional(),
    website: z.string().optional(),
    email: z.string().optional(),
    affiliation: z.string().optional(),
    affiliationUrl: z.string().optional(),
  }),
  seo: z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.string(),
    ogImage: z.string(),
  }),
});

export const RunnerSchema = z.object({
  id: z.string(),
  name: z.string(),
  gender: z.enum(["M", "F"]),
});

export const EditionSchema = z.object({
  id: z.string(),
  num: z.number(),
  date: z.string(),
  location: z.string(),
});

export const EntrySchema = z.object({
  id: z.string(),
  editionId: z.string(),
  runnerId: z.string(),
  time: z.string(),
  status: z.enum(["ok", "dns", "dnf"]),
});

export const AppDataSchema = z.object({
  config: ConfigSchema,
  runners: z.array(RunnerSchema),
  editions: z.array(EditionSchema),
  entries: z.array(EntrySchema),
});
