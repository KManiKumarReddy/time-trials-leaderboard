import React, { useRef } from "react";

interface TimeInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChange,
  disabled,
}) => {
  const [mm, ss] = (value || "").split(":");
  const minRef = useRef<HTMLInputElement>(null);
  const secRef = useRef<HTMLInputElement>(null);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 2);
    onChange(`${v}:${ss || ""}`);
    if (v.length >= 2) secRef.current?.focus();
  };

  const handleSecChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 2);
    onChange(`${mm || ""}:${v}`);
  };

  const handleSecKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && (ss === "" || ss === undefined)) {
      e.preventDefault();
      minRef.current?.focus();
    }
  };

  return (
    <div
      className={`flex items-center gap-0.5 ${disabled ? "opacity-30 pointer-events-none" : ""}`}
    >
      <input
        ref={minRef}
        inputMode="numeric"
        placeholder="00"
        value={mm || ""}
        onChange={handleMinChange}
        className="w-10 bg-[#0a0a0a] border border-[#333] rounded py-2 text-sm text-white font-mono outline-none focus:border-brand-red text-center"
      />
      <span className="text-white/40 font-mono text-lg">:</span>
      <input
        ref={secRef}
        inputMode="numeric"
        placeholder="00"
        value={ss || ""}
        onChange={handleSecChange}
        onKeyDown={handleSecKeyDown}
        className="w-10 bg-[#0a0a0a] border border-[#333] rounded py-2 text-sm text-white font-mono outline-none focus:border-brand-red text-center"
      />
    </div>
  );
};
