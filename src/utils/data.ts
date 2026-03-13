import { AppData, NormalizedData, Runner, Edition, Entry } from "../types";

/**
 * Converts array-based AppData to map-based NormalizedData for performance
 */
export const normalizeData = (data: AppData): NormalizedData => {
  const runners = data.runners.reduce(
    (acc, r) => ({ ...acc, [r.id]: r }),
    {} as Record<string, Runner>,
  );
  const editions = data.editions.reduce(
    (acc, e) => ({ ...acc, [e.id]: e }),
    {} as Record<string, Edition>,
  );
  const entries = data.entries.reduce(
    (acc, ent) => ({ ...acc, [ent.id]: ent }),
    {} as Record<string, Entry>,
  );

  const editionOrder = [...data.editions]
    .sort((a, b) => b.num - a.num)
    .map((e) => e.id);

  return {
    config: data.config,
    runners,
    editions,
    entries,
    editionOrder,
  };
};

/**
 * Denormalizes data back to AppData for saving to Gist
 */
export const denormalizeData = (data: NormalizedData): AppData => {
  return {
    config: data.config,
    runners: Object.values(data.runners),
    editions: Object.values(data.editions),
    entries: Object.values(data.entries),
  };
};

/**
 * Fast deep quality check for data objects
 */
export const isDeepEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (
    typeof a !== "object" ||
    a === null ||
    typeof b !== "object" ||
    b === null
  )
    return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!keysB.includes(key) || !isDeepEqual(a[key], b[key])) return false;
  }

  return true;
};
