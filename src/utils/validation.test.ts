import { describe, it, expect } from "vitest";
import {
  ConfigSchema,
  RunnerSchema,
  EditionSchema,
  EntrySchema,
} from "./validation";

describe("Validation Schemas", () => {
  it("should validate config schema when all required fields are present", () => {
    const validConfig = {
      club: "Test Club",
      season: "Season 1",
      distance: "5K",
      location: "Local Track",
      logoUrl: "",
      coverPhotoUrl: "",
      googleForm: "",
      description: "Fun time trials",
      social: {},
      seo: {
        title: "Title",
        description: "Desc",
        keywords: "racing",
        ogImage: "",
      },
    };

    expect(() => ConfigSchema.parse(validConfig)).not.toThrow();
  });

  it("should throw when config is missing required fields", () => {
    const invalidConfig = {
      club: "Test Club",
      season: "Season 1",
      distance: "5K",
      // missing location
      coverPhotoUrl: "",
      googleForm: "",
      description: "",
      social: {},
      seo: {
        title: "Title",
        description: "Desc",
        keywords: "racing",
        ogImage: "",
      },
    } as any;

    expect(() => ConfigSchema.parse(invalidConfig)).toThrow();
  });

  it("should validate runner schema when gender is M or F", () => {
    expect(() =>
      RunnerSchema.parse({ id: "r1", name: "Alex", gender: "M" }),
    ).not.toThrow();
    expect(() =>
      RunnerSchema.parse({ id: "r2", name: "Jamie", gender: "F" }),
    ).not.toThrow();
  });

  it("should throw when runner schema has invalid gender", () => {
    expect(() =>
      RunnerSchema.parse({ id: "r3", name: "Taylor", gender: "X" }),
    ).toThrow();
  });

  it("should validate entry schema when status is ok/dns/dnf", () => {
    expect(() =>
      EntrySchema.parse({
        id: "e1",
        editionId: "ed1",
        runnerId: "r1",
        time: "20:00",
        status: "ok",
      }),
    ).not.toThrow();
    expect(() =>
      EntrySchema.parse({
        id: "e2",
        editionId: "ed1",
        runnerId: "r1",
        time: "",
        status: "dns",
      }),
    ).not.toThrow();
  });

  it("should throw when entry schema has invalid status", () => {
    expect(() =>
      EntrySchema.parse({
        id: "e3",
        editionId: "ed1",
        runnerId: "r1",
        time: "20:00",
        status: "invalid",
      }),
    ).toThrow();
  });
});
