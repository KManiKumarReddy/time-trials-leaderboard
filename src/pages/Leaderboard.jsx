import { useState } from 'react';
import { Trophy, Clock, Target, CalendarDays, Activity } from 'lucide-react';

function StatCard({ icon: Icon, value, label, highlight }) {
  return (
    <div className={`p-5 rounded-2xl border border-border-subtle ${highlight ? 'bg-brand-red/10 border-brand-red/30 relative overflow-hidden' : 'bg-bg-card'}`}>
      {highlight && <div className="absolute inset-0 bg-gradient-to-br from-brand-red/20 to-transparent pointer-events-none" />}
      <div className="flex flex-col gap-2 relative">
        <Icon className={`w-5 h-5 ${highlight ? 'text-brand-red' : 'text-brand-gold'}`} />
        <div>
          <div className="font-display font-bold text-2xl tracking-wide leading-tight">{value || "—"}</div>
          <div className="text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mt-1">{label}</div>
        </div>
      </div>
    </div>
  );
}

function RunnerCard({ rank, name, time, pb, date, pace }) {
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
    <div className={`flex items-center justify-between p-4 sm:p-5 rounded-xl border border-border-subtle bg-bg-card hover:bg-bg-card-hover transition-all group ${isPodium ? rankColors[rank] : 'hover:border-white/10'}`}>
      <div className="flex items-center gap-4 sm:gap-6">
        <div className={`font-display font-black text-3xl sm:text-4xl italic transition-transform group-hover:scale-110 w-12 text-center leading-none ${isPodium ? '' : 'text-text-muted/40'}`}>
          {rank.toString().padStart(2, '0')}
        </div>
        
        {/* Placeholder avatar ring */}
        <div className={`hidden sm:flex w-12 h-12 rounded-full border-2 items-center justify-center bg-[#1a1a1a] ${isPodium ? ringColors[rank] : 'border-[#333]'}`}>
          <span className="font-display font-bold text-lg text-white/50">{name.charAt(0)}</span>
        </div>

        <div className="flex flex-col">
          <div className="font-sans font-bold text-lg tracking-tight text-white">{name}</div>
          <div className="text-xs text-text-muted tracking-wide mt-0.5">#{name.replace(/\s+/g, '').toUpperCase().slice(0, 6)}</div>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-8 text-right">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 justify-end">
            <div className={`font-display font-black text-2xl sm:text-3xl tracking-wide tabular-nums leading-none ${pb ? 'text-neon-accent' : 'text-white'}`}>
              {time}
            </div>
            {pb && <div className="text-[0.6rem] font-bold bg-neon-accent/20 text-neon-accent px-1.5 py-0.5 rounded tracking-widest uppercase mb-1">PR</div>}
          </div>
          <div className="flex items-center justify-end gap-3 mt-1.5 text-[0.7rem] text-text-muted uppercase tracking-widest font-bold">
            <span>{date}</span>
            <span className="opacity-40">•</span>
            <span>{pace} <span className="lowercase">/km</span></span>
          </div>
        </div>
        
        <button className="hidden md:block py-2 px-4 rounded-lg bg-[#222] border border-[#333] text-xs font-bold tracking-widest uppercase hover:bg-white hover:text-black transition-colors">
          View Details
        </button>
      </div>
    </div>
  );
}


export default function Leaderboard({ data }) {
  const [activeTab, setActiveTab] = useState('overall');

  // Defensive check
  if (!data) return null;

  const { config, editions, entries } = data;

  // Process data for overall standing
  const overallPerformances = {};
  entries.forEach(entry => {
    if (entry.status !== 'ok') return;
    
    // Convert time to seconds for comparison
    const [min, sec] = entry.time.split(':').map(Number);
    const totalSecs = min * 60 + sec;
    
    if (!overallPerformances[entry.name] || totalSecs < overallPerformances[entry.name].totalSecs) {
      overallPerformances[entry.name] = {
        name: entry.name,
        time: entry.time,
        totalSecs,
        editionId: entry.editionId
      };
    }
  });

  const overallSorted = Object.values(overallPerformances).sort((a, b) => a.totalSecs - b.totalSecs);
  
  const currentEditionId = editions.length > 0 ? editions[editions.length - 1].id : null;
  const currentEditionEntries = currentEditionId ? entries.filter(e => e.editionId === currentEditionId && e.status === 'ok').sort((a, b) => {
    const [aMin, aSec] = a.time.split(':').map(Number);
    const [bMin, bSec] = b.time.split(':').map(Number);
    return (aMin * 60 + aSec) - (bMin * 60 + bSec);
  }) : [];

  const courseRecord = overallSorted[0]?.time || "—";
  const recordHolder = overallSorted[0]?.name || "—";

  return (
    <div className="pb-24">
      {/* Hero Header */}
      <div className="py-12 md:py-16">
        {config.coverPhotoUrl && (
          <div className="w-full h-48 md:h-72 rounded-2xl overflow-hidden mb-10 shadow-[0_0_30px_rgba(255,255,255,0.05)] border border-border-subtle">
            <img src={config.coverPhotoUrl} alt="Cover" className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex flex-col space-y-2 mb-6">
          <div className="text-brand-red font-bold text-xs tracking-[0.2em] uppercase font-display">
            {config.season} • {config.distance} Series {config.location && `• ${config.location}`}
          </div>
          <h1 className="font-display font-black text-5xl md:text-7xl uppercase italic tracking-tighter leading-none">
            <span className="text-white">{config.club || 'Time Trial'} </span>
            <span className="text-transparent" style={{ WebkitTextStroke: '2px #f5f5f5' }}>Leaderboard</span>
          </h1>
        </div>

        {config.description && (
          <p className="max-w-2xl text-text-muted text-sm md:text-base leading-relaxed mb-6 border-l-2 border-[#333] pl-4">
            {config.description}
          </p>
        )}

        {config.googleForm && (
          <div className="mb-10">
            <a href={config.googleForm} target="_blank" rel="noopener noreferrer" className="inline-block bg-brand-red hover:bg-[#aa0000] text-white font-display font-bold px-8 py-3 rounded-lg uppercase tracking-widest transition-all text-sm shadow-[0_4px_14px_rgba(255,0,0,0.2)]">
              Register / Sign Up
            </a>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard highlight icon={Activity} value={editions.length.toString()} label="Current Edition" />
          <StatCard icon={Target} value={entries.length.toString()} label="Total Runners" />
          <StatCard icon={Clock} value={courseRecord} label="Course Record" />
          <StatCard icon={Trophy} value={recordHolder} label="Record Holder" />
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex border-b border-border-subtle mb-6 overflow-x-auto no-scrollbar mask-gradient-x">
        <button 
          onClick={() => setActiveTab('overall')}
          className={`pb-4 px-2 mr-6 font-display font-bold text-sm tracking-widest uppercase whitespace-nowrap transition-colors relative ${activeTab === 'overall' ? 'text-white' : 'text-text-muted hover:text-white/80'}`}
        >
          Overall Standings
          {activeTab === 'overall' && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-brand-red" />}
        </button>
        {editions.slice().reverse().map(ed => (
          <button 
            key={ed.id}
            onClick={() => setActiveTab(`ed-${ed.id}`)}
            className={`pb-4 px-2 mx-4 font-display font-bold text-sm tracking-widest uppercase whitespace-nowrap transition-colors relative ${activeTab === `ed-${ed.id}` ? 'text-white' : 'text-text-muted hover:text-white/80'}`}
          >
            Ed. {ed.num}
            {activeTab === `ed-${ed.id}` && <div className="absolute bottom-[-1px] left-0 w-full h-0.5 bg-brand-red" />}
          </button>
        ))}
      </div>

      {/* Leaderboard List */}
      <div className="flex flex-col gap-3">
        {activeTab === 'overall' && (
          overallSorted.length > 0 ? (
            overallSorted.map((runner, idx) => (
              <RunnerCard 
                key={runner.name}
                rank={idx + 1}
                name={runner.name}
                time={runner.time}
                pb={false}
                date={config.season}
                pace={(runner.totalSecs / 5 / 60).toFixed(2).replace('.', ':')}
              />
            ))
          ) : (
            <div className="py-24 text-center flex flex-col items-center border border-dashed border-border-subtle rounded-2xl bg-[#0d0d0d]/50">
              <CalendarDays className="w-12 h-12 text-border-subtle mb-4" />
              <div className="text-text-muted font-bold tracking-wide uppercase text-sm">No recorded runs yet</div>
            </div>
          )
        )}

        {/* Dynamic Edition Tabs */}
        {activeTab.startsWith('ed-') && (
          (() => {
            const edId = activeTab.replace('ed-', '');
            const edEntries = entries.filter(e => e.editionId === edId && e.status === 'ok').sort((a, b) => {
              const [aMin, aSec] = a.time.split(':').map(Number);
              const [bMin, bSec] = b.time.split(':').map(Number);
              return (aMin * 60 + aSec) - (bMin * 60 + bSec);
            });
            const editionInfo = editions.find(e => e.id === edId);

            return edEntries.length > 0 ? (
              edEntries.map((runner, idx) => {
                const [min, sec] = runner.time.split(':').map(Number);
                const isOverallPB = overallPerformances[runner.name]?.time === runner.time;

                return (
                  <RunnerCard 
                    key={`${runner.name}-${idx}`}
                    rank={idx + 1}
                    name={runner.name}
                    time={runner.time}
                    pb={isOverallPB}
                    date={editionInfo?.date || "—"}
                    pace={((min * 60 + sec) / 5 / 60).toFixed(2).replace('.', ':')}
                  />
                );
              })
            ) : (
              <div className="py-24 text-center flex flex-col items-center border border-dashed border-border-subtle rounded-2xl bg-[#0d0d0d]/50">
                <Clock className="w-12 h-12 text-border-subtle mb-4" />
                <div className="text-text-muted font-bold tracking-wide uppercase text-sm">No finishers recorded for this edition</div>
              </div>
            );
          })()
        )}
      </div>

    </div>
  );
}
