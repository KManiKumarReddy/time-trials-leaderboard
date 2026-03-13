import { describe, it, expect } from "vitest";
import { normalizeData, denormalizeData, isDeepEqual } from "./data";
import { AppData } from "../types";

const mockData: AppData = {
  config: {
    club: "LB Nagar Runners",
    season: "Season 2",
    distance: "5K",
    location: "Scholar's World School",
    googleForm: "",
    coverPhotoUrl: "",
    description: "",
    seo: { title: "", description: "", keywords: "", ogImage: "" },
    social: {},
  },
  runners: [
    { id: "r1", name: "Dharma", gender: "M" },
    { id: "r2", name: "Radhika", gender: "F" },
  ],
  editions: [
    { id: "ed9", num: 9, date: "2024-03-01", location: "Location 1" },
    { id: "ed10", num: 10, date: "2024-03-14", location: "Location 2" },
  ],
  entries: [
    { id: "e1", editionId: "ed9", runnerId: "r1", time: "20:04", status: "ok" },
    { id: "e2", editionId: "ed9", runnerId: "r2", time: "37:03", status: "ok" },
  ],
};

describe("Data Normalization", () => {
  it("should normalize array data into maps when valid AppData is provided", () => {
    const normalized = normalizeData(mockData);

    expect(normalized.runners["r1"]).toEqual(mockData.runners[0]);
    expect(normalized.editions["ed9"]).toEqual(mockData.editions[0]);
    expect(normalized.entries["e1"]).toEqual(mockData.entries[0]);
    expect(normalized.editionOrder).toEqual(["ed10", "ed9"]); // Sorted descending
  });

  it("should denormalize back to the same structure when normalized", () => {
    const normalized = normalizeData(mockData);
    const denormalized = denormalizeData(normalized);

    // Sort orders might differ in arrays, so we check contents
    expect(denormalized.config).toEqual(mockData.config);
    expect(denormalized.runners).toContainEqual(mockData.runners[0]);
    expect(denormalized.runners).toContainEqual(mockData.runners[1]);
  });

  it("should correctly detect deep equality for nested objects", () => {
    const objA = { a: 1, b: { c: 2, d: [3, 4] } };
    const objB = { a: 1, b: { c: 2, d: [3, 4] } };
    const objC = { a: 1, b: { c: 99, d: [3, 4] } };

    expect(isDeepEqual(objA, objB)).toBe(true);
    expect(isDeepEqual(objA, objC)).toBe(false);
  });
});
