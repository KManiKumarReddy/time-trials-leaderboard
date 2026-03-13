import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Trophy, Clock, Target, CalendarDays, Activity, Share2, Check, ExternalLink } from 'lucide-react';

function StatCard({ icon: Icon, value, label, highlight }) {
  return (
    <div className={`p-3 sm:p-5 rounded-2xl border border-border-subtle ${highlight ? 'bg-brand-red/10 border-brand-red/30 relative overflow-hidden' : 'bg-bg-card'}`}>
      {highlight && <div className="absolute inset-0 bg-gradient-to-br from-brand-red/20 to-transparent pointer-events-none" />}
      <div className="flex flex-col gap-1.5 sm:gap-2 relative">
        <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${highlight ? 'text-brand-red' : 'text-brand-gold'}`} />
        <div>
          <div className="font-display font-bold text-lg sm:text-2xl tracking-wide leading-tight truncate">{value || "—"}</div>
          <div className="text-[0.6rem] sm:text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mt-0.5 sm:mt-1">{label}</div>
        </div>
      </div>
    </div>
  );
}

function RunnerCard({ id, rank, name, time, pb, date, pace, isHighlighted }) {
  const [copied, setCopied] = useState(false);

  const handleShare = (e) => {
    e.stopPropagation();
    const url = new URL(window.location.href);
    url.searchParams.set('runner', id);
    const shareUrl = url.toString();

    if (navigator.share) {
      navigator.share({
        title: `${name}'s Time Trial Record`,
        text: `Check out ${name}'s ${time} run at the LB Nagar Runners Time Trial!`,
        url: shareUrl
      }).catch(() => {
        copyToClipboard(shareUrl);
      });
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rankColors = {
    1: 'text-brand-gold shadow-[0_0_20px_rgba(200,150,46,0.15)] border-brand-gold/30 bg-gradient-to-b from-brand-gold/5 to-transparent',
    2: 'text-[#C0C0C0] shadow-[0_0_20px_rgba(192,192,192,0.1)] border-[#C0C0C0]/20 bg-gradient-to-b from-[#C0C0C0]/5 to-transparent',
    3: 'text-[#CD7F32] shadow-[0_0_20px_rgba(205,127,50,0.1)] border-[#CD7F32]/20 bg-gradient-to-b from-[#CD7F32]/5 to-transparent'
  };

  const ringColors = {
    1: 'border-brand-gold',
    2: 'border-[#C0C0C0]',
    3: 'border-[#CD7F32]'
  };

  const isPodium = rank <= 3;

  return (
    <div 
      id={id}
      className={`flex items-center justify-between p-3 sm:p-5 rounded-xl border transition-all group relative ${
        isHighlighted 
          ? 'border-brand-red bg-brand-red/5 ring-1 ring-brand-red/50 shadow-[0_0_30px_rgba(255,0,0,0.1)]' 
          : isPodium 
            ? `${rankColors[rank]} border-border-subtle` 
            : 'bg-bg-card border-border-subtle hover:bg-bg-card-hover hover:border-white/10'
      }`}
    >
      {isHighlighted && (
        <div className="absolute -top-2 -left-2 bg-brand-red text-white text-[0.5rem] font-bold px-2 py-0.5 rounded tracking-widest uppercase z-10">
          Shared Record
        </div>
      )}

      <div className="flex items-center gap-3 sm:gap-6 overflow-hidden">
        <div className={`font-display font-black text-2xl sm:text-4xl italic transition-transform group-hover:scale-110 w-9 sm:w-12 text-center leading-none ${isPodium ? '' : 'text-text-muted/40'}`}>
          {rank > 0 ? rank.toString().padStart(2, '0') : '—'}
        </div>
        
        {/* Avatar ring */}
        <div className={`flex w-9 h-9 sm:w-12 sm:h-12 rounded-full border-2 items-center justify-center bg-[#1a1a1a] shrink-0 ${isPodium ? ringColors[rank] : 'border-[#333]'}`}>
          <span className="font-display font-bold text-sm sm:text-lg text-white/50">{name.charAt(0)}</span>
        </div>

        <div className="flex flex-col min-w-0">
          <div className="font-sans font-bold text-sm sm:text-lg tracking-tight text-white truncate">{name}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-8 text-right shrink-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 sm:gap-2 justify-end">
            <div className={`font-display font-black text-xl sm:text-3xl tracking-wide tabular-nums leading-none ${pb ? 'text-neon-accent' : 'text-white'}`}>
              {time}
            </div>
            {pb && <div className="text-[0.4rem] sm:text-[0.6rem] font-bold bg-neon-accent/20 text-neon-accent px-1 sm:px-1.5 py-0.5 rounded tracking-widest uppercase">PR</div>}
          </div>
          <div className="flex items-center justify-end gap-2 sm:gap-3 mt-1 sm:mt-1.5 text-[0.6rem] sm:text-[0.7rem] text-text-muted uppercase tracking-widest font-bold">
            <span className="hidden sm:inline">{date}</span>
            <span className="hidden sm:inline opacity-40">•</span>
            <span>{pace} <span className="lowercase">/km</span></span>
          </div>
        </div>

        <button 
          onClick={handleShare}
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
            copied ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-white/5 border border-white/10 text-text-muted hover:text-white hover:border-white/30'
          }`}
        >
          {copied ? <Check size={14} className="sm:w-4 sm:h-4" /> : <Share2 size={14} className="sm:w-4 sm:h-4" />}
        </button>
      </div>
    </div>
  );
}


const parseTime = (timeStr) => {
  if (!timeStr) return 999999;
  const parts = String(timeStr).trim().split(/[:.]+/).map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return parts[0] * 60 + parts[1];
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 1 && !isNaN(parts[0])) return parts[0] * 60;
  return 999999;
};

const formatPace = (totalSecs, distanceKm = 5) => {
  if (totalSecs >= 999999) return "—";
  const paceTotalSecs = totalSecs / distanceKm;
  const mm = Math.floor(paceTotalSecs / 60);
  const ss = Math.round(paceTotalSecs % 60);
  return `${mm}:${ss.toString().padStart(2, '0')}`;
};

export default function Leaderboard({ data, isLive }) {
  const [activeTab, setActiveTab] = useState('');
  const [activeCategory, setActiveCategory] = useState('all'); // 'all', 'M', 'F'
  const location = useLocation();
  const [highlightedId, setHighlightedId] = useState(null);

  // Defensive check
  if (!data) return null;

  const { config, editions, entries, runners } = data;
  const distanceKm = parseFloat(config.distance) || 5;

  // Map runnerId to name & gender helper
  const getRunnerInfo = (runnerId) => {
    return runners?.find(r => r.id === runnerId) || { name: "Unknown", gender: "M" };
  };

  // Sort Editions by date descending
  const sortedEditions = useMemo(() => {
    return [...(editions || [])].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [editions]);

  // Set default tab to latest edition if not set
  useEffect(() => {
    if (!activeTab && sortedEditions.length > 0) {
      setActiveTab(`ed-${sortedEditions[0].id}`);
    }
  }, [sortedEditions, activeTab]);

  // Check for runner ID in URL and also setup Tab based on it
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const runnerId = params.get('runner');
    if (runnerId) {
      setHighlightedId(runnerId);
      setTimeout(() => {
        const el = document.getElementById(runnerId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [location]);

  // Process data for overall standing (Personal Bests)
  const overallPerformances = useMemo(() => {
    const perfs = {};
    entries.forEach(entry => {
      if (entry.status !== 'ok') return;
      
      const totalSecs = parseTime(entry.time);
      if (totalSecs >= 999999) return;
      
      const runner = getRunnerInfo(entry.runnerId);
      if (activeCategory !== 'all' && runner.gender !== activeCategory) return;

      if (!perfs[runner.name] || totalSecs < perfs[runner.name].totalSecs) {
        perfs[runner.name] = {
          id: entry.id,
          runnerId: entry.runnerId,
          name: runner.name,
          gender: runner.gender,
          time: entry.time,
          totalSecs,
          editionId: entry.editionId
        };
      }
    });
    return Object.values(perfs).sort((a, b) => a.totalSecs - b.totalSecs);
  }, [entries, runners, activeCategory]);

  const courseRecord = overallPerformances[0]?.time || "—";
  const recordHolder = overallPerformances[0]?.name || "—";
  const uniqueRunnerCount = runners?.length || 0;

  const handleShareLeaderboard = () => {
    const url = window.location.origin + window.location.pathname;
    if (navigator.share) {
      navigator.share({
        title: `${config.club} Leaderboard`,
        text: `Check out the ${config.season} time trial records for ${config.club}!`,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="pb-24">
      {/* Hero Header */}
      <div className="py-8 sm:py-12 md:py-16">
        {config.coverPhotoUrl && (
          <div className="w-full h-44 sm:h-64 md:h-80 rounded-2xl overflow-hidden mb-6 sm:mb-10 shadow-[0_0_40px_rgba(0,0,0,0.3)] border border-border-subtle group relative bg-[#0d0d0d]">
            <img 
              src={config.coverPhotoUrl} 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30 scale-110" 
            />
            <img 
              src={config.coverPhotoUrl} 
              alt="Cover" 
              className="relative w-full h-full object-contain transition-transform duration-700 group-hover:scale-102" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
          </div>
        )}

        <div className="flex flex-col space-y-2 mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <div className="text-brand-red font-bold text-[0.65rem] sm:text-xs tracking-[0.2em] uppercase font-display">
              {config.distance} {config.location && `• ${config.location}`}
            </div>
            {isLive && (
              <div className="flex items-center gap-1 bg-green-900/30 border border-green-500/30 rounded-full px-2 py-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-[0.6rem] font-bold uppercase tracking-widest">Live</span>
              </div>
            )}
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl md:text-7xl uppercase italic tracking-tighter leading-none">
            <span className="text-white">{config.club || 'Time Trial'} </span>
            <span className="text-transparent" style={{ WebkitTextStroke: '2px #f5f5f5' }}>Leaderboard</span>
          </h1>
        </div>

        {config.description && (
          <p className="max-w-2xl text-text-muted text-sm md:text-base leading-relaxed mb-8 border-l-2 border-brand-red/30 pl-4 whitespace-pre-line">
            {config.description}
          </p>
        )}

        <div className="flex flex-wrap gap-4 mb-10">
          {config.googleForm && (
            <a href={config.googleForm} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-brand-red hover:bg-[#aa0000] text-white font-display font-bold px-6 sm:px-8 py-3 rounded-lg uppercase tracking-widest transition-all text-sm shadow-[0_4px_14px_rgba(255,0,0,0.2)]">
              Register Now <ExternalLink size={14} />
            </a>
          )}
          <button 
            onClick={handleShareLeaderboard}
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-display font-bold px-6 py-3 rounded-lg uppercase tracking-widest transition-all text-sm"
          >
            Share <Share2 size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500">
          <StatCard highlight icon={Activity} value={editions.length.toString()} label="Total Editions" />
          <StatCard icon={Target} value={uniqueRunnerCount.toString()} label="Runners" />
          <StatCard icon={Clock} value={courseRecord} label="Best Time" />
          <StatCard icon={Trophy} value={recordHolder} label="Record Holder" />
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-border-subtle mb-4 overflow-x-auto no-scrollbar mask-gradient-x sticky top-[56px] sm:top-[64px] bg-[#0a0a0a] z-40 py-2">
        {sortedEditions.slice(0, 1).map(ed => (
          <button 
            key={ed.id}
            onClick={() => setActiveTab(`ed-${ed.id}`)}
            className={`pb-3 px-3 mr-4 font-display font-bold text-xs sm:text-sm tracking-widest uppercase whitespace-nowrap transition-colors relative ${activeTab === `ed-${ed.id}` ? 'text-white' : 'text-text-muted hover:text-white/80'}`}
          >
            Latest (Ed. {ed.num})
            {activeTab === `ed-${ed.id}` && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-brand-red" />}
          </button>
        ))}

        <button 
          onClick={() => setActiveTab('overall')}
          className={`pb-3 px-3 mr-4 font-display font-bold text-xs sm:text-sm tracking-widest uppercase whitespace-nowrap transition-colors relative ${activeTab === 'overall' ? 'text-white' : 'text-text-muted hover:text-white/80'}`}
        >
          Overall Standings
          {activeTab === 'overall' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-brand-red" />}
        </button>

        {sortedEditions.slice(1).map(ed => (
          <button 
            key={ed.id}
            onClick={() => setActiveTab(`ed-${ed.id}`)}
            className={`pb-3 px-3 mr-4 font-display font-bold text-xs sm:text-sm tracking-widest uppercase whitespace-nowrap transition-colors relative ${activeTab === `ed-${ed.id}` ? 'text-white' : 'text-text-muted hover:text-white/80'}`}
          >
            Ed. {ed.num}
            {activeTab === `ed-${ed.id}` && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-brand-red" />}
          </button>
        ))}
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'all', label: 'All' },
          { id: 'M', label: "Men's" },
          { id: 'F', label: "Women's" }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-1.5 rounded-full text-[0.65rem] font-bold uppercase tracking-widest border transition-all ${
              activeCategory === cat.id 
                ? 'bg-white/10 border-white/20 text-white' 
                : 'border-transparent text-text-muted hover:text-white/60'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Leaderboard List */}
      <div className="flex flex-col gap-3">
        {activeTab === 'overall' && (
          overallPerformances.length > 0 ? (
            overallPerformances.map((runner, idx) => (
              <RunnerCard 
                key={runner.runnerId}
                id={runner.id}
                rank={idx + 1}
                name={runner.name}
                time={runner.time}
                pb={false}
                date={sortedEditions.find(ed => ed.id === runner.editionId)?.date || "—"}
                pace={formatPace(runner.totalSecs, distanceKm)}
                isHighlighted={highlightedId === runner.id}
              />
            ))
          ) : (
            <div className="py-24 text-center flex flex-col items-center border border-dashed border-border-subtle rounded-2xl bg-[#0d0d0d]/50">
              <CalendarDays className="w-12 h-12 text-border-subtle mb-4" />
              <div className="text-text-muted font-bold tracking-wide uppercase text-sm">No recorded runs yet</div>
            </div>
          )
        )}

        {activeTab.startsWith('ed-') && (
          (() => {
            const edId = activeTab.replace('ed-', '');
            const edEntries = entries?.filter(e => {
              const runner = getRunnerInfo(e.runnerId);
              const matchesCategory = activeCategory === 'all' || runner.gender === activeCategory;
              return e.editionId === edId && matchesCategory;
            }) || [];
            
            const finishers = edEntries.filter(e => e.status === 'ok').sort((a, b) => parseTime(a.time) - parseTime(b.time));
            const nonFinishers = edEntries.filter(e => e.status !== 'ok').sort((a, b) => (a.status > b.status ? 1 : -1));
            
            const combined = [...finishers, ...nonFinishers];
            const editionInfo = editions.find(e => e.id === edId);

            return combined.length > 0 ? (
              combined.map((entry, idx) => {
                const totalSecs = parseTime(entry.time);
                const runner = getRunnerInfo(entry.runnerId);
                const isOverallPB = overallPerformances.find(p => p.runnerId === entry.runnerId)?.time === entry.time;
                const statusLabel = entry.status === 'dns' ? 'DNS' : entry.status === 'dnf' ? 'DNF' : null;

                return (
                  <RunnerCard 
                    key={entry.id}
                    id={entry.id}
                    rank={statusLabel ? 0 : idx + 1}
                    name={runner.name}
                    time={statusLabel || entry.time}
                    pb={isOverallPB}
                    date={editionInfo?.date || "—"}
                    pace={formatPace(totalSecs, distanceKm)}
                    isHighlighted={highlightedId === entry.id}
                  />
                );
              })
            ) : (
              <div className="py-24 text-center flex flex-col items-center border border-dashed border-border-subtle rounded-2xl bg-[#0d0d0d]/50">
                <Clock className="w-12 h-12 text-border-subtle mb-4" />
                <div className="text-text-muted font-bold tracking-wide uppercase text-sm">No runners found for this category</div>
              </div>
            );
          })()
        )}
      </div>

    </div>
  );
}
