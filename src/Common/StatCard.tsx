import type { ElementType } from "react";
import { cardTheme } from "../Themes/ComponentsThems/CardTheme";

interface StatCardProps {
  icon: ElementType;
  label: string;
  value: number | string;
  subText?: string;
  /** Background for the whole card — defaults to white. Pass iconBgClass to tint the card to match the icon. */
  cardBgClass?: string;
  iconBgClass?: string;
  iconColorClass?: string;
  valueColorClass?: string;
}

function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  subText,
  cardBgClass = "bg-white",
  iconBgClass,
  iconColorClass,
  valueColorClass = "text-slate-900",
}: StatCardProps) {
  
  return (
    <div className={`${cardTheme.statCard} ${cardBgClass} p-5 flex items-start gap-4 group`}>
      {/* Icon Container */}
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBgClass || ""} ${iconColorClass || ""}`}
      >
        <Icon size={24} strokeWidth={2.5} />
      </div>

      {/* Text Content */}
      <div className="flex flex-col flex-1">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className={`text-[20px] font-extrabold leading-none ${valueColorClass}`}>
          {value}
        </p>
        {subText && (
          <p className="text-[11px] font-medium text-slate-300 mt-1.5">
            {subText}
          </p>
        )}
      </div>
    </div>
  );
}

export default StatCard;