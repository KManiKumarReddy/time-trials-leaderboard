import React from "react";
import { Trash2, AlertCircle } from "lucide-react";
import { Entry, Runner } from "../../types";
import { TimeInput } from "../common/TimeInput";

interface EntryRowProps {
  entry: Entry;
  runner: Runner;
  onTimeChange: (val: string) => void;
  onToggleDnf: () => void;
  onDelete: () => void;
}

export const EntryRow: React.FC<EntryRowProps> = ({
  entry,
  runner,
  onTimeChange,
  onToggleDnf,
  onDelete,
}) => {
  const isDnf = entry.status === "dnf";
  const isOk = entry.status === "ok";

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center bg-[#0a0a0a] border border-[#222] p-3 rounded-xl transition-all hover:border-brand-red/20 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-white font-bold text-sm truncate">
            {runner?.name || "Unknown"}
          </div>
          <span className="text-[0.6rem] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-text-muted font-black">
            {runner?.gender || "M"}
          </span>
        </div>
        <div className="text-[0.6rem] text-text-muted uppercase tracking-widest font-bold mt-0.5">
          {isOk ? "Finished" : isDnf ? "DNF" : "DNS"}
        </div>
      </div>
      <div className="flex gap-4 items-center self-end sm:self-auto">
        <div className="flex items-center gap-3">
          <TimeInput
            value={entry.time}
            onChange={onTimeChange}
            disabled={isDnf}
          />
          <div className="h-8 w-px bg-[#333] hidden sm:block" />
          <div className="flex items-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleDnf();
              }}
              className={`px-4 py-1.5 rounded-lg text-[0.6rem] font-bold tracking-widest uppercase transition-all flex items-center gap-2 border ${isDnf ? "bg-orange-600 border-orange-500 text-white shadow-[0_0_15px_rgba(234,88,12,0.3)]" : "bg-[#0a0a0a] border-[#333] text-text-muted hover:text-white"}`}
            >
              <AlertCircle size={12} /> DNF
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-[#555] hover:text-brand-red p-2 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
