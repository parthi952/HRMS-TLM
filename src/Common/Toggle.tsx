import React, { useState } from 'react';
import { interactiveTheme } from "../Themes/ComponentsThems/InteractiveTheme";

interface ToggleProps {
  label?: string;
  initialState?: boolean;
  onToggle?: (state: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, initialState = false, onToggle }) => {
  const [enabled, setEnabled] = useState<boolean>(initialState);

  const handleToggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    if (onToggle) onToggle(newState);
  };

  const theme = interactiveTheme.toggle;

  return (
    <div className="flex items-center gap-3 py-2">
      {label && <span className="text-slate-600 text-[13px] font-bold">{label}</span>}
      
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={handleToggle}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300
          outline-none ring-0 border-2
          ${enabled ? `${theme.on} border-primary` : `${theme.off} border-slate-200`}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full transition-all duration-300 shadow-sm
            ${enabled ? 'translate-x-6 bg-white' : 'translate-x-1 bg-white'}
          `}
        />
      </button>
    </div>
  );
};

export default Toggle;