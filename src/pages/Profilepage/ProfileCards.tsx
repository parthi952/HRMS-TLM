import React, { useState } from "react";
import { useTheme } from "../../ThemeContext";

interface InfoCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  iconBg?: string;
  primaryColor?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({ label, value, icon, iconBg, primaryColor }) => {
  const [hovered, setHovered] = useState(false);
  const { currentPreset } = useTheme();
  const activePrimary = primaryColor || currentPreset.primaryHex;
  
  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="bg-slate-50/50 p-4 rounded-2xl border transition-all duration-200 flex gap-3 shadow-sm"
      style={{ 
        borderColor: hovered ? activePrimary : "#f1f5f9",
        boxShadow: hovered ? `0 4px 20px ${activePrimary}1a` : undefined,
        transform: hovered ? "translateY(-1px)" : undefined
      }}
    >
      {icon && (
        <div className={`p-2 rounded-xl mt-0.5 shrink-0 flex items-center justify-center h-9 w-9 ${iconBg || "bg-slate-100/80"}`}>
          {icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{label}</span>
        <span 
          className="text-xs font-bold block mt-1.5 leading-relaxed"
          style={{ color: `hsl(${currentPreset.textColor})` }}
        >
          {value}
        </span>
      </div>
    </div>
  );
};

interface StatutoryCardProps {
  label: string;
  value: string;
  primaryColor?: string;
}

export const StatutoryCard: React.FC<StatutoryCardProps> = ({ label, value, primaryColor }) => {
  const [hovered, setHovered] = useState(false);
  const { currentPreset } = useTheme();
  const activePrimary = primaryColor || currentPreset.primaryHex;

  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex justify-between items-center text-xs font-bold bg-slate-50/50 border p-4 rounded-2xl transition-all duration-200 shadow-sm"
      style={{ 
        borderColor: hovered ? activePrimary : "#f1f5f9",
        boxShadow: hovered ? `0 4px 20px ${activePrimary}1a` : undefined,
        transform: hovered ? "translateY(-1px)" : undefined
      }}
    >
      <span className="text-slate-450 uppercase text-[9px] tracking-wider font-black">{label}</span>
      <span 
        className="tracking-wider font-bold truncate max-w-[60%]"
        style={{ color: `hsl(${currentPreset.textColor})` }}
      >
        {value}
      </span>
    </div>
  );
};
