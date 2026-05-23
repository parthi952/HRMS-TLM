import { Check } from "lucide-react";
import { interactiveTheme } from "../Themes/ComponentsThems/InteractiveTheme";

type CheckboxProps = {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  name?: string;
  disabled?: boolean;
};

export const Checkbox = ({ label, checked, onChange, name, disabled = false }: CheckboxProps) => {
  const { checkbox } = interactiveTheme;

  return (
    <label 
      className={`inline-flex items-center gap-2.5 cursor-pointer select-none group ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          name={name}
          disabled={disabled}
        />
        <div 
          className={`w-5 h-5 rounded-md border-[1.5px] transition-all duration-200 flex items-center justify-center
            ${checked 
              ? `${checkbox.base} bg-primary border-primary shadow-sm shadow-primary/20` 
              : 'border-slate-400 bg-white group-hover:border-primary/50'
            }`}
        >
          {checked && <Check size={14} strokeWidth={3.5} className="text-white" />}
        </div>
      </div>
      {label && (
        <span className={`text-[13px] font-bold ${checked ? 'text-slate-900' : 'text-slate-400'} group-hover:text-slate-600 transition-colors`}>
          {label}
        </span>
      )}
    </label>
  );
};