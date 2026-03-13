import React, { useState, useMemo, useEffect, useRef } from "react";
import { Search, UserPlus } from "lucide-react";
import { Runner, Gender } from "../../types";

interface RunnerPickerProps {
  runners: Runner[];
  onSelect: (runnerId: string) => void;
  onAddNew: (name: string, gender: Gender) => void;
}

export const RunnerPicker: React.FC<RunnerPickerProps> = ({
  runners,
  onSelect,
  onAddNew,
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [gender, setGender] = useState<Gender>("M");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!query) return [];
    return runners
      .filter((r) => r.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5);
  }, [query, runners]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      )
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex-1" ref={dropdownRef}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            size={14}
          />
          <input
            type="text"
            placeholder="Search for a runner..."
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-brand-red outline-none"
          />
        </div>
        {isOpen &&
          query &&
          !filtered.find(
            (r) => r.name.toLowerCase() === query.toLowerCase(),
          ) && (
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
              className="bg-[#1a1a1a] border border-[#333] rounded-lg px-2 py-2 text-xs text-white outline-none focus:border-brand-red"
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          )}
      </div>

      {isOpen && (query || filtered.length > 0) && (
        <div className="absolute z-50 w-full mt-1 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {filtered.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                onSelect(r.id);
                setQuery("");
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 text-sm hover:bg-brand-red/10 hover:text-white transition-colors border-b border-white/5 last:border-0 flex justify-between items-center"
            >
              <span>{r.name}</span>
              <span className="text-[0.6rem] font-bold uppercase tracking-widest text-text-muted">
                {r.gender === "F" ? "Female" : "Male"}
              </span>
            </button>
          ))}
          {query &&
            !filtered.find(
              (r) => r.name.toLowerCase() === query.toLowerCase(),
            ) && (
              <button
                onClick={() => {
                  onAddNew(query, gender);
                  setQuery("");
                  setIsOpen(false);
                }}
                className="w-full text-left px-4 py-3 text-sm text-brand-red font-bold hover:bg-brand-red/5 transition-colors flex items-center gap-2"
              >
                <UserPlus size={14} /> Add "{query}" as{" "}
                {gender === "F" ? "Female" : "Male"}
              </button>
            )}
        </div>
      )}
    </div>
  );
};
