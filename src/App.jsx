import { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import { fetchStats } from './api/github';

const POLL_INTERVAL = 10000; // 10 seconds

function NavBar({ clubName }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 bg-[#0d0d0d] border-b-[3px] border-brand-red">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-[56px] sm:h-[60px] flex items-center justify-between">
        <Link to="/" className="font-display font-black text-[1.1rem] sm:text-[1.3rem] tracking-wider uppercase text-paper no-underline">
          <span className="text-brand-red">{clubName ? clubName.split(' ')[0] : 'Time'}</span> {clubName ? clubName.split(' ').slice(1).join(' ') : 'Trials'}
        </Link>
        <nav className="flex gap-4 sm:gap-6 items-center">
          {!isAdmin ? (
            <>
              <Link to="/admin" className="font-display font-bold text-[0.75rem] sm:text-[0.85rem] tracking-widest uppercase text-[#0d0d0d] bg-brand-red px-3 py-1.5 rounded-xs transition-colors hover:bg-brand-red-dark hover:text-paper">
                Admin ↗
              </Link>
            </>
          ) : (
            <Link to="/" className="font-display font-bold text-[0.75rem] sm:text-[0.85rem] tracking-widest text-text-muted border-b-2 border-transparent hover:text-paper transition-colors">
              ← Back
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const lastJsonRef = useRef('');

  const loadData = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const db = await fetchStats();
      const json = JSON.stringify(db);
      // Only update state if data actually changed (prevents unnecessary re-renders)
      if (json !== lastJsonRef.current) {
        lastJsonRef.current = json;
        setData(db);
      }
      setIsLive(true);
    } catch (err) {
      if (!silent) {
        setError(err.message || 'Failed to fetch data.');
        setData(null);
      }
      setIsLive(false);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Poll every 10 seconds for live updates
    const interval = setInterval(() => loadData(true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#0a0a0a] text-[#f5f5f5]">
      <NavBar clubName={data?.config?.club} />
      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 sm:px-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-text-muted">
            Loading timing records...
          </div>
        ) : error ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="text-red-400 font-bold mb-2">Failed to load data</div>
              <div className="text-text-muted text-sm">{error}</div>
              <button 
                onClick={() => loadData()}
                className="mt-4 px-4 py-2 bg-brand-red hover:bg-brand-red-dark text-white rounded-lg text-sm font-bold"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Leaderboard data={data} isLive={isLive} />} />
            <Route path="/admin" element={<Admin data={data} reloadData={() => loadData()} />} />
          </Routes>
        )}
      </main>
    </div>
  );
}

export default App;
