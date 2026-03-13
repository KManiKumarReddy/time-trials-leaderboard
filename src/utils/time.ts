/**
 * Parses time string (MM:SS or HH:MM:SS) to total seconds
 */
export const parseTimeToSeconds = (timeStr: string): number => {
  if (!timeStr) return 999999;
  const parts = String(timeStr).trim().split(/[:.]+/).map(Number);

  if (parts.length === 2) {
    const m = parts[0];
    const s = parts[1];
    if (m !== undefined && s !== undefined && !isNaN(m) && !isNaN(s)) {
      return m * 60 + s;
    }
  }

  if (parts.length === 3) {
    const h = parts[0];
    const m = parts[1];
    const s = parts[2];
    if (
      h !== undefined &&
      m !== undefined &&
      s !== undefined &&
      !isNaN(h) &&
      !isNaN(m) &&
      !isNaN(s)
    ) {
      return h * 3600 + m * 60 + s;
    }
  }

  if (parts.length === 1) {
    const m = parts[0];
    if (m !== undefined && !isNaN(m)) {
      return m * 60;
    }
  }

  return 999999;
};

/**
 * Formats pace based on total seconds and distance
 */
export const formatPace = (
  totalSecs: number,
  distanceKm: number = 5,
): string => {
  if (totalSecs >= 999999) return "—";
  const paceTotalSecs = totalSecs / distanceKm;
  const mm = Math.floor(paceTotalSecs / 60);
  const ss = Math.round(paceTotalSecs % 60);
  return `${mm}:${ss.toString().padStart(2, "0")}`;
};
