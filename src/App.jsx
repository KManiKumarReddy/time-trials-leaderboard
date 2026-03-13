import { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Leaderboard from './pages/Leaderboard';
import Admin from './pages/Admin';
import { fetchStats } from './api/github';
import { Instagram, Facebook, Youtube, Twitter, Mail, Globe } from 'lucide-react';

const POLL_INTERVAL = 10000; // 10 seconds
const STALE_LOCK_DURATION = 35000; // 35 seconds to allow Gist CDN to clear

function NavBar({ clubName, logoUrl }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 bg-[#0d0d0d]/80 backdrop-blur-md border-b-[3px] border-brand-red">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 h-[56px] sm:h-[64px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 no-underline group">
          {logoUrl && (
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-white/5 border border-white/10 group-hover:border-brand-red/50 transition-colors">
              <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
            </div>
          )}
          <div className="font-display font-black text-[1rem] sm:text-[1.2rem] tracking-wider uppercase text-paper">
            <span className="text-brand-red">{clubName ? clubName.split(' ')[0] : 'Time'}</span> {clubName ? clubName.split(' ').slice(1).join(' ') : 'Trials'}
          </div>
        </Link>
        <nav className="flex gap-4 sm:gap-6 items-center">
          {!isAdmin ? (
            <>
              <Link to="/admin" className="font-display font-bold text-[0.7rem] sm:text-[0.8rem] tracking-widest uppercase text-[#0d0d0d] bg-brand-red px-3 py-1.5 rounded-sm transition-all hover:bg-brand-red-dark hover:text-paper hover:scale-105 active:scale-95">
                Admin ↗
              </Link>
            </>
          ) : (
            <Link to="/" className="font-display font-bold text-[0.7rem] sm:text-[0.8rem] tracking-widest text-text-muted border-b-2 border-transparent hover:text-paper hover:border-brand-red transition-all">
              ← View Leaderboard
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

function Footer({ social, config }) {
  const icons = {
    instagram: <Instagram size={18} />,
    facebook: <Facebook size={18} />,
    youtube: <Youtube size={18} />,
    twitter: <Twitter size={18} />,
    website: <Globe size={18} />,
    email: <Mail size={18} />
  };

  return (
    <footer className="bg-[#0d0d0d] border-t border-white/5 py-12 mt-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-brand-red/20 to-transparent" />
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {config?.logoUrl && <img src={config.logoUrl} alt="Logo" className="w-6 h-6 object-contain" />}
              <h3 className="font-display font-black text-2xl uppercase tracking-tighter italic">
                <span className="text-brand-red">{config?.club?.split(' ')[0] || 'LB'}</span> {config?.club?.split(' ').slice(1).join(' ') || 'Nagar Runners'}
              </h3>
            </div>
            <p className="text-text-muted text-sm max-w-sm leading-relaxed whitespace-pre-line">
              {config?.description}
            </p>
            {social?.affiliation && (
              <div className="pt-2">
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-text-muted mb-1">Affiliation</p>
                <a 
                  href={social.affiliationUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-white/60 hover:text-brand-red transition-colors"
                >
                  {social.affiliation}
                </a>
              </div>
            )}
          </div>

          <div className="space-y-6 md:text-right md:flex md:flex-col md:items-end">
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-text-muted mb-4 md:text-right">Connect with us</p>
              <div className="flex gap-4 md:justify-end">
                {Object.entries(social || {}).map(([key, url]) => {
                  if (icons[key]) {
                    return (
                      <a 
                        key={key}
                        href={key === 'email' ? `mailto:${url}` : url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-text-muted hover:text-brand-red hover:border-brand-red/50 hover:bg-brand-red/5 transition-all"
                        title={key}
                      >
                        {icons[key]}
                      </a>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
            <p className="text-[0.6rem] text-text-muted uppercase tracking-widest pt-4 opacity-50">
              © {new Date().getFullYear()} {config?.club}. Built for runners.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const lastJsonRef = useRef('');
  const skipFetchUntilRef = useRef(0);

  // SEO Update logic
  useEffect(() => {
    if (!data?.config?.seo) return;
    const { seo } = data.config;
    
    document.title = seo.title || 'Leaderboard';
    
    const updateMeta = (name, content, attr = 'name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    updateMeta('description', seo.description);
    updateMeta('keywords', seo.keywords);
    updateMeta('og:title', seo.title, 'property');
    updateMeta('og:description', seo.description, 'property');
    updateMeta('og:image', seo.ogImage, 'property');
    updateMeta('twitter:card', 'summary_large_image');
  }, [data]);

  const loadData = useCallback(async (silent = false) => {
    // Skip if we are in a "stale lock" period after a local update
    if (silent && Date.now() < skipFetchUntilRef.current) {
      return;
    }

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

  // Admin calls this to update local UI immediately and prevent fetching stale Gist data
  const handleLocalUpdate = useCallback((newData) => {
    const json = JSON.stringify(newData);
    lastJsonRef.current = json;
    setData(newData);
    // Lock fetching for 35 seconds to ensure we don't pull back stale data from CDN
    skipFetchUntilRef.current = Date.now() + STALE_LOCK_DURATION;
  }, []);

  useEffect(() => {
    loadData();

    // Poll every 10 seconds for live updates
    const interval = setInterval(() => loadData(true), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [loadData]);

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#0a0a0a] text-[#f5f5f5]">
      <NavBar clubName={data?.config?.club} logoUrl={data?.config?.logoUrl} />
      <main className="flex-1 w-full max-w-[1100px] mx-auto px-4 sm:px-6">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-text-muted">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
              <div className="text-xs font-bold uppercase tracking-widest">Loading...</div>
            </div>
          </div>
        ) : error ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <div className="text-red-400 font-bold mb-2 uppercase tracking-widest">Connection Error</div>
              <div className="text-text-muted text-sm mb-6">{error}</div>
              <button 
                onClick={() => loadData()}
                className="px-6 py-2 bg-brand-red hover:bg-brand-red-dark text-white rounded-lg text-sm font-bold uppercase tracking-widest transition-all"
              >
                Retry Fetch
              </button>
            </div>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={<Leaderboard data={data} isLive={isLive} />} />
            <Route 
              path="/admin" 
              element={
                <Admin 
                  data={data} 
                  reloadData={() => loadData()} 
                  onLocalDataUpdate={handleLocalUpdate}
                />
              } 
            />
          </Routes>
        )}
      </main>
      <Footer social={data?.config?.social} config={data?.config} />
    </div>
  );
}

export default App;
