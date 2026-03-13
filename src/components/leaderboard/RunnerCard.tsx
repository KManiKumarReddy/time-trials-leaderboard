import React, { useState } from "react";
import { Share2, Check } from "lucide-react";

interface RunnerCardProps {
  id: string;
  rank: number;
  name: string;
  time: string;
  pb: boolean;
  date: string;
  pace: string;
  isHighlighted: boolean;
}

export const RunnerCard: React.FC<RunnerCardProps> = ({
  id,
  rank,
  name,
  time,
  pb,
  date,
  pace,
  isHighlighted,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = new URL(window.location.href);
    url.searchParams.set("runner", id);
    const shareUrl = url.toString();

    if (navigator.share) {
      navigator
        .share({
          title: `${name}'s Time Trial Record`,
          text: `Check out ${name}'s ${time} run at the LB Nagar Runners Time Trial!`,
          url: shareUrl,
        })
        .catch(() => copyToClipboard(shareUrl));
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPodium = rank > 0 && rank <= 3;

  const rankColors: Record<number, string> = {
    1: "text-brand-gold shadow-[0_0_20px_rgba(200,150,46,0.15)] border-brand-gold/30 bg-gradient-to-b from-brand-gold/5 to-transparent",
    2: "text-[#C0C0C0] shadow-[0_0_20px_rgba(192,192,192,0.1)] border-[#C0C0C0]/20 bg-gradient-to-b from-[#C0C0C0]/5 to-transparent",
    3: "text-[#CD7F32] shadow-[0_0_20px_rgba(205,127,50,0.1)] border-[#CD7F32]/20 bg-gradient-to-b from-[#CD7F32]/5 to-transparent",
  };

  const ringColors: Record<number, string> = {
    1: "border-brand-gold",
    2: "border-[#C0C0C0]",
    3: "border-[#CD7F32]",
  };

  return (
    <div
      id={id}
      className={`flex items-center justify-between p-3 sm:p-5 rounded-xl border transition-all group relative ${
        isHighlighted
          ? "border-brand-red bg-brand-red/5 ring-1 ring-brand-red/50 shadow-[0_0_30px_rgba(255,0,0,0.1)]"
          : isPodium
            ? `${rankColors[rank]} border-border-subtle`
            : "bg-bg-card border-border-subtle hover:bg-bg-card-hover hover:border-white/10"
      }`}
    >
      {isHighlighted && (
        <div className="absolute -top-2 -left-2 bg-brand-red text-white text-[0.5rem] font-bold px-2 py-0.5 rounded tracking-widest uppercase z-10">
          Shared Record
        </div>
      )}

      <div className="flex items-center gap-3 sm:gap-6 overflow-hidden">
        <div
          className={`font-display font-black text-2xl sm:text-4xl italic transition-transform group-hover:scale-110 w-9 sm:w-12 text-center leading-none ${isPodium ? "" : "text-text-muted/40"}`}
        >
          {rank > 0 ? rank.toString().padStart(2, "0") : "—"}
        </div>

        <div
          className={`flex w-9 h-9 sm:w-12 sm:h-12 rounded-full border-2 items-center justify-center bg-[#1a1a1a] shrink-0 ${isPodium ? ringColors[rank] : "border-[#333]"}`}
        >
          <span className="font-display font-bold text-sm sm:text-lg text-white/50">
            {name.charAt(0)}
          </span>
        </div>

        <div className="flex flex-col min-w-0">
          <div className="font-sans font-bold text-sm sm:text-lg tracking-tight text-white truncate">
            {name}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-8 text-right shrink-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 sm:gap-2 justify-end">
            <div
              className={`font-display font-black text-xl sm:text-3xl tracking-wide tabular-nums leading-none ${pb ? "text-neon-accent" : "text-white"}`}
            >
              {time}
            </div>
            {pb && (
              <div className="text-[0.4rem] sm:text-[0.6rem] font-bold bg-neon-accent/20 text-neon-accent px-1 sm:px-1.5 py-0.5 rounded tracking-widest uppercase">
                PR
              </div>
            )}
          </div>
          <div className="flex items-center justify-end gap-2 sm:gap-3 mt-1 sm:mt-1.5 text-[0.6rem] sm:text-[0.7rem] text-text-muted uppercase tracking-widest font-bold">
            <span className="hidden sm:inline">{date}</span>
            <span className="hidden sm:inline opacity-40">•</span>
            <span>
              {pace} <span className="lowercase">/km</span>
            </span>
          </div>
        </div>

        <button
          onClick={handleShare}
          className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
            copied
              ? "bg-green-500/20 text-green-400 border-green-500/50"
              : "bg-white/5 border border-white/10 text-text-muted hover:text-white hover:border-white/30"
          }`}
        >
          {copied ? <Check size={14} /> : <Share2 size={14} />}
        </button>
      </div>
    </div>
  );
};
