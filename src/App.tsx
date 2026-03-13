import React, { useState, useEffect, useRef, useCallback } from "react";
import { Routes, Route } from "react-router-dom";
import Leaderboard from "./pages/Leaderboard";
import Admin from "./pages/Admin";
import { fetchStats } from "./api/github";
import { AppData } from "./types";
import { NavBar } from "./components/layout/NavBar";
import { Footer } from "./components/layout/Footer";
import { useSEO } from "./hooks/useSEO";

const POLL_INTERVAL = 10000;
const STALE_LOCK_DURATION = 35000;

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastJsonRef = useRef("");
  const skipFetchUntilRef = useRef(0);

  useSEO(data?.config?.seo);

  const loadData = useCallback(async (silent = false) => {
    if (silent && Date.now() < skipFetchUntilRef.current) return;

    if (!silent) {
      setLoading(true);
      setError(null);
    }

    try {
      const db = await fetchStats();
      const json = JSON.stringify(db);
      if (json !== lastJsonRef.current) {
        lastJsonRef.current = json;
        setData(db);
      }
    } catch (err: any) {
      if (!silent) {
        setError(err.message || "Failed to fetch data.");
        setData(null);
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const handleLocalUpdate = useCallback((newData: AppData) => {
    const json = JSON.stringify(newData);
    lastJsonRef.current = json;
    setData(newData);
    skipFetchUntilRef.current = Date.now() + STALE_LOCK_DURATION;
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(() => loadData(true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#0a0a0a] text-[#f5f5f5]">
      <NavBar clubName={data?.config?.club} logoUrl={data?.config?.logoUrl} />
      <main className="flex-1 w-full max-w-275 mx-auto px-4 sm:px-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-text-muted">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
              <div className="text-xs font-bold uppercase tracking-widest">
                Loading...
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="text-red-400 font-bold mb-2 uppercase tracking-widest">
                Error
              </div>
              <div className="text-text-muted text-sm mb-6">{error}</div>
              <button
                onClick={() => loadData()}
                className="px-6 py-2 bg-brand-red hover:bg-brand-red-dark text-white rounded-lg text-sm font-bold uppercase tracking-widest transition-all"
              >
                Retry
              </button>
            </div>
          </div>
        ) : data ? (
          <Routes>
            <Route path="/" element={<Leaderboard data={data} />} />
            <Route
              path="/admin"
              element={
                <Admin data={data} onLocalDataUpdate={handleLocalUpdate} />
              }
            />
          </Routes>
        ) : null}
      </main>
      <Footer social={data?.config?.social} config={data?.config} />
    </div>
  );
}
