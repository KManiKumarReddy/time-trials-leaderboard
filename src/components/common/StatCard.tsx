import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  highlight?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  value,
  label,
  highlight,
}) => {
  return (
    <div
      className={`p-3 sm:p-5 rounded-2xl border border-white/5 ${highlight ? "bg-brand-red/10 border-brand-red/30 relative overflow-hidden" : "bg-[#111]"}`}
    >
      {highlight && (
        <div className="absolute inset-0 bg-gradient-to-br from-brand-red/20 to-transparent pointer-events-none" />
      )}
      <div className="flex flex-col gap-1.5 sm:gap-2 relative">
        <Icon
          className={`w-4 h-4 sm:w-5 sm:h-5 ${highlight ? "text-brand-red" : "text-brand-gold"}`}
        />
        <div>
          <div className="font-display font-bold text-lg sm:text-2xl tracking-wide leading-tight truncate">
            {value || "—"}
          </div>
          <div className="text-[0.6rem] sm:text-[0.65rem] font-bold tracking-widest uppercase text-text-muted mt-0.5 sm:mt-1">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
};
