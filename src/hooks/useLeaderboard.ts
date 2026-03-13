import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AppData, Gender, Edition, Entry } from "../types";
import { parseTimeToSeconds, formatPace } from "../utils/time";

export function useLeaderboard(data: AppData) {
  const { config, editions, entries, runners } = data;
  const distanceKm = parseFloat(config.distance) || 5;
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("");
  const [activeCategory, setActiveCategory] = useState<Gender | "all">("all");

  const sortedEditions = useMemo(() => {
    return [...editions].sort((a, b) => {
      if (!a.date || !b.date) return b.num - a.num;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [editions]);

  const effectiveTab = activeTab || sortedEditions[0]?.id || "";

  const highlightedId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("runner");
  }, [location.search]);

  useEffect(() => {
    if (highlightedId) {
      setTimeout(() => {
        const el = document.getElementById(highlightedId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 500);
    }
  }, [highlightedId]);

  const overallPerformances = useMemo(() => {
    const pbs: Record<
      string,
      { time: string; secs: number; date: string; id: string }
    > = {};

    entries.forEach((entry) => {
      const runner = runners.find((r) => r.id === entry.runnerId);
      if (!runner) return;
      if (activeCategory !== "all" && runner.gender !== activeCategory) return;

      const secs = parseTimeToSeconds(entry.time);
      if (entry.status !== "ok" || secs === 999999) return;

      const ed = editions.find((e) => e.id === entry.editionId);
      const dateStr = ed?.date || "";

      if (!pbs[entry.runnerId] || secs < pbs[entry.runnerId].secs) {
        pbs[entry.runnerId] = {
          time: entry.time,
          secs,
          date: dateStr,
          id: entry.runnerId,
        };
      }
    });

    return Object.values(pbs).sort((a, b) => a.secs - b.secs);
  }, [entries, runners, activeCategory, editions]);

  const currentEntries = useMemo(() => {
    if (effectiveTab === "overall") return [];

    return entries
      .filter((e) => e.editionId === effectiveTab)
      .filter((e) => {
        if (activeCategory === "all") return true;
        const runner = runners.find((r) => r.id === e.runnerId);
        return runner?.gender === activeCategory;
      })
      .sort((a, b) => {
        const sA = a.status === "ok" ? parseTimeToSeconds(a.time) : 1000000;
        const sB = b.status === "ok" ? parseTimeToSeconds(b.time) : 1000000;
        return sA - sB;
      });
  }, [entries, effectiveTab, runners, activeCategory]);

  const stats = useMemo(() => {
    const validTimes = entries
      .filter((e) => e.status === "ok")
      .map((e) => parseTimeToSeconds(e.time))
      .filter((s) => s !== 999999);

    if (validTimes.length === 0) return { avg: "—", total: 0, runners: 0 };

    const avgSecs = validTimes.reduce((a, b) => a + b, 0) / validTimes.length;
    return {
      avg: formatPace(avgSecs, distanceKm),
      total: entries.length,
      runners: runners.length,
    };
  }, [entries, distanceKm, runners]);

  return {
    activeTab: effectiveTab,
    setActiveTab,
    activeCategory,
    setActiveCategory,
    highlightedId,
    sortedEditions,
    overallPerformances,
    currentEntries,
    stats,
    distanceKm,
  };
}
