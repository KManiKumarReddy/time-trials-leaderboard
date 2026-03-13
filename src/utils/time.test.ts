import { describe, it, expect } from "vitest";
import { parseTimeToSeconds, formatPace } from "./time";

describe("Time Utilities", () => {
  describe("parseTimeToSeconds", () => {
    it("should parse MM:SS format correctly when input is valid", () => {
      expect(parseTimeToSeconds("20:04")).toBe(1204);
      expect(parseTimeToSeconds("05:30")).toBe(330);
    });

    it("should parse HH:MM:SS format correctly when input includes hours", () => {
      expect(parseTimeToSeconds("01:20:05")).toBe(4805);
    });

    it("should return 999999 when input is empty or invalid", () => {
      expect(parseTimeToSeconds("")).toBe(999999);
      expect(parseTimeToSeconds("invalid")).toBe(999999);
    });

    it("should handle single number as minutes when input has no colon", () => {
      expect(parseTimeToSeconds("25")).toBe(1500);
    });
  });

  describe("formatPace", () => {
    it("should format pace correctly for 5K when given total seconds", () => {
      // 20:00 (1200s) / 5 = 4:00
      expect(formatPace(1200, 5)).toBe("4:00");
      // 25:00 (1500s) / 5 = 5:00
      expect(formatPace(1500, 5)).toBe("5:00");
    });

    it("should return a placeholder when passed DNS/DNF codes (999999)", () => {
      expect(formatPace(999999, 5)).toBe("—");
    });

    it("should handle fractional seconds when pacing", () => {
      // 22:30 (1350s) / 5 = 4:30
      expect(formatPace(1350, 5)).toBe("4:30");
    });
  });
});
