import { Filter } from "lucide-react";
import { badgeTheme } from "../Themes/ComponentsThems/BadgeTheme";

interface StageFilterProps {
  stages: string[];
  selectedStage: string;
  onStageChange: (stage: string) => void;
  counts: Record<string, number>;
  totalCount: number;
  showClear?: boolean;
  className?: string;
}

const StageFilter = ({
  stages,
  selectedStage,
  onStageChange,
  counts,
  totalCount,
  showClear = true,
  className = "mb-6"
}: StageFilterProps) => {
  const { pill } = badgeTheme;

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      {/* ALL Button */}
      <button
        onClick={() => onStageChange("")}
        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-[1.5px] text-xs font-black transition-all cursor-pointer ${
          selectedStage === ""
            ? pill.active
            : pill.inactive
        }`}
      >
        All
        <span
          className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
            selectedStage === "" ? pill.activeCount : pill.inactiveCount
          }`}
        >
          {totalCount}
        </span>
      </button>

      {/* Individual Stage Buttons */}
      {stages.map((s) => (
        <button
          key={s}
          onClick={() => onStageChange(selectedStage === s ? "" : s)}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-[1.5px] text-xs font-black transition-all cursor-pointer ${
            selectedStage === s
              ? pill.active
              : pill.inactive
          }`}
        >
          {s}
          <span
            className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
              selectedStage === s ? pill.activeCount : pill.inactiveCount
            }`}
          >
            {counts[s] || 0}
          </span>
        </button>
      ))}

      {/* Clear Filter */}
      {showClear && selectedStage && (
        <button
          onClick={() => onStageChange("")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-[1.5px] border-dashed border-slate-200 bg-transparent text-[11px] font-bold text-slate-400 cursor-pointer transition-colors hover:text-rose-500 hover:border-rose-300"
        >
          <Filter size={11} /> Clear
        </button>
      )}
    </div>
  );
};

export default StageFilter;
