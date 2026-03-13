import { Target, Users, Medal, Crown, ExternalLink } from "lucide-react";
import { RunnerCard } from "../components/leaderboard/RunnerCard";
import { StatCard } from "../components/common/StatCard";
import { AppData } from "../types";
import { parseTimeToSeconds, formatPace } from "../utils/time";
import { useLeaderboard } from "../hooks/useLeaderboard";

export default function Leaderboard({ data }: { data: AppData }) {
  const {
    activeTab,
    setActiveTab,
    activeCategory,
    setActiveCategory,
    highlightedId,
    sortedEditions,
    overallPerformances,
    currentEntries,
    stats,
    distanceKm,
  } = useLeaderboard(data);

  if (!data) return null;
  const { runners } = data;

  const getRunnerInfo = (id: string) => {
    const r = runners.find((r) => r.id === id);
    return { name: r?.name || "Unknown", gender: r?.gender || "M" };
  };

  const courseRecord = overallPerformances[0];
  const recordHolderName = courseRecord
    ? runners.find((r) => r.id === courseRecord.id)?.name
    : "—";

  const descriptionText =
    data.config.description?.trim() ||
    "Track latest time trial performances, compare personal bests, and see who leads the pack this season.";

  const heroTagline =
    data.config.season && data.config.club
      ? `${data.config.club} • ${data.config.season}`
      : "Latest time trial leaderboard";

  const eventFacts = [
    { label: "Distance", value: data.config.distance },
    { label: "Location", value: data.config.location },
  ];

  return (
    <div className="py-6 sm:py-12 space-y-8 sm:space-y-12 pb-20">
      {/* Hero + Stats */}
      <div className="space-y-6">
        <div className="relative rounded-4xl overflow-hidden bg-black border border-white/10 shadow-2xl group">
          {/* Background cover */}
          <div className="relative h-96 flex items-center justify-center overflow-hidden">
            {data.config.coverPhotoUrl ? (
              <>
                <div
                  className="absolute inset-0 opacity-40 blur-3xl scale-125"
                  style={{
                    backgroundImage: `url(${data.config.coverPhotoUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <img
                  src={data.config.coverPhotoUrl}
                  alt="Time Trials Cover"
                  className="relative z-10 h-full w-auto object-contain"
                />
              </>
            ) : (
              <div className="w-full h-full bg-linearinea-to-br from-brand-red/10 to-transparent" />
            )}
          </div>

          <div className="inset-0 z-30 flex flex-col justify-end p-6 sm:p-10">
            <div className="max-w-4xl">
              <h1 className="font-display font-black text-4xl sm:text-7xl uppercase tracking-tighter italic leading-none">
                <span className="text-brand-red">Leader</span>board
              </h1>
              <p className="mt-4 text-sm sm:text-base text-white/70 max-w-2xl leading-relaxed">
                {heroTagline}
              </p>

              <div className="mt-5 flex flex-wrap gap-2 text-[0.7rem] sm:text-sm text-white/70">
                {eventFacts.map((fact) => (
                  <div
                    key={fact.label}
                    className="inline-flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full"
                  >
                    <span className="font-bold text-white/90">
                      {fact.label}:
                    </span>
                    <span className="text-white/70">{fact.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {data.config.googleForm && (
              <div className="mt-6">
                <a
                  href={data.config.googleForm}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-brand-red hover:bg-brand-red-dark text-white px-7 py-3 rounded-2xl font-display font-black uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95"
                >
                  Register Now <ExternalLink size={18} />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Key stats */}
        <div className="grid gap-8 items-start">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#111] border border-white/5 rounded-2xl p-6 sm:p-8">
              <h3 className="text-text-muted text-[0.6rem] font-bold uppercase tracking-[0.2em] mb-4">
                About the Event
              </h3>
              <p className="text-text-muted text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {descriptionText}
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              <StatCard icon={Users} value={stats.runners} label="Runners" />
              <StatCard icon={Target} value={stats.avg} label="Average Pace" />
              <StatCard
                icon={Medal}
                value={courseRecord?.time || "—"}
                label="Course Record"
                highlight
              />
              <StatCard
                icon={Crown}
                value={recordHolderName || "—"}
                label="Record Holder"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-end border-b border-border-subtle pb-px">
          <div className="flex gap-4 sm:gap-8 overflow-x-auto no-scrollbar pt-2 px-1">
            <button
              onClick={() => setActiveTab("overall")}
              className={`pb-4 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all relative shrink-0 ${activeTab === "overall" ? "text-brand-red" : "text-text-muted hover:text-white"}`}
            >
              All-Time Records
              {activeTab === "overall" && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-red rounded-t-full shadow-[0_-2px_10px_rgba(255,0,0,0.5)]" />
              )}
            </button>
            {sortedEditions.map((ed) => (
              <button
                key={ed.id}
                onClick={() => setActiveTab(ed.id)}
                className={`pb-4 text-xs sm:text-sm font-bold uppercase tracking-widest transition-all relative shrink-0 ${activeTab === ed.id ? "text-brand-red" : "text-text-muted hover:text-white"}`}
              >
                Edition {ed.num}
                {activeTab === ed.id && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-brand-red rounded-t-full shadow-[0_-2px_10px_rgba(255,0,0,0.5)]" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          {(["all", "M", "F"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-[0.65rem] font-black uppercase tracking-widest border transition-all ${activeCategory === cat ? "bg-brand-red border-brand-red text-white" : "bg-transparent border-white/10 text-text-muted hover:border-white/20"}`}
            >
              {cat === "all" ? "Overall" : cat === "M" ? "Men's" : "Women's"}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="space-y-3">
        {activeTab === "overall"
          ? overallPerformances.map((perf, idx) => (
              <RunnerCard
                key={perf.id}
                id={perf.id}
                rank={idx + 1}
                name={getRunnerInfo(perf.id).name}
                time={perf.time}
                date={perf.date}
                pace={formatPace(perf.secs, distanceKm)}
                pb={true}
                isHighlighted={highlightedId === perf.id}
              />
            ))
          : currentEntries.map((entry, idx) => {
              const runner = getRunnerInfo(entry.runnerId);
              const secs = parseTimeToSeconds(entry.time);
              return (
                <RunnerCard
                  key={entry.id}
                  id={entry.runnerId}
                  rank={entry.status === "ok" ? idx + 1 : 0}
                  name={runner.name}
                  time={
                    entry.status === "ok"
                      ? entry.time
                      : entry.status.toUpperCase()
                  }
                  date=""
                  pace={formatPace(secs, distanceKm)}
                  pb={false}
                  isHighlighted={highlightedId === entry.runnerId}
                />
              );
            })}
      </div>
    </div>
  );
}
