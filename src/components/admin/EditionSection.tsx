import React from "react";
import { Trash2, PlusCircle } from "lucide-react";
import { Edition, Entry, Runner, Gender } from "../../types";
import { RunnerPicker } from "./RunnerPicker";
import { EntryRow } from "./EntryRow";

interface EditionSectionProps {
  edition: Edition;
  entries: Entry[];
  runners: Runner[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDeleteEdition: () => void;
  onUpdateEdition: (field: keyof Edition, value: any) => void;
  onAddEntry: (runnerId: string) => void;
  onAddNewRunner: (name: string, gender: Gender) => void;
  onUpdateEntry: (id: string, field: keyof Entry, value: any) => void;
  onToggleDnf: (id: string) => void;
  onDeleteEntry: (id: string) => void;
}

export const EditionSection: React.FC<EditionSectionProps> = ({
  edition,
  entries,
  runners,
  isExpanded,
  onToggleExpand,
  onDeleteEdition,
  onUpdateEdition,
  onAddEntry,
  onAddNewRunner,
  onUpdateEntry,
  onToggleDnf,
  onDeleteEntry,
}) => {
  return (
    <div className="bg-[#111] border border-[#333] rounded-2xl overflow-hidden shadow-lg transition-all hover:border-white/10">
      <div
        className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer transition-colors ${isExpanded ? "bg-white/5" : "hover:bg-white-[0.02]"}`}
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-4">
          <div className="bg-[#0a0a0a] border border-[#333] px-3 py-1.5 rounded-lg text-brand-red font-display font-black text-xl">
            {edition.num}
          </div>
          <div>
            <div className="text-white font-bold text-sm sm:text-base">
              Edition {edition.num}
            </div>
            <div className="text-text-muted text-[0.65rem] sm:text-xs uppercase tracking-widest font-bold">
              {edition.date || "No Date"} • {entries.length} Entries
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteEdition();
            }}
            className="text-[#444] hover:text-brand-red p-2 transition-colors"
          >
            <Trash2 size={16} />
          </button>
          <div
            className={`text-text-muted transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
          >
            <PlusCircle size={20} />
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-6 bg-[#0c0c0c] border-t border-[#333] space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-2 gap-4 pb-6 border-b border-white/5">
            <div>
              <label className="block text-[0.6rem] font-bold tracking-widest uppercase text-text-muted mb-2">
                Event Date
              </label>
              <input
                type="date"
                value={edition.date}
                onChange={(e) => onUpdateEdition("date", e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-red"
              />
            </div>
            <div>
              <label className="block text-[0.6rem] font-bold tracking-widest uppercase text-text-muted mb-2">
                Location
              </label>
              <input
                type="text"
                value={edition.location}
                onChange={(e) => onUpdateEdition("location", e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-brand-red"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-[0.65rem] font-bold tracking-widest uppercase text-text-muted">
              Runner Logs
            </div>
            <div className="flex flex-col sm:flex-row gap-3 bg-[#111] p-3 rounded-xl border border-[#222]">
              <RunnerPicker
                runners={runners}
                onSelect={onAddEntry}
                onAddNew={onAddNewRunner}
              />
            </div>

            <div className="space-y-2">
              {entries.map((entry) => (
                <EntryRow
                  key={entry.id}
                  entry={entry}
                  runner={runners.find((r) => r.id === entry.runnerId)!}
                  onTimeChange={(val) => onUpdateEntry(entry.id, "time", val)}
                  onToggleDnf={() => onToggleDnf(entry.id)}
                  onDelete={() => onDeleteEntry(entry.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
